document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    // Reemplaza con tu usuario y nombre de repositorio
    const GITHUB_USER = 'moc3pnj';
    const GITHUB_REPO = 'bd';
    const FILE_PATH = 'data.js';
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

    // --- VARIABLES GLOBALES ---
    let githubToken = null;

    // --- ELEMENTOS DEL DOM ---
    const btnOkKey = document.getElementById('btn-ok-key');
    const btnLoad = document.getElementById('btn-load');
    const btnAdd = document.getElementById('btn-add');
    const btnUpdate = document.getElementById('btn-update');
    const form = document.getElementById('movie-form');
    const statusMessage = document.getElementById('status-message');

    // --- EVENT LISTENERS ---

    // Guarda el token de GitHub
    btnOkKey.addEventListener('click', () => {
        const keyInput = document.getElementById('github-key');
        if (keyInput.value) {
            githubToken = keyInput.value;
            statusMessage.textContent = '✅ Token guardado temporalmente.';
            statusMessage.style.color = '#28a745';
        } else {
            statusMessage.textContent = '❌ Por favor, ingresa un token.';
            statusMessage.style.color = '#dc3545';
        }
    });

    // Carga los datos de una película existente en el formulario
    btnLoad.addEventListener('click', async () => {
        const id = document.getElementById('id').value;
        if (!id) {
            showStatus('Por favor, introduce un ID para cargar.', 'error');
            return;
        }

        try {
            showStatus('Cargando datos...', 'info');
            const { content } = await getFileContent();
            const movies = parseDBContent(content);
            const movie = movies.find(m => String(m.id) === String(id));

            if (movie) {
                document.getElementById('nombre').value = movie.nombre;
                document.getElementById('año').value = movie.año;
                document.getElementById('categoria').value = movie.categoria;
                document.getElementById('tipo').value = movie.tipo;
                document.getElementById('portada').value = movie.Portada;
                document.getElementById('link').value = movie.link;
                showStatus('Datos cargados correctamente.', 'success');
            } else {
                showStatus(`No se encontró ninguna película con el ID: ${id}`, 'error');
            }
        } catch (error) {
            showStatus(`Error al cargar los datos: ${error.message}`, 'error');
        }
    });

    // Agrega una nueva película
    btnAdd.addEventListener('click', async () => {
        if (!isFormValid()) return;

        try {
            showStatus('Agregando película...', 'info');
            const { content, sha } = await getFileContent();
            let movies = parseDBContent(content);
            
            const newMovie = getFormData();
            
            if (movies.some(m => String(m.id) === String(newMovie.id))) {
                 showStatus(`El ID ${newMovie.id} ya existe. Usa un ID diferente.`, 'error');
                 return;
            }

            movies.push(newMovie);
            const newContent = formatDBContent(movies);

            await updateFileInGitHub(newContent, 'feat: add new movie', sha);
            showStatus('Película agregada con éxito.', 'success');
            form.reset();

        } catch (error) {
            showStatus(`Error al agregar la película: ${error.message}`, 'error');
        }
    });

    // Actualiza una película existente
    btnUpdate.addEventListener('click', async () => {
        if (!isFormValid()) return;
        
        try {
            showStatus('Actualizando película...', 'info');
            const { content, sha } = await getFileContent();
            let movies = parseDBContent(content);
            const updatedMovie = getFormData();
            
            const movieIndex = movies.findIndex(m => String(m.id) === String(updatedMovie.id));

            if (movieIndex === -1) {
                showStatus(`No se encontró película con ID ${updatedMovie.id} para actualizar.`, 'error');
                return;
            }

            movies[movieIndex] = updatedMovie;
            const newContent = formatDBContent(movies);

            await updateFileInGitHub(newContent, `fix: update movie id ${updatedMovie.id}`, sha);
            showStatus('Película actualizada con éxito.', 'success');
            form.reset();

        } catch (error) {
            showStatus(`Error al actualizar la película: ${error.message}`, 'error');
        }
    });

    // --- FUNCIONES AUXILIARES ---

    // Obtiene el contenido actual del archivo desde GitHub
    async function getFileContent() {
        if (!githubToken) throw new Error('El token de GitHub no ha sido configurado.');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }
        return response.json();
    }

    // Actualiza el archivo en el repositorio de GitHub
    async function updateFileInGitHub(newContent, commitMessage, sha) {
        if (!githubToken) throw new Error('El token de GitHub no ha sido configurado.');
        
        const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: encodedContent,
                sha: sha
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al actualizar el archivo: ${errorData.message}`);
        }
        return response.json();
    }
    
    // Parsea el contenido del archivo `data.js` para obtener el array de películas
    function parseDBContent(base64Content) {
        const decodedContent = decodeURIComponent(escape(atob(base64Content)));
        // Asume que el archivo tiene el formato `const data = [...]` o `var data = [...]`
        const jsonString = decodedContent.substring(decodedContent.indexOf('['));
        return JSON.parse(jsonString);
    }

    // Formatea el array de películas de nuevo al formato del archivo `data.js`
    function formatDBContent(moviesArray) {
        // Formateamos el JSON para que sea legible (pretty-print con 2 espacios)
        const jsonString = JSON.stringify(moviesArray, null, 2);
        // Volvemos a añadir la asignación de la variable para que el archivo siga siendo un script JS válido
        return `const data = ${jsonString};`;
    }

    // Recolecta los datos del formulario y los devuelve como un objeto
    function getFormData() {
        return {
            id: document.getElementById('id').value,
            nombre: document.getElementById('nombre').value,
            año: parseInt(document.getElementById('año').value, 10),
            categoria: document.getElementById('categoria').value,
            tipo: document.getElementById('tipo').value,
            Portada: document.getElementById('portada').value,
            link: document.getElementById('link').value
        };
    }

    // Valida que todos los campos del formulario estén llenos
    function isFormValid() {
        if (!form.checkValidity()) {
            showStatus('Por favor, completa todos los campos requeridos.', 'error');
            return false;
        }
        if (!githubToken) {
            showStatus('Primero debes ingresar y confirmar tu token de GitHub.', 'error');
            return false;
        }
        return true;
    }

    // Muestra un mensaje de estado al usuario
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        switch (type) {
            case 'success':
                statusMessage.style.color = '#28a745'; // verde
                break;
            case 'error':
                statusMessage.style.color = '#dc3545'; // rojo
                break;
            default:
                statusMessage.style.color = '#007bff'; // azul
        }
    }
});

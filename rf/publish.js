// --- ELEMENTOS DEL DOM PARA PUBLICAR ---
const publishButton = document.getElementById('publish-button');
const outputCodeElementForPublish = document.getElementById('output-code');

// --- CONSTANTES DE LA API DE GITHUB ---
const GITHUB_API_URL = 'https://api.github.com/repos/MOC3PNJ/moc3pnj.github.io/contents/bd/data.js';
const REPO_OWNER = 'moc3pnj';
const REPO_NAME = 'moc3pnj.github.io';
const FILE_PATH = 'bd/data.js';

// --- EVENTO DEL BOTÓN PUBLICAR ---
publishButton.addEventListener('click', async () => {
    // 1. Pedir el Token de Acceso Personal (PAT)
    const githubToken = prompt("Por favor, introduce tu GitHub Personal Access Token (PAT):");
    if (!githubToken) {
        alert("Operación cancelada. No se introdujo ningún token.");
        return;
    }

    // 2. Pedir un mensaje para el commit
    const commitMessage = prompt("Introduce un mensaje para este cambio (ej: 'Actualización de lista de películas'):", "Actualización de base de datos de películas");
    if (!commitMessage) {
        alert("Operación cancelada. Se requiere un mensaje de commit.");
        return;
    }

    const fileContent = outputCodeElementForPublish.textContent;
    if (!fileContent) {
        alert("No hay código generado para publicar.");
        return;
    }

    // 3. Iniciar el proceso de publicación
    try {
        await updateGithubFile(githubToken, commitMessage, fileContent);
        alert("¡Éxito! El archivo data.js ha sido actualizado en GitHub.");
    } catch (error) {
        console.error('Error al publicar en GitHub:', error);
        alert(`Hubo un error al publicar el archivo: ${error.message}`);
    }
});

/**
 * Función principal para actualizar el archivo en GitHub.
 * @param {string} token - El PAT de GitHub.
 * @param {string} message - El mensaje del commit.
 * @param {string} content - El contenido del archivo a subir.
 */
async function updateGithubFile(token, message, content) {
    // Para actualizar un archivo, GitHub necesita el "SHA" del archivo actual.
    // Primero, obtenemos la información del archivo para conseguir ese SHA.
    const fileInfo = await getFileSHA(token);

    // GitHub requiere que el contenido del archivo esté codificado en Base64.
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // Ahora, hacemos la petición PUT para actualizar el archivo.
    const response = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,         // El mensaje del commit
            content: encodedContent,  // El nuevo contenido en Base64
            sha: fileInfo.sha         // El SHA del archivo que estamos reemplazando
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message}`);
    }

    return await response.json();
}

/**
 * Obtiene el SHA del archivo actual desde GitHub.
 * @param {string} token - El PAT de GitHub.
 */
async function getFileSHA(token) {
    const response = await fetch(GITHUB_API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status} al obtener SHA: ${errorData.message}`);
    }

    return await response.json();
}

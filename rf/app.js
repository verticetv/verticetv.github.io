import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

// --- ELEMENTOS DEL DOM ---
const form = document.getElementById('add-form');
const idInput = document.getElementById('id');
const nombreInput = document.getElementById('nombre');
const outputContainer = document.getElementById('output-container');
const outputCodeElement = document.getElementById('output-code');
const submitButton = form.querySelector('button[type="submit"]');
const listaContainer = document.getElementById('lista-container');

// --- ESTADO DE LA APLICACIÓN ---
let peliculasLocales = [...peliculas];
let enModoEdicion = false;
let idEnEdicion = null;

// --- FUNCIONES ---

/**
 * Muestra la lista de películas en el DOM, añadiendo un botón de editar a cada una.
 */
function renderizarLista() {
    listaContainer.innerHTML = ''; // Limpiar lista antes de redibujar

    peliculasLocales.forEach(pelicula => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-pelicula';

        const itemName = document.createElement('span');
        itemName.textContent = `${pelicula.nombre} (${pelicula.año})`;
        
        const editButton = document.createElement('button');
        editButton.className = 'btn-editar';
        editButton.innerHTML = '✏️'; // Emoji de lápiz
        editButton.setAttribute('data-id', pelicula.id);
        editButton.setAttribute('aria-label', `Editar ${pelicula.nombre}`);

        editButton.addEventListener('click', () => iniciarEdicion(pelicula.id));
        
        itemDiv.appendChild(itemName);
        itemDiv.appendChild(editButton);
        listaContainer.appendChild(itemDiv);
    });
}

/**
 * Prepara el formulario para editar un ítem.
 * @param {string} id - El ID de la película a editar.
 */
function iniciarEdicion(id) {
    const peliculaAEditar = peliculasLocales.find(p => p.id === id);
    if (!peliculaAEditar) return;

    enModoEdicion = true;
    idEnEdicion = id;

    // Llenar el formulario con los datos existentes
    form.id.value = peliculaAEditar.id;
    form.nombre.value = peliculaAEditar.nombre;
    form.año.value = peliculaAEditar.año;
    form.categoria.value = peliculaAEditar.categoria;
    form.tipo.value = peliculaAEditar.tipo;
    form.portada.value = peliculaAEditar.portada;
    form.link.value = peliculaAEditar.link;

    // Cambiar el botón a "Actualizar"
    submitButton.textContent = 'Actualizar';
    submitButton.classList.add('actualizar');

    form.scrollIntoView({ behavior: 'smooth' });
    nombreInput.focus();
}

/**
 * Resetea el formulario al estado inicial para añadir un nuevo ítem.
 */
function resetearFormulario() {
    enModoEdicion = false;
    idEnEdicion = null;
    
    form.reset();
    
    submitButton.textContent = 'Añadir';
    submitButton.classList.remove('actualizar');
    
    actualizarSiguienteId();
    nombreInput.focus();
}

/**
 * Calcula el siguiente ID disponible.
 */
function actualizarSiguienteId() {
    const ultimoItem = peliculasLocales.length > 0 ? peliculasLocales[peliculasLocales.length - 1] : { id: '0000' };
    const siguienteIdNumero = parseInt(ultimoItem.id, 10) + 1;
    idInput.value = String(siguienteIdNumero).padStart(4, '0');
}

/**
 * Genera el string de código del archivo `data.js` a partir de la lista.
 */
function generarCodigo(listaCompleta) {
    let codigo = 'const peliculas = [\n';
    listaCompleta.forEach((item, index) => {
        const itemString = JSON.stringify(item, null, 2).replace(/"([^"]+)":/g, '$1:');
        codigo += `  ${itemString}`;
        if (index < listaCompleta.length - 1) {
            codigo += ',\n';
        } else {
            codigo += '\n';
        }
    });
    codigo += '];\n\n';
    codigo += 'export { peliculas };';
    return codigo;
}

// --- EVENTO PRINCIPAL DEL FORMULARIO ---

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    if (enModoEdicion) {
        // --- LÓGICA DE ACTUALIZACIÓN ---
        const peliculaActualizada = {
            id: idEnEdicion,
            nombre: formData.get('nombre'),
            año: parseInt(formData.get('año'), 10),
            categoria: formData.get('categoria'),
            tipo: formData.get('tipo'),
            portada: formData.get('portada'),
            link: formData.get('link'),
        };
        const index = peliculasLocales.findIndex(p => p.id === idEnEdicion);
        if (index !== -1) {
            peliculasLocales[index] = peliculaActualizada;
        }
    } else {
        // --- LÓGICA DE AÑADIR ---
        const nuevaPelicula = {
            id: formData.get('id'),
            nombre: formData.get('nombre'),
            año: parseInt(formData.get('año'), 10),
            categoria: formData.get('categoria'),
            tipo: formData.get('tipo'),
            portada: formData.get('portada'),
            link: formData.get('link'),
        };
        peliculasLocales.push(nuevaPelicula);
    }
    
    // Pasos finales comunes para añadir y actualizar
    const codigoGenerado = generarCodigo(peliculasLocales);
    outputCodeElement.textContent = codigoGenerado;
    outputContainer.style.display = 'block';
    
    renderizarLista();
    resetearFormulario();
    
    outputContainer.scrollIntoView({ behavior: 'smooth' });
});

// --- EJECUCIÓN INICIAL ---
// Al cargar la página, se muestra la lista y se prepara el formulario.
document.addEventListener('DOMContentLoaded', () => {
    renderizarLista();
    resetearFormulario();
});

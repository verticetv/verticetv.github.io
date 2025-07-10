import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

// --- ELEMENTOS DEL DOM ---
const form = document.getElementById('add-form');
const idInput = document.getElementById('id');
const nombreInput = document.getElementById('nombre');
const outputContainer = document.getElementById('output-container');
const outputCodeElement = document.getElementById('output-code');
const submitButton = form.querySelector('button[type="submit"]');
const listaContainer = document.getElementById('lista-container');
const copyButton = document.getElementById('copy-button');

// --- ESTADO DE LA APLICACIÓN ---
let peliculasLocales = [...peliculas];
let enModoEdicion = false;
let idEnEdicion = null;

// --- FUNCIONES ---

/**
 * Muestra la lista de películas en el DOM, añadiendo botones de editar y eliminar.
 */
function renderizarLista() {
    listaContainer.innerHTML = '';

    peliculasLocales.forEach(pelicula => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-pelicula';

        const itemName = document.createElement('span');
        itemName.className = 'item-pelicula-info';
        itemName.textContent = `${pelicula.nombre} (${pelicula.año})`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-pelicula-actions';

        // Botón de Editar
        const editButton = document.createElement('button');
        editButton.className = 'btn-icono btn-editar';
        editButton.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        editButton.setAttribute('aria-label', `Editar ${pelicula.nombre}`);
        editButton.addEventListener('click', () => iniciarEdicion(pelicula.id));

        // Botón de Eliminar
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-icono btn-eliminar';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteButton.setAttribute('aria-label', `Eliminar ${pelicula.nombre}`);
        deleteButton.addEventListener('click', () => eliminarPelicula(pelicula.id));
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        itemDiv.appendChild(itemName);
        itemDiv.appendChild(actionsDiv);
        listaContainer.appendChild(itemDiv);
    });
}

/**
 * Prepara el formulario para editar un ítem.
 */
function iniciarEdicion(id) {
    const peliculaAEditar = peliculasLocales.find(p => p.id === id);
    if (!peliculaAEditar) return;

    enModoEdicion = true;
    idEnEdicion = id;

    form.id.value = peliculaAEditar.id;
    form.nombre.value = peliculaAEditar.nombre;
    form.año.value = peliculaAEditar.año;
    form.categoria.value = peliculaAEditar.categoria;
    form.tipo.value = peliculaAEditar.tipo;
    form.portada.value = peliculaAEditar.portada;
    form.link.value = peliculaAEditar.link;

    submitButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Actualizar';
    submitButton.classList.add('actualizar');

    form.scrollIntoView({ behavior: 'smooth' });
    nombreInput.focus();
}

/**
 * Elimina una película de la lista.
 */
function eliminarPelicula(id) {
    const peliculaAEliminar = peliculasLocales.find(p => p.id === id);
    if (!peliculaAEliminar) return;

    // Pedimos confirmación al usuario
    const confirmar = confirm(`¿Estás seguro de que quieres eliminar "${peliculaAEliminar.nombre}"?`);

    if (confirmar) {
        peliculasLocales = peliculasLocales.filter(p => p.id !== id);
        
        // Actualizamos la vista
        renderizarLista();
        const codigoGenerado = generarCodigo(peliculasLocales);
        outputCodeElement.textContent = codigoGenerado;
        outputContainer.style.display = 'block';
        resetearFormulario(); // Para asegurar que el siguiente ID es correcto
    }
}

/**
 * Resetea el formulario al estado inicial.
 */
function resetearFormulario() {
    enModoEdicion = false;
    idEnEdicion = null;
    form.reset();
    submitButton.innerHTML = '<i class="fa-solid fa-plus"></i> Añadir';
    submitButton.classList.remove('actualizar');
    actualizarSiguienteId();
    nombreInput.focus();
}

/**
 * Calcula el siguiente ID disponible.
 */
function actualizarSiguienteId() {
    if (peliculasLocales.length === 0) {
        idInput.value = '0001';
        return;
    }
    // Ordenamos por ID para asegurar que el último es el más alto
    peliculasLocales.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const ultimoItem = peliculasLocales[peliculasLocales.length - 1];
    const siguienteIdNumero = parseInt(ultimoItem.id, 10) + 1;
    idInput.value = String(siguienteIdNumero).padStart(4, '0');
}

/**
 * Genera el string de código del archivo `data.js`.
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

// --- EVENTOS ---

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    if (enModoEdicion) {
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
    
    const codigoGenerado = generarCodigo(peliculasLocales);
    outputCodeElement.textContent = codigoGenerado;
    outputContainer.style.display = 'block';
    
    renderizarLista();
    resetearFormulario();
    
    outputContainer.scrollIntoView({ behavior: 'smooth' });
});

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(outputCodeElement.textContent).then(() => {
        // Feedback para el usuario
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000); // Vuelve al texto original después de 2 segundos
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
    });
});

// --- EJECUCIÓN INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarLista();
    resetearFormulario();
});

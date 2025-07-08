import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

// --- ELEMENTOS DEL DOM ---
const form = document.getElementById('add-form');
const idInput = document.getElementById('id');
const outputContainer = document.getElementById('output-container');
const outputCodeElement = document.getElementById('output-code');

// --- LÓGICA PRINCIPAL ---

// 1. Calcular el siguiente ID
const lastItem = peliculas[peliculas.length - 1];
const nextIdNumber = parseInt(lastItem.id, 10) + 1;
const nextIdString = String(nextIdNumber).padStart(4, '0'); // Formato "0000"

// 2. Asignar el nuevo ID al campo del formulario
idInput.value = nextIdString;

// 3. Escuchar el evento de envío del formulario
form.addEventListener('submit', (event) => {
    // Prevenimos que la página se recargue
    event.preventDefault();

    // Creamos un objeto FormData para obtener fácilmente los valores
    const formData = new FormData(form);

    // Creamos el nuevo objeto de película con los datos del formulario
    const nuevaPelicula = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        // Convertimos el año a número
        año: parseInt(formData.get('año'), 10), 
        categoria: formData.get('categoria'),
        tipo: formData.get('tipo'),
        portada: formData.get('portada'),
        link: formData.get('link'),
    };

    // 4. Generar el nuevo string de código para mostrar
    const codigoGenerado = generarCodigo(nuevaPelicula);

    // 5. Mostrar el resultado
    outputCodeElement.textContent = codigoGenerado;
    outputContainer.style.display = 'block';
    
    // Opcional: Hacer scroll para que el usuario vea el resultado
    outputContainer.scrollIntoView({ behavior: 'smooth' });
});

/**
 * Genera el string completo del archivo data.js con el nuevo elemento añadido.
 * @param {object} nuevoItem - El objeto de la nueva película/serie a añadir.
 * @returns {string} El código formateado para copiar y pegar.
 */
function generarCodigo(nuevoItem) {
    let codigo = 'const peliculas = [\n';

    const todosLosItems = [...peliculas, nuevoItem];

    todosLosItems.forEach((item, index) => {
        // Usamos JSON.stringify con un replacer y espaciado para un formato bonito
        // y nos aseguramos de que las claves no tengan comillas.
        const itemString = JSON.stringify(item, null, 2)
                               .replace(/"([^"]+)":/g, '$1:'); // Quita comillas de las claves

        codigo += `  ${itemString}`;
        
        // Añadir coma si no es el último elemento
        if (index < todosLosItems.length - 1) {
            codigo += ',\n';
        } else {
            codigo += '\n';
        }
    });

    codigo += '];\n\n';
    codigo += 'export { peliculas };';

    return codigo;
}

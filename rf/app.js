import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

// --- ELEMENTOS DEL DOM ---
const form = document.getElementById('add-form');
const idInput = document.getElementById('id');
const nombreInput = document.getElementById('nombre'); // Referencia para el foco
const outputContainer = document.getElementById('output-container');
const outputCodeElement = document.getElementById('output-code');

// --- LÓGICA PRINCIPAL ---

// Creamos una copia local y "mutable" (modificable) de la lista de películas,
// ya que la lista importada es de solo lectura.
let peliculasLocales = [...peliculas];

/**
 * Calcula el siguiente ID disponible basándose en el último elemento de la lista local.
 * Actualiza el campo de ID en el formulario.
 */
function actualizarSiguienteId() {
    // Si la lista está vacía, empezamos desde el ID 1. Si no, tomamos el último ID.
    const ultimoItem = peliculasLocales.length > 0 ? peliculasLocales[peliculasLocales.length - 1] : { id: '0000' };
    const siguienteIdNumero = parseInt(ultimoItem.id, 10) + 1;
    // Formateamos el ID a 4 dígitos (ej: "0009") y lo asignamos al input.
    idInput.value = String(siguienteIdNumero).padStart(4, '0');
}

/**
 * Genera el string completo del archivo `data.js` con la lista actualizada.
 * @param {Array<object>} listaCompleta - La lista completa de ítems (películas/series).
 * @returns {string} El código formateado para copiar y pegar.
 */
function generarCodigo(listaCompleta) {
    let codigo = 'const peliculas = [\n';

    listaCompleta.forEach((item, index) => {
        // Convierte el objeto a un string JSON con formato legible.
        const itemString = JSON.stringify(item, null, 2)
                               .replace(/"([^"]+)":/g, '$1:'); // Quita las comillas de las claves.

        codigo += `  ${itemString}`;

        // Añade una coma si no es el último elemento.
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

// Escuchamos el evento de envío del formulario.
form.addEventListener('submit', (event) => {
    // Prevenimos el comportamiento por defecto (recargar la página).
    event.preventDefault();

    // Obtenemos los datos del formulario.
    const formData = new FormData(form);

    // Creamos el nuevo objeto de película con los datos.
    const nuevaPelicula = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        año: parseInt(formData.get('año'), 10), // Convertimos el año a número.
        categoria: formData.get('categoria'),
        tipo: formData.get('tipo'),
        portada: formData.get('portada'),
        link: formData.get('link'),
    };

    // **PASO CLAVE**: Añadimos la nueva película a nuestra copia local de la lista.
    peliculasLocales.push(nuevaPelicula);

    // Generamos el nuevo código para mostrar en pantalla.
    const codigoGenerado = generarCodigo(peliculasLocales);

    // Mostramos el resultado.
    outputCodeElement.textContent = codigoGenerado;
    outputContainer.style.display = 'block';
    outputContainer.scrollIntoView({ behavior: 'smooth' }); // Hacemos scroll para ver el resultado.

    // --- ✨ LA SOLUCIÓN QUE PEDISTE ✨ ---

    // 1. Limpiamos todos los campos del formulario.
    form.reset();

    // 2. Calculamos y mostramos el ID para el siguiente título que se quiera añadir.
    actualizarSiguienteId();

    // 3. Ponemos el cursor en el campo "Nombre" para que puedas empezar a escribir de inmediato.
    nombreInput.focus();
});

// --- EJECUCIÓN INICIAL ---

// Al cargar la página, calculamos el primer ID disponible y lo mostramos.
actualizarSiguienteId();
// Ponemos el foco en el campo nombre para una mejor experiencia de usuario.
nombreInput.focus();


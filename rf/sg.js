// Obtén una referencia al elemento body del documento
const body = document.querySelector('body');

// Crea un div para el fondo oscuro
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
overlay.style.zIndex = '9998'; // Un z-index alto para que esté encima de todo

// Crea un div para el contenedor del formulario
const formContainer = document.createElement('div');
formContainer.style.position = 'fixed';
formContainer.style.top = '50%';
formContainer.style.left = '50%';
formContainer.style.transform = 'translate(-50%, -50%)';
formContainer.style.backgroundColor = '#fff';
formContainer.style.padding = '30px';
formContainer.style.borderRadius = '8px';
formContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
formContainer.style.zIndex = '9999'; // Más alto que el overlay
formContainer.style.width = '300px'; // Ancho fijo para el contenedor

// Añade un título al formulario
const title = document.createElement('h2');
title.textContent = 'Acceso Restringido';
title.style.textAlign = 'center';
title.style.marginBottom = '20px';

// Crea el formulario
const form = document.createElement('form');
form.style.display = 'flex';
form.style.flexDirection = 'column';
form.style.alignItems = 'center';

// Crea el input para la clave
const input = document.createElement('input');
input.setAttribute('type', 'password');
input.setAttribute('placeholder', 'Ingresa la clave');
input.style.padding = '10px';
input.style.marginBottom = '15px';
input.style.border = '1px solid #ccc';
input.style.borderRadius = '4px';
input.style.width = '100%'; // Ocupa todo el ancho del contenedor

// Crea el botón de enviar
const button = document.createElement('button');
button.setAttribute('type', 'submit');
button.textContent = 'Entrar';
button.style.padding = '10px 20px';
button.style.backgroundColor = '#007bff';
button.style.color = '#fff';
button.style.border = 'none';
button.style.borderRadius = '4px';
button.style.cursor = 'pointer';
button.style.transition = 'background-color 0.3s ease';
button.style.width = '100%'; // Ocupa todo el ancho del contenedor

// Añade un efecto hover al botón
button.onmouseover = () => { button.style.backgroundColor = '#0056b3'; };
button.onmouseout = () => { button.style.backgroundColor = '#007bff'; };

// Mensaje de error o bloqueo (inicialmente oculto)
const message = document.createElement('p');
message.style.color = 'red';
message.style.marginTop = '10px';
message.style.textAlign = 'center';
message.style.display = 'none'; // Oculto por defecto

// Agrega los elementos al formulario
form.appendChild(input);
form.appendChild(button);

// Agrega el título, el formulario y el mensaje al contenedor
formContainer.appendChild(title);
formContainer.appendChild(form);
formContainer.appendChild(message);

// Agrega el overlay y el contenedor del formulario al body
body.appendChild(overlay);
body.appendChild(formContainer);

// La clave correcta
const correctKey = '32370953';
const MAX_ATTEMPTS = 2; // Número máximo de intentos fallidos
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Función para actualizar el mensaje de bloqueo.
 * @param {number} remainingTime - Tiempo restante en milisegundos.
 */
function updateBlockMessage(remainingTime) {
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    message.textContent = `Demasiados intentos fallidos. Inténtalo de nuevo en ${hours}h ${minutes}m ${seconds}s.`;
    message.style.display = 'block';
}

/**
 * Función para verificar el estado de bloqueo.
 * @returns {boolean} True si la página está bloqueada, false en caso contrario.
 */
function checkBlockStatus() {
    const blockUntil = localStorage.getItem('blockUntil');
    const now = new Date().getTime();

    if (blockUntil && now < parseInt(blockUntil)) {
        // La página está bloqueada
        form.style.display = 'none'; // Oculta el formulario de entrada
        updateBlockMessage(parseInt(blockUntil) - now);
        // Actualiza el contador cada segundo
        const intervalId = setInterval(() => {
            const newNow = new Date().getTime();
            if (newNow >= parseInt(blockUntil)) {
                clearInterval(intervalId);
                // El tiempo de bloqueo ha terminado, limpia el almacenamiento y recarga la página
                localStorage.removeItem('blockAttempts');
                localStorage.removeItem('blockUntil');
                location.reload(); // Recarga la página para mostrar el formulario de nuevo
            } else {
                updateBlockMessage(parseInt(blockUntil) - newNow);
            }
        }, 1000);
        return true;
    }
    return false;
}

// Inicializa el contador de intentos si no existe
if (localStorage.getItem('blockAttempts') === null) {
    localStorage.setItem('blockAttempts', '0');
}

// Verifica si la página debe estar bloqueada al cargar
if (checkBlockStatus()) {
    // No hagas nada más, el mensaje de bloqueo ya se está mostrando y actualizando
} else {
    // Si no está bloqueada, muestra el formulario
    form.style.display = 'flex';
    message.style.display = 'none'; // Asegúrate de que el mensaje de error esté oculto si no hay bloqueo
}

// Manejador del evento submit del formulario
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe y recargue la página

    const enteredKey = input.value;
    let attempts = parseInt(localStorage.getItem('blockAttempts'));

    if (enteredKey === correctKey) {
        // Si la clave es correcta, oculta el formulario y el overlay
        formContainer.style.display = 'none';
        overlay.style.display = 'none';
        // Reinicia los intentos y el tiempo de bloqueo
        localStorage.setItem('blockAttempts', '0');
        localStorage.removeItem('blockUntil');
    } else {
        // Clave incorrecta
        attempts++;
        localStorage.setItem('blockAttempts', attempts.toString());
        input.value = ''; // Limpia el input

        if (attempts >= MAX_ATTEMPTS) {
            // Demasiados intentos, bloquea la página
            const blockUntil = new Date().getTime() + BLOCK_DURATION_MS;
            localStorage.setItem('blockUntil', blockUntil.toString());
            form.style.display = 'none'; // Oculta el formulario
            checkBlockStatus(); // Muestra el mensaje de bloqueo y comienza el contador
        } else {
            // Muestra el mensaje de error normal
            message.textContent = `Clave incorrecta. Te quedan ${MAX_ATTEMPTS - attempts} intentos.`;
            message.style.display = 'block';
        }
    }
});

// Importamos la base de datos desde GitHub
import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

// --- CONSTANTES Y CLAVES PARA LOCALSTORAGE ---
const MAX_ATTEMPTS = 2;
const LOCKOUT_KEY = 'lockoutTimestamp';
const ATTEMPTS_KEY = 'failedAttempts';

// --- ELEMENTOS DEL DOM (obtenidos sin necesidad de nuevos IDs) ---
const form = document.getElementById('add-form');
// Seleccionamos el botón por su tipo dentro del formulario
const submitButton = document.querySelector('#add-form button[type="submit"]');
const idInput = document.getElementById('id');
const mainContainer = document.querySelector('main');
const outputContainer = document.getElementById('output-container');
const outputCodeElement = document.getElementById('output-code');


// --- LÓGICA DE BLOQUEO ---

/**
 * Muestra el mensaje de bloqueo y la cuenta regresiva.
 * Oculta el contenido principal para "cerrar" la página.
 */
function displayLockout(lockoutEndTime) {
    mainContainer.style.display = 'none'; // Ocultamos todo el formulario

    let lockoutMessageDiv = document.getElementById('lockout-message');
    if (!lockoutMessageDiv) {
        lockoutMessageDiv = document.createElement('div');
        lockoutMessageDiv.id = 'lockout-message';
        lockoutMessageDiv.style.textAlign = 'center';
        lockoutMessageDiv.style.padding = '40px';
        lockoutMessageDiv.style.backgroundColor = '#fff';
        lockoutMessageDiv.style.borderRadius = '12px';
        lockoutMessageDiv.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        document.body.appendChild(lockoutMessageDiv);
    }
    
    const updateCountdown = () => {
        const now = Date.now();
        const timeLeft = lockoutEndTime - now;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            lockoutMessageDiv.remove();
            mainContainer.style.display = 'block';
            return;
        }

        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);

        lockoutMessageDiv.innerHTML = `
            <h2>❌ Página Bloqueada</h2>
            <p>Has superado el número máximo de intentos fallidos.</p>
            <p>Por favor, espera:</p>
            <p style="font-size: 2em; color: #d32f2f; margin: 10px 0;">
                ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
            </p>
        `;
    };

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

/**
 * Comprueba al cargar la página si ya existe un bloqueo activo.
 */
function checkInitialLockout() {
    const lockoutTimestamp = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutTimestamp) {
        const lockoutEndTime = parseInt(lockoutTimestamp, 10) + (24 * 60 * 60 * 1000);
        if (Date.now() < lockoutEndTime) {
            displayLockout(lockoutEndTime);
            // Si está bloqueado, deshabilitamos el botón para mayor seguridad
            if (submitButton) submitButton.disabled = true;
        } else {
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
        }
    }
}

// --- LÓGICA PRINCIPAL DEL FORMULARIO ---

// Asignar el nuevo ID al cargar la página
if (peliculas.length > 0) {
    const lastItem = peliculas[peliculas.length - 1];
    const nextIdNumber = parseInt(lastItem.id, 10) + 1;
    idInput.value = String(nextIdNumber).padStart(4, '0');
}

// Escuchamos el evento de 'submit' del formulario
form.addEventListener('submit', (event) => {
    // ¡Muy importante! Prevenimos el comportamiento por defecto (recargar la página)
    event.preventDefault();

    // Si el formulario es válido, procesamos los datos
    if (form.checkValidity()) {
        localStorage.setItem(ATTEMPTS_KEY, '0');

        const nuevaPelicula = {
            id: idInput.value,
            nombre: document.getElementById('nombre').value,
            año: parseInt(document.getElementById('año').value, 10),
            categoria: document.getElementById('categoria').value,
            tipo: document.getElementById('tipo').value,
            portada: document.getElementById('portada').value,
            link: document.getElementById('link').value,
        };

        const codigoGenerado = generarCodigo(nuevaPelicula);
        outputCodeElement.textContent = codigoGenerado;
        outputContainer.style.display = 'block';
        outputContainer.scrollIntoView({ behavior: 'smooth' });

    } else {
        // El navegador mostrará los errores de validación por sí solo.
        // Aquí contamos el intento fallido porque el evento 'submit' fue interceptado.
        let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
        attempts++;
        localStorage.setItem(ATTEMPTS_KEY, attempts);

        if (attempts >= MAX_ATTEMPTS) {
            const lockoutTime = Date.now();
            localStorage.setItem(LOCKOUT_KEY, lockoutTime);
            displayLockout(lockoutTime + (24 * 60 * 60 * 1000));
        } else {
            alert(`Intento fallido ${attempts} de ${MAX_ATTEMPTS}. Por favor, completa todos los campos requeridos.`);
        }
    }
});


/**
 * Genera el string completo del archivo data.js con el nuevo elemento.
 */
function generarCodigo(nuevoItem) {
    let codigo = 'const peliculas = [\n';
    const todosLosItems = [...peliculas, nuevoItem];
    todosLosItems.forEach((item, index) => {
        const itemString = JSON.stringify(item, null, 2).replace(/"([^"]+)":/g, '$1:');
        codigo += `  ${itemString}`;
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

// --- INICIALIZACIÓN ---
// Al cargar la página, verificamos si el usuario ya está bloqueado.
checkInitialLockout();

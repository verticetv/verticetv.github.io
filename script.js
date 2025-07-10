document.addEventListener('DOMContentLoaded', () => {
    const taglineContainer = document.getElementById('tagline-container');

    const taglines = [
        "Descubre un nuevo mundo.",
        "Series y películas sin límites.",
        "La televisión del futuro, hoy.",
        "¿Listo para la función?",
        "Calidad y variedad en un solo lugar.",
        "Únete a la comunidad."
    ];

    let currentTaglineIndex = 0;
    let currentChars = [];

    function updateTagline() {
        const newTagline = taglines[currentTaglineIndex];
        const newChars = newTagline.split('');

        // Limpia el contenedor para la nueva animación
        taglineContainer.innerHTML = '';
        currentChars = [];

        newChars.forEach((char, index) => {
            // Crea la estructura para cada letra: <div class="char"><div class="char-inner">...</div></div>
            const charWrapper = document.createElement('div');
            charWrapper.classList.add('char');
            
            const charInner = document.createElement('div');
            charInner.classList.add('char-inner');

            const charFront = document.createElement('span');
            charFront.classList.add('char-front');
            // Si hay un carácter antiguo en esta posición, lo usamos, si no, empezamos en blanco
            charFront.textContent = ' '; 

            const charBack = document.createElement('span');
            charBack.classList.add('char-back');
            // El espacio en blanco se maneja con un espacio no rompible para mantener la dimensión
            charBack.innerHTML = (char === ' ') ? '&nbsp;' : char;

            charInner.appendChild(charFront);
            charInner.appendChild(charBack);
            charWrapper.appendChild(charInner);
            taglineContainer.appendChild(charWrapper);

            currentChars.push(charWrapper);
            
            // Aplica la animación de 'flip' con un pequeño retraso secuencial
            setTimeout(() => {
                charWrapper.classList.add('flip');
            }, index * 80); // 80ms de retraso entre cada letra
        });

        // Prepara el índice para la siguiente frase
        currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
    }

    // Inicia el ciclo de cambio de frases
    updateTagline(); // Muestra la primera frase inmediatamente
    setInterval(updateTagline, 5000); // Cambia la frase cada 5 segundos
});

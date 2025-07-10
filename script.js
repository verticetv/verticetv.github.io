document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para la Animación "Dropping Texts" ---

    // Edita esta lista para añadir, quitar o cambiar las palabras animadas
    const words = [
        "Increíble",
        "Inolvidable",
        "Emocionante",
        "Para Todos"
    ];

    const container = document.getElementById('dropping-texts-container');
    const totalWords = words.length;
    
    // La duración total de un ciclo de animación será el número de palabras + 1 segundo de pausa.
    const animationDuration = totalWords + 1; 

    words.forEach((word, index) => {
        const div = document.createElement('div');
        div.textContent = word;

        // Determina qué animación usar. La última palabra tiene un efecto de salida diferente.
        const animationName = (index === totalWords - 1) ? 'roll-last' : 'roll';
        
        // Aplica el estilo de animación dinámicamente.
        // Cada palabra inicia su animación 1 segundo después de la anterior.
        div.style.animation = `${animationName} ${animationDuration}s linear infinite ${index}s`;
        
        container.appendChild(div);
    });
});

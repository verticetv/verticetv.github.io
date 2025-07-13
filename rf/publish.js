// --- ELEMENTOS DEL DOM PARA PUBLICAR ---
[span_0](start_span)const publishButton = document.getElementById('publish-button');[span_0](end_span)
[span_1](start_span)const outputCodeElementForPublish = document.getElementById('output-code');[span_1](end_span)

// --- CONSTANTES DE LA API DE GITHUB ---
const GITHUB_API_URL = 'https://api.github.com/repos/MOC3PNJ/moc3pnj.github.io/contents/bd/data.js';
const REPO_OWNER = 'MOC3PNJ';
const REPO_NAME = 'moc3pnj.github.io';
[span_2](start_span)const FILE_PATH = 'bd/data.js';[span_2](end_span)

// --- EVENTO DEL BOTÓN PUBLICAR ---
publishButton.addEventListener('click', async () => {
    // 1. Pedir el Token de Acceso Personal (PAT)
    const githubToken = prompt("Por favor, introduce tu GitHub Personal Access Token (PAT):");
    if (!githubToken) {
        alert("Operación cancelada. No se introdujo ningún token.");
        return;
    }

    // 2. Pedir un mensaje para el commit
    [span_3](start_span)const commitMessage = prompt("Introduce un mensaje para este cambio (ej: 'Actualización de lista de películas'):", "Actualización de base de datos de películas");[span_3](end_span)
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
        [span_4](start_span)await updateGithubFile(githubToken, commitMessage, fileContent);[span_4](end_span)
        [span_5](start_span)alert("¡Éxito! El archivo data.js ha sido actualizado en GitHub.");[span_5](end_span)
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
    [span_6](start_span)// Para actualizar un archivo, GitHub necesita el "SHA" del archivo actual.[span_6](end_span)
    // Primero, obtenemos la información del archivo para conseguir ese SHA.
    const fileInfo = await getFileSHA(token);

    // GitHub requiere que el contenido del archivo esté codificado en Base64.
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // Ahora, hacemos la petición PUT para actualizar el archivo.
    const response = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
            [span_7](start_span)'Authorization': `token ${token}`,[span_7](end_span)
            [span_8](start_span)'Accept': 'application/vnd.github.v3+json',[span_8](end_span)
            [span_9](start_span)'Content-Type': 'application/json'[span_9](end_span)
        },
        body: JSON.stringify({
            message: message,         // El mensaje del commit
            content: encodedContent,  // El nuevo contenido en Base64
            [span_10](start_span)sha: fileInfo.sha         // El SHA del archivo que estamos reemplazando[span_10](end_span)
        })
    });
    [span_11](start_span)if (!response.ok) {[span_11](end_span)
        [span_12](start_span)const errorData = await response.json();[span_12](end_span)
        [span_13](start_span)throw new Error(`Error ${response.status}: ${errorData.message}`);[span_13](end_span)
    }

    [span_14](start_span)return await response.json();[span_14](end_span)
}

/**
 * Obtiene el SHA del archivo actual desde GitHub.
 * [span_15](start_span)@param {string} token - El PAT de GitHub.[span_15](end_span)
 */
async function getFileSHA(token) {
    const response = await fetch(GITHUB_API_URL, {
        method: 'GET',
        headers: {
            [span_16](start_span)'Authorization': `token ${token}`,[span_16](end_span)
            [span_17](start_span)'Accept': 'application/vnd.github.v3+json'[span_17](end_span)
        }
    });
    [span_18](start_span)if (!response.ok) {[span_18](end_span)
        [span_19](start_span)const errorData = await response.json();[span_19](end_span)
        [span_20](start_span)throw new Error(`Error ${response.status} al obtener SHA: ${errorData.message}`);[span_20](end_span)
    }

    [span_21](start_span)return await response.json();[span_21](end_span)
}

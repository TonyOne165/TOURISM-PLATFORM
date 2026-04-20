// Planet visualization script with environment variable support
// This script is imported by world_countries_planet.html

// Get API key from environment variable
// Note: In production, you should set this in your .env file as VITE_OPENAI_API_KEY
const getApiKey = () => {
    // Check if running in Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_OPENAI_API_KEY || '';
    }
    // Fallback for static HTML (you'll need to set this manually or use a build process)
    console.warn('Running outside Vite environment. API key not available from env variables.');
    return '';
};

export const apiKey = getApiKey();

// Función para activar el zoom al país por nombre
export function zoomToCountryByName(name, countryPoints, sphereTo2D, rotation, planetConfig) {
    const country = countryPoints.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (!country) return { success: false };
    const projected = sphereTo2D(country.theta, country.phi, rotation);

    return {
        success: true,
        zoomData: {
            zooming: true,
            zoomProgress: 0,
            zoomTarget: country,
            zoomStartRadius: planetConfig.radius,
            zoomEndRadius: Math.max(planetConfig.centerX, planetConfig.centerY) * 2.2,
            zoomStartCenter: { x: planetConfig.centerX, y: planetConfig.centerY },
            zoomEndCenter: { x: projected.x, y: projected.y },
            zoomStartRotation: rotation,
            zoomEndRotation: country.theta - Math.PI / 2,
            pointColor: planetConfig.color
        }
    };
}

// Función para enviar una pregunta a OpenAI y activar el planeta
export async function askChatGPT(question, zoomCallback) {
    const answerElement = document.getElementById('assistant-answer');

    if (!question) {
        return "Por favor, escribe el nombre de un país.";
    }

    // Activar el planeta si el país existe
    const zoomResult = zoomCallback(question);
    if (zoomResult) {
        answerElement.innerHTML = "Mostrando país en el planeta...";
    } else {
        answerElement.innerHTML = "Buscando...";
    }

    const currentApiKey = getApiKey();
    if (!currentApiKey) {
        answerElement.innerHTML = "API key no configurada. Por favor, añade VITE_OPENAI_API_KEY a tu archivo .env";
        return;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: question }],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content.trim();
            answerElement.innerHTML = answer;
            return answer;
        } else {
            answerElement.innerHTML = "No se encontró información para ese país.";
            return "No se encontró información para ese país.";
        }
    } catch (error) {
        answerElement.innerHTML = "¡Error al conectar con OpenAI!";
        console.error('OpenAI API Error:', error);
        return "Error";
    }
}

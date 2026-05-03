import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de CORS para desarrollo local si fuera necesario
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('API Key no configurada en Vercel');
    return res.status(500).json({ error: 'OpenAI API Key no configurada en el servidor' });
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error en Proxy:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

import type { ChatMessage, Tour, Accommodation, ChatCard, ChatAction } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_PROMPT = `Eres el asistente virtual de Cartagena Tours, una plataforma de turismo en Cartagena de Indias, Colombia.

REGLAS ESTRICTAS:
- SOLO puedes responder preguntas relacionadas con: turismo, viajes, destinos, rutas, hoteles, hospedajes, tours, recomendaciones de viaje, transporte turístico, gastronomía local, cultura local, clima para viajes, presupuestos de viaje, y políticas de reservas de la plataforma.
- Si el usuario pregunta sobre temas NO relacionados con turismo o viajes (por ejemplo: matemáticas, ciencia, programación, política, deportes, salud, tareas escolares, etc.), rechaza amablemente diciendo: "Lo siento, solo puedo ayudarte con temas relacionados con turismo, viajes y destinos. ¿Puedo ayudarte a planificar tu viaje a Cartagena?"
- NO respondas preguntas generales de conocimiento que no tengan relación directa con turismo.

Tu rol permitido:
- Recomendar tours y destinos basados en las preferencias del usuario
- Ayudar a planificar itinerarios completos
- Responder preguntas sobre tours, hospedajes, precios y políticas
- Sugerir actividades, horarios y transporte turístico
- Informar sobre disponibilidad y mejores precios
- Dar recomendaciones de hospedajes según presupuesto y preferencias
- Dar información sobre cómo llegar a lugares turísticos
- Recomendar restaurantes y comida local
- Guiar al usuario en el proceso de reserva

Responde siempre en español, de forma amigable y profesional. Usa emojis ocasionalmente.
Si no tienes información específica, sugiere al usuario contactar con el equipo de soporte.
Mantén respuestas concisas pero útiles.`;

// ============ TYPES ============
export interface AIResponse {
  text: string;
  cards?: ChatCard[];
  actions?: ChatAction[];
  quickReplies?: string[];
}

interface AIContext {
  tours?: Tour[];
  accommodations?: Accommodation[];
  userPreferences?: Record<string, unknown>;
}

// ============ MAIN SEND FUNCTION ============
export const sendChatMessage = async (
  messages: ChatMessage[],
  context?: AIContext
): Promise<AIResponse> => {
  if (!OPENAI_API_KEY) {
    return getOfflineResponse(messages[messages.length - 1]?.content || '', context);
  }

  try {
    let contextMessage = '';
    if (context?.tours?.length) {
      contextMessage += '\n\nTours disponibles:\n' + context.tours.map(t =>
        `- ${t.title} (slug: ${t.slug}): $${t.price}, ${t.duration}, categoría: ${t.category || 'General'}, rating: ${t.rating}/5`
      ).join('\n');
    }
    if (context?.accommodations?.length) {
      contextMessage += '\n\nHospedajes disponibles:\n' + context.accommodations.map(a =>
        `- ${a.name} (slug: ${a.slug}): $${a.pricePerNight}/noche, tipo: ${a.type}, rating: ${a.rating}/5, amenidades: ${a.amenities.join(', ')}`
      ).join('\n');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + contextMessage },
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return getOfflineResponse(messages[messages.length - 1]?.content || '', context);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

    // Enrich OpenAI response with cards when relevant
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const enrichment = enrichResponse(lastMsg, text, context);

    return {
      text,
      ...enrichment,
    };
  } catch {
    return getOfflineResponse(messages[messages.length - 1]?.content || '', context);
  }
};

// ============ INTENT DETECTION ============
type Intent = 'greeting' | 'tours' | 'accommodations' | 'pricing' | 'itinerary' | 'booking' | 'cancellation' | 'off_topic' | 'general';

function detectIntent(msg: string): Intent {
  const lower = msg.toLowerCase().trim();

  if (/^(hola|hey|hi|buenos|buenas|qué tal|saludos|hello)/i.test(lower)) return 'greeting';
  if (/reserv|quiero reservar|agendar|apartar|book/i.test(lower)) return 'booking';
  if (/cancel|devol|reembols/i.test(lower)) return 'cancellation';
  if (/tour|excursión|actividad|paseo|aventura/i.test(lower)) return 'tours';
  if (/hotel|hospedaje|alojamiento|dormir|habitación|hostal|apartamento|resort/i.test(lower)) return 'accommodations';
  if (/precio|costo|cuánto|presupuesto|vale|cobr/i.test(lower)) return 'pricing';
  if (/plan|itinerario|agenda|ruta|día|program/i.test(lower)) return 'itinerary';

  const tourismKeywords = [
    'viaje', 'playa', 'isla', 'cartagena', 'barú', 'rosario', 'destino',
    'transporte', 'taxi', 'aeropuerto', 'equipaje', 'clima', 'temporada',
    'restaurante', 'comer', 'comida', 'gastronomía', 'cultura', 'historia',
    'museo', 'snorkel', 'buceo', 'kayak', 'lancha', 'bote', 'barco',
    'mapa', 'guía', 'foto', 'visitar', 'conocer', 'lugar', 'recomendar',
    'recomendación', 'noche', 'ayuda', 'gracias',
  ];

  if (tourismKeywords.some(kw => lower.includes(kw))) return 'general';
  if (lower.length <= 5) return 'general';

  return 'off_topic';
}

// ============ GENERATE CARDS FROM DATA ============
function toursToCards(tours: Tour[], limit = 3): ChatCard[] {
  return tours.slice(0, limit).map(t => ({
    type: 'tour' as const,
    id: t.id || '',
    title: t.title,
    image: t.images?.[0] || 'https://placehold.co/400x300?text=Tour',
    price: t.price,
    rating: t.rating,
    slug: t.slug,
    subtitle: t.duration,
  }));
}

function accommodationsToCards(accommodations: Accommodation[], limit = 3): ChatCard[] {
  return accommodations.slice(0, limit).map(a => ({
    type: 'accommodation' as const,
    id: a.id || '',
    title: a.name,
    image: a.images?.[0] || 'https://placehold.co/400x300?text=Hospedaje',
    price: a.pricePerNight,
    rating: a.rating,
    slug: a.slug,
    subtitle: a.type,
  }));
}

// ============ ENRICH RESPONSES ============
function enrichResponse(userMsg: string, _responseText: string, context?: AIContext): Partial<AIResponse> {
  const intent = detectIntent(userMsg);

  switch (intent) {
    case 'tours':
      return {
        cards: context?.tours ? toursToCards(context.tours) : undefined,
        quickReplies: ['Tours de playa', 'Tours culturales', 'Ver precios', '¿Cómo reservo?'],
      };
    case 'accommodations':
      return {
        cards: context?.accommodations ? accommodationsToCards(context.accommodations) : undefined,
        quickReplies: ['Hoteles económicos', 'Hoteles de lujo', 'Ver precios', '¿Cómo reservo?'],
      };
    case 'booking':
      return {
        cards: context?.tours ? toursToCards(context.tours, 4) : undefined,
        quickReplies: ['Ver tours disponibles', 'Ver hospedajes', 'Ir al carrito'],
        actions: [
          { label: 'Ir al Carrito', type: 'navigate', payload: '/dashboard/cart', icon: '🛒' },
        ],
      };
    case 'pricing':
      return {
        quickReplies: ['Tours disponibles', 'Hospedajes disponibles', 'Ofertas especiales', 'Quiero reservar'],
      };
    case 'itinerary':
      return {
        quickReplies: ['Itinerario de 3 días', 'Itinerario de 7 días', 'Viaje romántico', 'Viaje familiar'],
      };
    case 'greeting':
      return {
        quickReplies: ['¿Qué tours tienen?', '¿Hospedajes disponibles?', 'Planificar itinerario', 'Quiero reservar'],
      };
    case 'cancellation':
      return {
        quickReplies: ['Ver mis reservas', 'Política de cancelación', 'Contactar soporte'],
        actions: [
          { label: 'Mis Reservas', type: 'navigate', payload: '/dashboard/bookings', icon: '📋' },
        ],
      };
    default:
      return {
        quickReplies: ['¿Qué tours tienen?', '¿Hospedajes disponibles?', 'Planificar viaje'],
      };
  }
}

// ============ OFFLINE RESPONSES ============
function getOfflineResponse(userMessage: string, context?: AIContext): AIResponse {
  const intent = detectIntent(userMessage);

  switch (intent) {
    case 'off_topic':
      return {
        text: `Lo siento, solo puedo ayudarte con temas relacionados con turismo, viajes y destinos. 🌴\n\n¿Puedo ayudarte a planificar tu viaje a Cartagena? Pregúntame sobre tours, hospedajes, precios o itinerarios.`,
        quickReplies: ['¿Qué tours tienen?', '¿Hospedajes disponibles?', 'Planificar itinerario'],
      };

    case 'greeting':
      return {
        text: `¡Hola! 👋 Bienvenido a Cartagena Tours. Soy tu asistente virtual.\n\nPuedo ayudarte con:\n🏝️ Recomendaciones de tours\n🏨 Opciones de hospedaje\n📋 Planificación de itinerarios\n💰 Información de precios\n🎫 Reservas paso a paso\n\n¿En qué te puedo ayudar?`,
        quickReplies: ['¿Qué tours tienen?', '¿Hospedajes disponibles?', 'Planificar itinerario', 'Quiero reservar'],
      };

    case 'tours': {
      const cards = context?.tours ? toursToCards(context.tours) : undefined;
      const toursText = context?.tours?.slice(0, 3).map(t =>
        `🏝️ **${t.title}** — $${t.price} (${t.duration}) ⭐ ${t.rating}/5`
      ).join('\n') || '';
      return {
        text: `¡Tenemos increíbles tours en Cartagena! 🌴\n\n${toursText}\n\nPuedes ver todos los tours disponibles en la sección de Tours. ¿Te interesa alguno en particular?`,
        cards,
        quickReplies: ['Tours de playa', 'Tours culturales', 'Ver precios', 'Quiero reservar'],
      };
    }

    case 'accommodations': {
      const cards = context?.accommodations ? accommodationsToCards(context.accommodations) : undefined;
      const accomText = context?.accommodations?.slice(0, 3).map(a =>
        `🏨 **${a.name}** — $${a.pricePerNight}/noche (${a.type}) ⭐ ${a.rating}/5`
      ).join('\n') || '';
      return {
        text: `¡Tenemos excelentes opciones de hospedaje! 🏨\n\n${accomText}\n\nVisita la sección de Hospedajes para ver todas las opciones. ¿Qué tipo de alojamiento prefieres?`,
        cards,
        quickReplies: ['Hoteles económicos', 'Hoteles de lujo', 'Ver precios', 'Quiero reservar'],
      };
    }

    case 'pricing':
      return {
        text: `💰 Nuestros precios varían según la experiencia:\n\n- Tours desde **$35** hasta **$95** por persona\n- Hospedajes desde **$40** hasta **$200** por noche\n\n¿Tienes un presupuesto específico en mente? Te puedo recomendar las mejores opciones.`,
        quickReplies: ['Tours disponibles', 'Hospedajes disponibles', 'Presupuesto bajo', 'Quiero reservar'],
      };

    case 'itinerary':
      return {
        text: `📋 ¡Te ayudo a planificar tu viaje! Te sugiero:\n\n**Día 1-3:** Explorar el Centro Histórico, Castillo San Felipe, Convento de La Popa\n**Día 4-6:** Islas del Rosario, snorkel y playa\n**Día 7-10:** Playa Blanca en Barú, Volcán del Totumo\n\n¿Quieres que personalice este itinerario según tus preferencias?`,
        quickReplies: ['Viaje de 3 días', 'Viaje de 7 días', 'Viaje romántico', 'Viaje familiar'],
      };

    case 'booking': {
      const cards = context?.tours ? toursToCards(context.tours, 4) : undefined;
      return {
        text: `¡Perfecto! 🎉 Puedo ayudarte a reservar.\n\nElige un tour o hospedaje de las opciones disponibles, o dime qué tipo de experiencia buscas y te recomendaré la mejor opción.\n\nTambién puedes ir directamente al carrito para ver tus items.`,
        cards,
        quickReplies: ['Ver tours', 'Ver hospedajes', 'Ir al carrito'],
        actions: [
          { label: 'Ver Tours', type: 'navigate', payload: '/tours', icon: '🏝️' },
          { label: 'Ir al Carrito', type: 'navigate', payload: '/dashboard/cart', icon: '🛒' },
        ],
      };
    }

    case 'cancellation':
      return {
        text: `📌 **Política de cancelación:**\n\n- Cancelación gratuita hasta **48 horas** antes del tour\n- Cancelación con 24-48h: reembolso del **50%**\n- Menos de 24h: sin reembolso\n\nPuedes gestionar tus reservas desde tu panel de usuario.`,
        quickReplies: ['Ver mis reservas', 'Contactar soporte'],
        actions: [
          { label: 'Mis Reservas', type: 'navigate', payload: '/dashboard/bookings', icon: '📋' },
        ],
      };

    default:
      return {
        text: `¡Gracias por tu pregunta! 😊\n\nEstoy aquí para ayudarte con todo lo relacionado a tu viaje a Cartagena. Puedo recomendarte tours, hospedajes, planificar itinerarios y más.\n\n¿Podrías ser más específico sobre lo que necesitas?`,
        quickReplies: ['¿Qué tours tienen?', '¿Hospedajes disponibles?', 'Planificar viaje', 'Quiero reservar'],
      };
  }
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const Home: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', comment: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSending, setFormSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    if (!name || !phone) {
      setFormError('Por favor completa tu nombre y teléfono.');
      return;
    }

    setFormSending(true);
    try {
      await addDoc(collection(db, 'join_requests'), {
        name,
        phone,
        comment: formData.comment.trim() || '',
        read: false,
        responded: false,
        createdAt: Timestamp.now(),
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', phone: '', comment: '' });
        setFormSubmitted(false);
      }, 4000);
    } catch (err: unknown) {
      console.error('Error submitting contact form:', err);
      const message = err instanceof Error ? err.message : '';
      if (message.includes('permission')) {
        setFormError('No tienes permisos para enviar. Verifica las reglas de Firestore.');
      } else {
        setFormError('Error al enviar. Por favor intenta de nuevo. (' + message + ')');
      }
    } finally {
      setFormSending(false);
    }
  };

  const highlights = [
    {
      image: 'https://images.unsplash.com/photo-1731560818707-6c0ba8a8a7b2?q=80&w=725&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: '3 cities',
      subtitle: 'in Colombia'
    },
    {
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&q=80',
      title: '10 days',
      subtitle: ''
    },
    {
      image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&q=80',
      title: 'gigabytes',
      subtitle: 'of photos'
    },
    {
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
      title: 'eat local',
      subtitle: 'food'
    },
    {
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
      title: 'enjoy',
      subtitle: 'the vibe'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="hero-section relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,1,1,0.4), rgba(12,46,61,0.6)), url(/gallery-image-2-1200x800-original.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-dark/40"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center text-white pt-20">
          {/* Giant Title */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[12rem] font-bold tracking-wider mb-8 sm:mb-16 drop-shadow-2xl leading-none">
            CARTAGENA
          </h1>

          {/* Highlights Carousel */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-4xl mx-auto">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="relative w-24 h-32 sm:w-32 sm:h-40 md:w-36 md:h-44 rounded-lg overflow-hidden shadow-2xl hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/95 via-brand-black/40 to-transparent p-3 text-left">
                  <p className="text-sm font-bold text-white drop-shadow-md">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-white/90 drop-shadow-sm">{item.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/tours"
            className="inline-block bg-brand-cream text-brand-dark px-8 py-3 rounded-full font-semibold hover:bg-white transition shadow-lg"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>

      {/* About the Tour Section */}
      <section id="about" className="bg-brand-dark text-brand-cream py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Title */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
              <div className="h-px bg-brand-brown w-12 sm:w-24 md:w-48"></div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-widest uppercase text-white text-center">
                Acerca del Tour
              </h2>
              <div className="h-px bg-brand-brown w-12 sm:w-24 md:w-48"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {/* Left - Description */}
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-brand-cream">
                Hemos planeado un <span className="text-brand-beige font-semibold">itinerario sencillo y conveniente de 10 días</span> para tu viaje a la Costa Caribe de Colombia.
              </p>
              <p className="text-lg leading-relaxed text-brand-cream">
                Visitarás tres destinos: <span className="font-semibold text-white">Cartagena, Barú y las Islas del Rosario.</span>
              </p>
              <p className="text-brand-brown mt-8">
                No te preocupes por rutas, horarios o buscar lugares — todo está organizado.
                Te mostraremos dónde ir, qué ver y dónde comer, para que simplemente disfrutes el viaje.
              </p>
            </div>

            {/* Right - Timeline */}
            <div className="space-y-8">
              {/* Days 1-3 */}
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1715503486591-39e62f58a7b3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Cartagena"
                  className="w-20 h-16 sm:w-32 sm:h-24 object-cover rounded-lg shadow-lg shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-brand-beige rounded-full"></div>
                    <p className="text-sm text-brand-brown">Días 1-3</p>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Cartagena</h3>
                </div>
              </div>

              {/* Days 4-6 */}
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/flagged/photo-1575839696478-2bd746fc583a?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Islas del Rosario"
                  className="w-20 h-16 sm:w-32 sm:h-24 object-cover rounded-lg shadow-lg shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-brand-beige rounded-full"></div>
                    <p className="text-sm text-brand-brown">Días 4-6</p>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Islas del Rosario</h3>
                </div>
              </div>

              {/* Days 7-10 */}
              <div className="flex items-center gap-4">
                <img
                  src="https://www.tomplanmytrip.com/wp-content/uploads/2023/12/Isla-Baru-Rosario-Islands-Cartagena-Colombia-Eastern-Caribbean-Coast-.jpg"
                  alt="Barú"
                  className="w-20 h-16 sm:w-32 sm:h-24 object-cover rounded-lg shadow-lg shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-brand-beige rounded-full"></div>
                    <p className="text-sm text-brand-brown">Días 7-10</p>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Barú</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section id="included" className="py-12 sm:py-20 bg-brand-cream">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mb-10 sm:mb-16 max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest uppercase text-brand-dark">
              Qué Incluye
            </h2>
            <div className="h-px bg-brand-brown w-full sm:flex-grow"></div>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Guides */}
            <div className="border-2 border-brand-beige rounded-xl p-6 hover:border-brand-blue transition bg-white">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-brand-brown" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <h3 className="text-xl font-semibold text-brand-dark">Guías</h3>
              </div>
              <p className="text-brand-dark/70">
                2 guías expertos que conocen todo sobre Colombia
              </p>
            </div>

            {/* Flights */}
            <div className="border-2 border-brand-beige rounded-xl p-6 hover:border-brand-blue transition bg-white">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
                <h3 className="text-xl font-semibold text-brand-dark">Vuelos</h3>
              </div>
              <p className="text-brand-dark/70">
                Vuelos de ida y vuelta incluidos con toda la logística cubierta
              </p>
            </div>

            {/* Transfers */}
            <div className="border-2 border-brand-beige rounded-xl p-6 hover:border-brand-blue transition bg-white">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                <h3 className="text-xl font-semibold text-brand-dark">Traslados</h3>
              </div>
              <p className="text-brand-dark/70">
                Desde el aeropuerto a los hoteles y todos los tours
              </p>
            </div>

            {/* Hotels */}
            <div className="border-2 border-brand-beige rounded-xl p-6 hover:border-brand-blue transition bg-white">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-brand-brown" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <h3 className="text-xl font-semibold text-brand-dark">Hoteles</h3>
              </div>
              <p className="text-brand-dark/70">
                Alojamiento cómodo, 2 personas por habitación, desayunos incluidos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 sm:py-20 bg-brand-beige">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Title */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
              <div className="h-px bg-brand-brown w-12 sm:w-24 md:w-48"></div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-widest uppercase text-brand-dark">
                Nuestro Equipo
              </h2>
              <div className="h-px bg-brand-brown w-12 sm:w-24 md:w-48"></div>
            </div>
            <p className="text-brand-dark/70 text-lg">Conoce a las personas que hacen posible tu experiencia perfecta</p>
          </div>

          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Kyle Forbes */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-brand-cream">
                <img
                  src="/WhatsApp Image 2026-03-28 at 7.33.34 PM.jpeg"
                  alt="Kyle Forbes"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/90 via-brand-black/70 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Kyle Forbes</h3>
                <p className="text-brand-cream text-sm">Desarrollador Software</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Oscar Carpio */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-brand-cream">
                <img
                  src="/WhatsApp Image 2026-03-28 at 9.03.16 PM.jpeg"
                  alt="Oscar Carpio"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/90 via-brand-black/70 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Oscar Carpio</h3>
                <p className="text-brand-cream text-sm">Diseñador de Infraestructura Tecnológica</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Rodrigo Casanova */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-brand-cream">
                <img
                  src="/WhatsApp Image 2026-03-28 at 7.47.52 PM.jpeg"
                  alt="Rodrigo Casanova"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/90 via-brand-black/70 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Rodrigo Casanova</h3>
                <p className="text-brand-cream text-sm">Director de Marketing CMO</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contact"
        className="contact-section relative py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,1,1,0.5), rgba(12,46,61,0.7)), url(/slider-4-slide-1-1920x678.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-brand-black/30"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-brand-dark/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-white border border-brand-brown/30">
              <h2 className="text-3xl font-light mb-2 text-center">
                ¿Quieres unirte a nosotros,
              </h2>
              <p className="text-xl mb-8 text-center text-brand-cream">pero aún tienes preguntas?</p>

              {formSubmitted ? (
                <div className="bg-green-500/90 p-4 rounded-lg text-center">
                  <p className="font-semibold text-white">¡Gracias! Te contactaremos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="bg-red-500/90 p-3 rounded-lg text-center text-white text-sm">{formError}</div>
                  )}
                  <div>
                    <label className="block text-sm mb-1 text-brand-cream">Deja tu solicitud</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-white/20 backdrop-blur border border-brand-brown/40 placeholder-white/60 text-white focus:outline-none focus:border-brand-beige"
                      required
                      disabled={formSending}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Número de teléfono"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-white/20 backdrop-blur border border-brand-brown/40 placeholder-white/60 text-white focus:outline-none focus:border-brand-beige"
                      required
                      disabled={formSending}
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Comentario"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded bg-white/20 backdrop-blur border border-brand-brown/40 placeholder-white/60 text-white focus:outline-none focus:border-brand-beige resize-none"
                      disabled={formSending}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-cream text-brand-dark py-3 rounded-lg font-semibold hover:bg-white transition disabled:opacity-50"
                    disabled={formSending}
                  >
                    {formSending ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

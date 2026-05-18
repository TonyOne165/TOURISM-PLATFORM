import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Términos y Condiciones / Terms & Conditions.
 *
 * Plantilla orientativa: cumple GDPR (UE), CCPA (California) y Ley 1581 de 2012 (Colombia).
 * Antes de publicar, este texto DEBE ser revisado por un asesor legal.
 */
const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Términos y Condiciones — Cartagena Tours';
    window.scrollTo({ top: 0 });
  }, []);

  const lastUpdated = '17 de mayo de 2026';

  return (
    <article className="bg-brand-cream text-brand-dark py-12 sm:py-20 pt-24 sm:pt-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-brown mb-2">Documento legal</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3">Términos y Condiciones</h1>
          <p className="text-sm text-brand-dark/60">Última actualización: {lastUpdated}</p>
          <div role="note" className="mt-6 p-4 border-l-4 border-brand-brown bg-brand-beige/40 text-sm">
            <strong>Plantilla orientativa</strong> — este documento debe ser revisado por un asesor legal antes de su publicación oficial.
            Versión bilingüe disponible más abajo / Bilingual version available below.
          </div>
        </header>

        {/* ============== ESPAÑOL ============== */}
        <section aria-labelledby="es-heading" className="prose prose-sm sm:prose-base max-w-none">
          <h2 id="es-heading" className="text-2xl font-semibold mt-8 mb-4">Español</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. Aceptación de los términos</h3>
          <p>
            Al acceder y utilizar la plataforma <strong>Cartagena Tours</strong> (en adelante "la Plataforma"), usted (en adelante "el Usuario")
            acepta de forma expresa y sin reservas estos Términos y Condiciones, así como nuestra
            {' '}<Link to="/politica-de-privacidad" className="underline text-brand-blue">Política de Privacidad</Link>.
            Si no está de acuerdo, debe abstenerse de usar la Plataforma.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. Objeto</h3>
          <p>
            La Plataforma ofrece servicios de información, intermediación y reserva de tours, hospedajes y experiencias turísticas
            principalmente en Cartagena de Indias y el territorio colombiano, así como contenido informativo sobre destinos a nivel global.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. Registro de usuario</h3>
          <p>
            Para acceder a ciertas funcionalidades (reservas, historial, carrito) el Usuario debe crear una cuenta proporcionando
            información veraz y actualizada. El Usuario es responsable de mantener la confidencialidad de sus credenciales y de
            toda actividad realizada bajo su cuenta.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">4. Uso de datos de ubicación</h3>
          <p>
            La Plataforma puede solicitar permiso para acceder a la ubicación del dispositivo del Usuario, exclusivamente con el fin de:
          </p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li>Sugerir destinos, tours y hospedajes cercanos.</li>
            <li>Mejorar la precisión del buscador y de los resultados mostrados.</li>
            <li>Mostrar distancias estimadas desde el Usuario hasta los puntos de interés.</li>
          </ul>
          <p>
            <strong>No realizamos rastreo continuo</strong> de la ubicación. El permiso se solicita en el momento puntual de la búsqueda
            y el Usuario puede revocarlo en cualquier momento desde la configuración de su navegador. La ubicación NO se almacena
            en nuestros servidores salvo que el Usuario explícitamente decida guardar un destino favorito o reservar.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">5. Reservas y pagos</h3>
          <p>
            Las reservas realizadas a través de la Plataforma están sujetas a la disponibilidad y a las condiciones particulares
            de cada proveedor (operador de tour, hotel, etc.). El precio mostrado incluye los impuestos y cargos aplicables salvo
            indicación expresa en contrario. Las políticas de cancelación se detallan en cada producto antes de confirmar la reserva.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">6. Propiedad intelectual</h3>
          <p>
            Todos los contenidos de la Plataforma (textos, imágenes, mapas, código, logos, marca "Cartagena Tours") son propiedad
            de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción
            sin autorización previa y por escrito.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">7. Limitación de responsabilidad</h3>
          <p>
            La Plataforma actúa como intermediaria entre el Usuario y los proveedores turísticos. No nos hacemos responsables de
            la calidad final del servicio prestado por terceros, ni de eventos de fuerza mayor (clima, restricciones gubernamentales,
            condiciones del mar para tours marítimos, etc.). En la medida permitida por la ley, nuestra responsabilidad se limita
            al monto efectivamente pagado por el Usuario por la reserva específica objeto del reclamo.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">8. Modificaciones</h3>
          <p>
            Nos reservamos el derecho a modificar estos Términos en cualquier momento. Los cambios serán notificados a través de
            la Plataforma y, cuando sea materialmente relevante, por correo electrónico. El uso continuado después de la notificación
            constituye aceptación de los nuevos términos.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">9. Ley aplicable y jurisdicción</h3>
          <p>
            Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a los jueces
            competentes de Cartagena de Indias, salvo norma imperativa en contrario en favor del consumidor.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">10. Contacto</h3>
          <p>
            Para cualquier consulta legal puede escribir a:{' '}
            <a href="mailto:legal@cartagenatours.example" className="underline text-brand-blue">legal@cartagenatours.example</a>.
          </p>
        </section>

        <hr className="my-12 border-brand-brown/30" />

        {/* ============== ENGLISH ============== */}
        <section aria-labelledby="en-heading" className="prose prose-sm sm:prose-base max-w-none">
          <h2 id="en-heading" className="text-2xl font-semibold mt-8 mb-4">English</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of terms</h3>
          <p>
            By accessing and using the <strong>Cartagena Tours</strong> platform (the "Platform"), you (the "User") expressly accept
            these Terms &amp; Conditions and our{' '}
            <Link to="/politica-de-privacidad" className="underline text-brand-blue">Privacy Policy</Link>. If you do not agree,
            please refrain from using the Platform.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. Purpose</h3>
          <p>
            The Platform offers information, intermediation and booking of tours, accommodations and travel experiences,
            primarily in Cartagena de Indias and Colombia, plus informational content on destinations worldwide.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. User registration</h3>
          <p>
            Certain features (bookings, history, cart) require account creation with truthful and current information. The User
            is responsible for keeping their credentials confidential and for all activity under their account.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">4. Location data</h3>
          <p>The Platform may request access to your device location, solely to:</p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li>Suggest nearby destinations, tours and accommodations.</li>
            <li>Improve search accuracy and result ranking.</li>
            <li>Display estimated distances from the User to points of interest.</li>
          </ul>
          <p>
            <strong>We do not perform continuous tracking.</strong> Permission is requested only at the moment of the search and
            can be revoked at any time from the browser settings. Your location is NOT stored on our servers unless you explicitly
            save a favorite destination or place a booking.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">5. Bookings and payments</h3>
          <p>
            Bookings are subject to availability and the specific conditions of each provider. The price displayed includes
            applicable taxes unless otherwise indicated. Cancellation policies are shown on each product before confirming.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">6. Intellectual property</h3>
          <p>
            All content on the Platform (text, images, maps, code, logos, "Cartagena Tours" brand) is the property of its
            respective owners and protected by intellectual property law. Reproduction without prior written authorization is prohibited.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">7. Liability</h3>
          <p>
            The Platform acts as an intermediary between the User and tourism providers. We are not liable for the final
            quality of services rendered by third parties, nor for force majeure events. To the extent permitted by law, our
            liability is limited to the amount actually paid by the User for the specific booking under dispute.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">8. Changes</h3>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be notified through the Platform and, when
            materially relevant, by email. Continued use constitutes acceptance of the new terms.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">9. Governing law</h3>
          <p>
            These Terms are governed by the laws of the Republic of Colombia. Any dispute will be submitted to the competent
            courts of Cartagena de Indias, unless otherwise required by mandatory consumer-protection rules.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">10. Contact</h3>
          <p>
            For any legal inquiry, please contact:{' '}
            <a href="mailto:legal@cartagenatours.example" className="underline text-brand-blue">legal@cartagenatours.example</a>.
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t border-brand-brown/30 flex flex-wrap gap-4 justify-between text-sm">
          <Link to="/politica-de-privacidad" className="text-brand-blue underline focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            Ver Política de Privacidad →
          </Link>
          <Link to="/" className="text-brand-dark/60 hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            ← Volver al inicio
          </Link>
        </footer>
      </div>
    </article>
  );
};

export default TermsPage;

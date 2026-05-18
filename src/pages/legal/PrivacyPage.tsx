import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Política de Privacidad / Privacy Policy.
 *
 * Plantilla orientativa: cumple GDPR (UE), CCPA (California) y Ley 1581 de 2012 (Colombia).
 * Antes de publicar, este texto DEBE ser revisado por un asesor legal.
 */
const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Política de Privacidad — Cartagena Tours';
    window.scrollTo({ top: 0 });
  }, []);

  const lastUpdated = '17 de mayo de 2026';

  return (
    <article className="bg-brand-cream text-brand-dark py-12 sm:py-20 pt-24 sm:pt-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-brown mb-2">Documento legal</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3">Política de Privacidad</h1>
          <p className="text-sm text-brand-dark/60">Última actualización: {lastUpdated}</p>
          <div role="note" className="mt-6 p-4 border-l-4 border-brand-brown bg-brand-beige/40 text-sm">
            <strong>Plantilla orientativa</strong> — este documento debe ser revisado por un asesor legal antes de su publicación oficial.
            Versión bilingüe disponible más abajo / Bilingual version available below.
          </div>
        </header>

        {/* ============== ESPAÑOL ============== */}
        <section aria-labelledby="es-heading" className="prose prose-sm sm:prose-base max-w-none">
          <h2 id="es-heading" className="text-2xl font-semibold mt-8 mb-4">Español</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. Responsable del tratamiento</h3>
          <p>
            <strong>Cartagena Tours</strong> (en adelante "la Plataforma") es responsable del tratamiento de los datos personales
            recogidos a través de este sitio web, conforme a la <strong>Ley 1581 de 2012</strong> y al
            <strong> Decreto 1377 de 2013</strong> de la República de Colombia, y a estándares internacionales como el
            <strong> Reglamento General de Protección de Datos (GDPR)</strong> de la Unión Europea y el
            <strong> California Consumer Privacy Act (CCPA)</strong>.
          </p>
          <p>Contacto del responsable: <a href="mailto:privacy@cartagenatours.example" className="underline text-brand-blue">privacy@cartagenatours.example</a></p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. Datos que recopilamos</h3>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li><strong>Cuenta:</strong> nombre, correo electrónico, foto de perfil opcional, contraseña cifrada (hash).</li>
            <li><strong>Reservas:</strong> tour/hospedaje seleccionado, fechas, número de personas, método de pago (procesado por un PSP externo; no almacenamos números completos de tarjeta).</li>
            <li><strong>Ubicación geográfica</strong> (opcional): coordenadas aproximadas obtenidas vía la API de geolocalización del navegador, sólo cuando usted lo autoriza explícitamente.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas, marca de tiempo.</li>
            <li><strong>Mensajes con el asistente virtual:</strong> el contenido textual y, si activó el modo voz, audio transcrito en su dispositivo (la voz NO se envía a nuestros servidores; la transcripción sí, para generar respuestas).</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. Finalidades del tratamiento</h3>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li>Gestionar su cuenta, reservas, pagos y comunicaciones operativas.</li>
            <li>Personalizar resultados de búsqueda y sugerencias basadas en su ubicación.</li>
            <li>Mejorar la plataforma mediante análisis agregados y anonimizados.</li>
            <li>Cumplir obligaciones legales (facturación, prevención de fraude).</li>
            <li>Enviarle comunicaciones comerciales sólo si nos otorgó consentimiento explícito; puede revocarlo en cualquier momento.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">4. Permisos del navegador</h3>
          <p>
            Solicitamos los siguientes permisos sólo cuando los necesitamos para una funcionalidad específica que usted activa:
          </p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li>
              <strong>Ubicación (Geolocation API)</strong> — para mostrarle resultados "cerca de mí" en el buscador. La solicitud
              aparece sólo cuando pulsa "Usar mi ubicación". Puede revocar el permiso desde la configuración del navegador.
            </li>
            <li>
              <strong>Micrófono (Speech Recognition API)</strong> — para el modo voz del asistente virtual. La transcripción
              se realiza en su dispositivo o en el servicio del proveedor del navegador. Sólo el texto resultante llega a la Plataforma.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">5. Cookies y tecnologías similares</h3>
          <p>
            Usamos cookies estrictamente necesarias para el funcionamiento (sesión, preferencias del usuario, preferencia de modo voz),
            y cookies analíticas anonimizadas para entender el uso agregado del sitio. No usamos cookies publicitarias de terceros
            por defecto.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">6. Conservación</h3>
          <p>
            Conservamos sus datos durante el tiempo necesario para cumplir las finalidades indicadas y las obligaciones legales
            aplicables (típicamente 5 años para datos contables, 2 años para registros de navegación). Tras este plazo los datos
            se eliminan o anonimizan.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">7. Sus derechos</h3>
          <p>Usted tiene derecho a:</p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li><strong>Acceso</strong> — conocer qué datos tenemos sobre usted.</li>
            <li><strong>Rectificación</strong> — corregir datos inexactos.</li>
            <li><strong>Supresión / olvido</strong> — solicitar el borrado.</li>
            <li><strong>Limitación y oposición</strong> — restringir ciertos tratamientos.</li>
            <li><strong>Portabilidad</strong> — obtener una copia en formato estructurado.</li>
            <li><strong>Revocar el consentimiento</strong> en cualquier momento.</li>
          </ul>
          <p>
            Para ejercer estos derechos, escriba a{' '}
            <a href="mailto:privacy@cartagenatours.example" className="underline text-brand-blue">privacy@cartagenatours.example</a>.
            En Colombia, también puede presentar una queja ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong>.
            En la UE, ante su autoridad nacional de protección de datos.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">8. Seguridad</h3>
          <p>
            Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS), hash de contraseñas, control
            de acceso por roles, copias de seguridad cifradas y auditorías periódicas. Ningún sistema es 100 % seguro, pero
            mitigamos riesgos siguiendo buenas prácticas de la industria.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">9. Transferencias internacionales</h3>
          <p>
            Algunos proveedores tecnológicos (hosting, base de datos, pasarela de pagos) pueden estar ubicados fuera de Colombia,
            incluyendo Estados Unidos y la Unión Europea. Estos proveedores ofrecen niveles adecuados de protección y cláusulas
            contractuales estándar.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">10. Menores de edad</h3>
          <p>
            La Plataforma no está dirigida a menores de 14 años. No recopilamos datos a sabiendas de personas en esa franja.
            Si usted es padre/madre/tutor y considera que un menor nos proporcionó datos, contáctenos para su eliminación.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">11. Cambios en esta política</h3>
          <p>
            Podemos actualizar esta política. La fecha de última actualización aparece arriba. Le notificaremos los cambios
            sustanciales por correo electrónico o mediante aviso destacado en la Plataforma.
          </p>
        </section>

        <hr className="my-12 border-brand-brown/30" />

        {/* ============== ENGLISH ============== */}
        <section aria-labelledby="en-heading" className="prose prose-sm sm:prose-base max-w-none">
          <h2 id="en-heading" className="text-2xl font-semibold mt-8 mb-4">English</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. Data controller</h3>
          <p>
            <strong>Cartagena Tours</strong> is the controller of personal data collected through this website, pursuant to
            Colombian Law 1581 of 2012 and Decree 1377 of 2013, and international standards such as the EU General Data Protection
            Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Contact:{' '}
            <a href="mailto:privacy@cartagenatours.example" className="underline text-brand-blue">privacy@cartagenatours.example</a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. Data we collect</h3>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li><strong>Account:</strong> name, email, optional profile photo, hashed password.</li>
            <li><strong>Bookings:</strong> selected tour/lodging, dates, party size, payment method (processed by an external PSP; no full card numbers stored).</li>
            <li><strong>Location</strong> (optional): approximate coordinates from the browser Geolocation API, only when explicitly authorized.</li>
            <li><strong>Technical:</strong> IP, browser, OS, pages visited, timestamps.</li>
            <li><strong>Chatbot messages:</strong> text, and if you enabled voice mode, transcription generated on your device (audio is not sent to our servers; the resulting text is).</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. Purposes</h3>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li>Manage your account, bookings, payments and service communications.</li>
            <li>Personalize search results and suggestions based on your location.</li>
            <li>Improve the platform via aggregated, anonymized analytics.</li>
            <li>Comply with legal obligations (billing, fraud prevention).</li>
            <li>Send marketing communications only with your explicit consent, which you may revoke at any time.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">4. Browser permissions</h3>
          <p>We request the following permissions only when needed for a specific feature you trigger:</p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li><strong>Location (Geolocation API)</strong> — to show "near me" results. Triggered only when you click "Use my location". You may revoke from browser settings.</li>
            <li><strong>Microphone (Speech Recognition API)</strong> — for chatbot voice mode. Transcription happens on your device or via the browser vendor. Only resulting text reaches the Platform.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">5. Cookies</h3>
          <p>
            We use strictly necessary cookies (session, user preferences, voice-mode preference) and anonymized analytics cookies.
            We do not set third-party advertising cookies by default.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">6. Retention</h3>
          <p>
            We retain data only as long as needed to fulfill the stated purposes and applicable legal obligations (typically
            5 years for accounting, 2 years for navigation logs). Afterwards, data is deleted or anonymized.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">7. Your rights</h3>
          <p>You may exercise the following rights:</p>
          <ul className="list-disc pl-6 my-3 space-y-1">
            <li><strong>Access</strong>, <strong>rectification</strong>, <strong>deletion</strong>, <strong>restriction</strong>, <strong>portability</strong> and the right to <strong>withdraw consent</strong>.</li>
          </ul>
          <p>
            Email <a href="mailto:privacy@cartagenatours.example" className="underline text-brand-blue">privacy@cartagenatours.example</a> to exercise them.
            In Colombia you may also file a complaint with the Superintendence of Industry and Commerce (SIC); in the EU, with
            your national data-protection authority.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">8. Security</h3>
          <p>
            We apply reasonable technical and organizational measures: TLS in transit, password hashing, role-based access, encrypted backups, periodic audits.
            No system is 100% secure, but we follow industry best practices.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">9. International transfers</h3>
          <p>
            Some technology providers (hosting, database, payment gateway) may be located outside Colombia, including the US and EU.
            These providers offer adequate protection and standard contractual clauses.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">10. Minors</h3>
          <p>
            The Platform is not directed to children under 14. We do not knowingly collect their data. Parents or guardians may
            contact us for removal.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">11. Changes</h3>
          <p>
            We may update this policy. The last-updated date appears above. Material changes will be notified by email or with
            a prominent notice on the Platform.
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t border-brand-brown/30 flex flex-wrap gap-4 justify-between text-sm">
          <Link to="/terminos-y-condiciones" className="text-brand-blue underline focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            Ver Términos y Condiciones →
          </Link>
          <Link to="/" className="text-brand-dark/60 hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            ← Volver al inicio
          </Link>
        </footer>
      </div>
    </article>
  );
};

export default PrivacyPage;

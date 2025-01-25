import React from 'react';
import './ProteccionDatos.css';

const ProteccionDatos = () => {
  return (
    <div className="proteccion-datos-container">
      <h1>Política de Protección de Datos</h1>

      <section>
        <h2>1. Identificación del Responsable del Tratamiento de Datos</h2>
        <p>
          TirePro, identificada con NIT [NIT], con domicilio en [DIRECCIÓN], Bogotá, Colombia, es responsable del tratamiento de los datos personales recogidos a través de la plataforma. Puede contactarnos para cualquier consulta o ejercicio de derechos en:
        </p>
        <ul>
          <li><strong>Correo electrónico:</strong> [CORREO]</li>
          <li><strong>Teléfono:</strong> [TELÉFONO]</li>
        </ul>
      </section>

      <section>
        <h2>2. Finalidades del Tratamiento</h2>
        <p>TirePro recopila y utiliza datos personales con los siguientes propósitos principales:</p>
        <ol>
          <li>
            <strong>Provisión de Servicios:</strong>
            <ul>
              <li>Brindar herramientas para la gestión y optimización de neumáticos, incluidas inspecciones, monitoreo de datos operativos y generación de recomendaciones personalizadas mediante inteligencia artificial (IA).</li>
            </ul>
          </li>
          <li>
            <strong>Entrenamiento de Modelos de IA:</strong>
            <ul>
              <li>Utilizar datos anonimizados, incluidas imágenes de neumáticos y registros operativos, para mejorar la capacidad predictiva y la eficacia de los algoritmos actuales y futuros, garantizando siempre la protección de los datos sensibles y personales de los usuarios.</li>
            </ul>
          </li>
          <li>
            <strong>Análisis y Reportes:</strong>
            <ul>
              <li>Realizar análisis históricos y en tiempo real para ayudar a los Clientes a tomar decisiones fundamentadas sobre la gestión de sus flotas.</li>
            </ul>
          </li>
          <li>
            <strong>Soporte y Mejoras Continuas:</strong>
            <ul>
              <li>Resolver incidencias reportadas por los Clientes y mejorar continuamente la funcionalidad y seguridad de la plataforma.</li>
            </ul>
          </li>
          <li>
            <strong>Cumplimiento Legal:</strong>
            <ul>
              <li>Cumplir con las obligaciones legales, reglamentarias y contractuales aplicables en Colombia.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h2>3. Datos Recopilados</h2>
        <p>TirePro podrá recopilar y tratar los siguientes tipos de datos personales:</p>
        <ol>
          <li><strong>Datos de Identificación:</strong> Nombre, dirección de correo electrónico, número de teléfono, información de registro.</li>
          <li><strong>Datos Operativos:</strong> Detalles sobre neumáticos (marca, modelo, fabricante, costos), imágenes cargadas por los usuarios, inspecciones y reportes.</li>
          <li><strong>Datos de Navegación:</strong> Dirección IP, información de dispositivos utilizados para acceder a la plataforma, datos de cookies y otras tecnologías de seguimiento.</li>
          <li><strong>Datos Sensibles:</strong> Fotografías de neumáticos u otra información que pueda ser considerada sensible bajo la Ley 1581 de 2012.</li>
        </ol>
      </section>

      <section>
        <h2>4. Tratamiento de Datos Sensibles</h2>
        <p>
          El tratamiento de datos sensibles se realizará únicamente con el consentimiento expreso del titular, garantizando medidas de seguridad reforzadas. Estos datos se utilizarán exclusivamente para:
        </p>
        <ul>
          <li>Evaluar el estado de los neumáticos mediante IA.</li>
          <li>Entrenar modelos predictivos para generar recomendaciones precisas y personalizadas.</li>
          <li>Proveer análisis técnicos a los Clientes.</li>
        </ul>
        <p>
          TirePro garantiza que los datos sensibles no serán utilizados para fines distintos a los autorizados ni serán divulgados a terceros sin consentimiento previo.
        </p>
      </section>

      <section>
        <h2>5. Seguridad de la Información</h2>
        <p>TirePro adopta medidas técnicas, administrativas y físicas para garantizar la seguridad de los datos personales, entre ellas:</p>
        <ol>
          <li>
            <strong>Cifrado de Datos:</strong> Los datos personales se cifran mediante el algoritmo Bcrypt (Blowfish) durante su almacenamiento y transmisión, lo que reduce significativamente el riesgo de accesos no autorizados.
          </li>
          <li>
            <strong>Control de Acceso:</strong>
            <ul>
              <li>El acceso a los datos personales está restringido exclusivamente a personal autorizado que necesita procesarlos para cumplir con las finalidades descritas en esta política.</li>
              <li>Cada acceso está sujeto a controles de autenticación y auditoría.</li>
            </ul>
          </li>
          <li>
            <strong>Monitoreo y Auditorías:</strong>
            <ul>
              <li>Se realizan auditorías periódicas de seguridad para garantizar el cumplimiento de las mejores prácticas de la industria.</li>
              <li>Monitoreo continuo de posibles vulnerabilidades y amenazas.</li>
            </ul>
          </li>
          <li>
            <strong>Seguridad de Infraestructura:</strong>
            <ul>
              <li>TirePro utiliza servidores seguros alojados en proveedores certificados que cumplen con estándares internacionales como ISO/IEC 27001.</li>
            </ul>
          </li>
          <li>
            <strong>Políticas de Respuesta a Incidentes:</strong>
            <ul>
              <li>En caso de un incidente de seguridad que comprometa datos personales, TirePro implementará su plan de respuesta, informando a los titulares afectados y a las autoridades competentes dentro de los plazos establecidos por la ley.</li>
            </ul>
          </li>
        </ol>
        <p>
          <strong>Limitación:</strong> A pesar de nuestras robustas medidas de seguridad, no podemos garantizar al 100% la protección de los datos debido a posibles vulnerabilidades tecnológicas o ataques externos. El uso de la plataforma implica la aceptación de estos riesgos inherentes.
        </p>
      </section>

      <section>
        <h2>6. Transferencia y Transmisión de Datos</h2>
        <p>TirePro podrá transferir datos personales a terceros proveedores de servicios o socios tecnológicos ubicados dentro y fuera de Colombia, siempre garantizando:</p>
        <ol>
          <li>El cumplimiento de medidas de protección adecuadas conforme a la legislación colombiana e internacional.</li>
          <li>Que dichos terceros ofrezcan niveles equivalentes o superiores de seguridad en el tratamiento de datos.</li>
        </ol>
        <p>
          En casos de transferencias internacionales, TirePro garantizará el cumplimiento de lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377 de 2013, y aplicará las medidas contractuales necesarias para proteger la información transferida.
        </p>
        <p>
          TirePro podrá compartir datos anonimizados para fines estadísticos o de investigación, asegurando que no sea posible identificar a los titulares.
        </p>
      </section>

      <section>
        <h2>7. Derechos de los Titulares de los Datos</h2>
        <p>De acuerdo con la legislación colombiana, los titulares tienen los siguientes derechos:</p>
        <ol>
          <li><strong>Acceso:</strong> Conocer los datos personales que TirePro tiene almacenados y el tratamiento que se les da.</li>
          <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos, incompletos o desactualizados.</li>
          <li><strong>Eliminación:</strong> Pedir la eliminación de los datos cuando ya no sean necesarios para las finalidades del tratamiento.</li>
          <li><strong>Revocación del Consentimiento:</strong> Retirar en cualquier momento el consentimiento otorgado para el tratamiento de datos personales.</li>
          <li><strong>Consulta y Reclamación:</strong> Presentar solicitudes relacionadas con el uso de sus datos personales a través de los canales establecidos.</li>
        </ol>
        <p>
          Para ejercer estos derechos, los titulares deben enviar una solicitud a [CORREO] indicando su identificación, la descripción de la solicitud y los documentos de soporte necesarios.
        </p>
      </section>

      <section>
        <h2>8. Período de Conservación de Datos</h2>
        <p>
          Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades descritas en esta política y conforme a las obligaciones legales aplicables. Una vez cumplido este plazo, los datos serán eliminados de manera segura.
        </p>
      </section>

      <section>
        <h2>9. Modificaciones a la Política de Privacidad</h2>
        <p>
          TirePro se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Las actualizaciones serán notificadas a los titulares mediante la plataforma o por correo electrónico. La continuación en el uso de los servicios tras la notificación constituye la aceptación de los términos modificados.
        </p>
      </section>
    </div>
  );
};

export default ProteccionDatos;
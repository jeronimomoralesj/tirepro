import React, { useState } from 'react';

function EliminacionDatos() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Here you would typically make an API call to your backend
    // For now, we'll just simulate the email sending process
    const emailBody = `
      Solicitud de Eliminación de Datos
      Email de la cuenta: ${email}
    `;

    const mailtoLink = `mailto:jeronimo.morales@merquellantas.com?subject=Solicitud de Eliminación de Datos&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;

    setMessage('Solicitud enviada. Te enviaremos un correo de confirmación para verificar tu identidad.');
    setIsSubmitting(false);
  };

  return (
    <div>
      <section id="userDelete" className="data-deletion">
        <div className="data-deletion__container">
          <div className="data-deletion__content">
            <h2 className="data-deletion__title">
              Eliminación de Datos
            </h2>
            <p className="data-deletion__description">
              En cumplimiento con las políticas de privacidad y protección de datos, 
              ofrecemos a nuestros usuarios la posibilidad de solicitar la eliminación 
              de sus datos personales de nuestra plataforma.
            </p>
            <p className="data-deletion__info">
              Por favor, ingresa el correo electrónico asociado a tu cuenta. 
              Te enviaremos un correo de confirmación para verificar tu identidad 
              antes de procesar la solicitud.
            </p>
            
            <form onSubmit={handleSubmit} className="data-deletion__form">
              <div className="data-deletion__form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  className="data-deletion__input"
                />
              </div>
              
              <button
                type="submit"
                className="data-deletion__button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Eliminación de Datos'}
              </button>
            </form>

            {message && (
              <p className="data-deletion__message">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EliminacionDatos;
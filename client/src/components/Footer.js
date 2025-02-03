import React from 'react';
import { Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section links">
          <h3 className="footer-heading">Links Importantes</h3>
          <nav>
            <a href="/">Home</a>
            <a href="/terminos-condiciones">Terminos y Condiciones</a>
            <a href="/politica-datos">Privacidad de Datos</a>
            <a href="mailto:jeronimo.morales@merquellantas.com">Contáctanos</a>
            <a href="/eliminar-datos">Eliminar Datos</a>
          </nav>
        </div>

        <div className="footer-section contact">
          <h3 className="footer-heading">Contacto</h3>
          <ul>
            <li>
              <Mail size={16} />
              <a href="mailto:jeronimo.morales@merquellantas.com">jeronimo.morales@merquellantas.com</a>
            </li>
            <li>
              <Phone size={16} />
              <span>+57 310 660 5563</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Bogotá, Colombia</span>
            </li>
          </ul>
        </div>

        <div className="footer-section social">
          <h3 className="footer-heading">Síguenos</h3>
          <div className="social-icons">
            <a href="https://twitter.com/tirepro" target="_blank" rel="noopener noreferrer">
              <Twitter />
            </a>
            <a href="https://linkedin.com/company/tirepro" target="_blank" rel="noopener noreferrer">
              <Linkedin />
            </a>
            <a href="https://instagram.com/tirepro" target="_blank" rel="noopener noreferrer">
              <Instagram />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TirePro. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
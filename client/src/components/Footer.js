import React from 'react';
import { Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section links">
          <h3 className="footer-heading">Quick Links</h3>
          <nav>
            <a href="/">Home</a>
            <a href="/terminos-condiciones">Terms & Conditions</a>
            <a href="/politica-datos">Data Privacy</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>

        <div className="footer-section contact">
          <h3 className="footer-heading">Contact Info</h3>
          <ul>
            <li>
              <Mail size={16} />
              <a href="mailto:info@tirepro.com">info@tirepro.com</a>
            </li>
            <li>
              <Phone size={16} />
              <span>+57 123 456 7890</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Bogotá, Colombia</span>
            </li>
          </ul>
        </div>

        <div className="footer-section social">
          <h3 className="footer-heading">Follow Us</h3>
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
        <p>&copy; {new Date().getFullYear()} TirePro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
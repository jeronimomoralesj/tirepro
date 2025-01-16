import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Truck,
  GitBranch,
  Activity,
  Menu,
  CheckCircle,
  Linkedin
} from 'lucide-react';
import "./LandingPage.css"
import LandingImg from "../img/Landing.png"
import LogoText from "../img/logo_text.png"
import AppImg from "../img/app.png"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const founders = [
    {
      name: "Mateo Morales",
      role: "CEO & Co-Fundador",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHCGd8UB9m2AA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1685477838438?e=1742428800&v=beta&t=axZdaXzmpLtmHFEhCdl_1us1r_jwWWDwQNeBcztGf2A",
      bio: "Con más de 15 años de experiencia en gestión de flotas y tecnología. Anteriormente Director de Operaciones en TransporTech Solutions.",
      linkedin: "https://www.linkedin.com/in/mateomoralesj/",
      twitter: "#"
    },
    {
      name: "Jeronimo Morales",
      role: "Product development & Co-Fundador",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQFM4BmS6dGm6Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1709150478233?e=1742428800&v=beta&t=X7fDQz4sJrPc4w2XvQWdkE63QREy-wFwbmIfSWCDNjs",
      bio: "Ingeniera de Software con especialización en IA. Lideró equipos de desarrollo en importantes startups tecnológicas.",
      linkedin: "https://www.linkedin.com/in/jeronimo-morales/",
    }
  ];

  return (
    <div className="landing-page">
      <nav className="nav">
        <div className="nav__container">
          <div className="nav__logo"><img style={{height:"30px"}} src={LogoText} alt="Logo"/></div>
          
          <button className="nav__mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu />
          </button>

          <div className={`nav__links ${isMenuOpen ? 'nav__links--open' : ''}`}>
            <a onClick={() => scrollToSection('features')} className="nav__link">Funcionalidades</a>
            <a onClick={() => scrollToSection('pricing')} className="nav__link">Precios</a>
            <a onClick={() => scrollToSection('about')} className="nav__link">Nosotros</a>
            <Link to="/login" className="nav__link">Iniciar Sesión</Link>
            <Link to="/signup" className="nav__button">
              Quiero iniciar
              <ChevronRight className="icon" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <h1 className="hero__title">
            Gestione su Flota con <span className="hero__highlight">Inteligencia</span>
          </h1>
          <p className="hero__description">
            Optimice el rendimiento de sus llantas y reduzca costos operativos con nuestra 
            plataforma integral de gestión de flotas.
          </p>
          <div className="hero__buttons">
            <button className="button button--primary">
              Comenzar Ahora
              <ChevronRight className="icon" />
            </button>

          </div>
        </div>

        <div className="hero__image">
          <img 
            src={LandingImg} 
            alt="Dashboard Preview" 
            className="hero__dashboard"
          />
          <div className="hero__image-overlay"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <div className="features__header">
            <h2 className="features__title">Funcionalidades Principales</h2>
            <p className="features__subtitle">
              Todo lo que necesita para gestionar su flota de manera eficiente
            </p>
          </div>

          <div className="features__grid">
            {[
              {
                icon: <Truck />,
                title: 'Monitoreo en Tiempo Real',
                description: 'Seguimiento continuo del estado y rendimiento de su flota con actualizaciones instantáneas.'
              },
              {
                icon: <GitBranch />,
                title: 'Análisis Predictivo',
                description: 'Anticipe necesidades de mantenimiento y optimice la vida útil de sus neumáticos.'
              },
              {
                icon: <Activity />,
                title: 'Reportes Detallados',
                description: 'Informes completos y personalizables para una mejor toma de decisiones.'
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-card__icon">
                  {feature.icon}
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="pricing__container">
          <div className="pricing__header">
            <h2 className="pricing__title">Planes Simples y Transparentes</h2>
            <p className="pricing__subtitle">
              Elija el plan perfecto para su flota
            </p>
          </div>

          <div className="pricing__grid">
            <div className="pricing-card">
              <div className="pricing-card__header">
                <h3 className="pricing-card__title">Básico</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">$1,000,000</span>
                  <span className="pricing-card__period">/mes</span>
                </div>
                <p className="pricing-card__description">
                  Perfecto para flotas pequeñas
                </p>
              </div>
              <div className="pricing-card__features">
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Hasta 10 Perfiles</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Monitoreo</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Reportes mensuales</span>
                </div>
              </div>
              <button className="pricing-card__button">Seleccionar Plan</button>
            </div>

            <div className="pricing-card pricing-card--popular">
              <div className="pricing-card__popular-tag">Más Popular</div>
              <div className="pricing-card__header">
                <h3 className="pricing-card__title">Profesional</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">$4,000,000</span>
                  <span className="pricing-card__period">/mes</span>
                </div>
                <p className="pricing-card__description">
                  Para flotas en crecimiento
                </p>
              </div>
              <div className="pricing-card__features">
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Hasta 50 Usuarios</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Análisis predictivo</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Reportes semanales</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Soporte prioritario</span>
                </div>
              </div>
              <button className="pricing-card__button">Seleccionar Plan</button>
            </div>

            <div className="pricing-card">
              <div className="pricing-card__header">
                <h3 className="pricing-card__title">Empresarial</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">Personalizado</span>
                </div>
                <p className="pricing-card__description">
                  Para grandes flotas
                </p>
              </div>
              <div className="pricing-card__features">
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Flotas ilimitadas</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>API personalizada</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Soporte 24/7</span>
                </div>
                <div className="pricing-card__feature">
                  <CheckCircle className="pricing-card__icon" />
                  <span>Implementación dedicada</span>
                </div>
              </div>
              <button className="pricing-card__button">Contactar Ventas</button>
            </div>
          </div>
        </div>
      </section>

      { /*  App seciton */}

      <section className="app-section">
  <div className="app-section__container">
    <div className="app-section__content">
      <h2 className="app-section__title">
        Lleve el Control en sus Manos
      </h2>
      <p className="app-section__description">
        Descargue nuestra aplicación móvil y gestione su flota desde cualquier lugar. 
        Acceda a información en tiempo real, reciba notificaciones importantes y tome 
        decisiones informadas al instante.
      </p>
      <div className="app-section__buttons">
        <a href="#" className="app-section__store-button">
          <img 
            src="https://cdn.pixabay.com/photo/2021/09/22/16/07/app-store-6647240_1280.png" 
            alt="Download on App Store" 
            className="app-section__store-image"
          />
        </a>
        <a href="#" className="app-section__store-button">
          <img 
            src="https://cdn.pixabay.com/photo/2021/09/22/16/07/google-play-6647242_1280.png" 
            alt="Get it on Google Play" 
            className="app-section__store-image"
          />
        </a>
      </div>
    </div>
    <div className="app-section__image-container">
      <img 
        src={AppImg} 
        alt="Mobile App Preview" 
        className="app-section__app-image"
      />
    </div>
  </div>
</section>
<hr style={{ marginLeft:"20%", marginRight:"20%" }}/>
      {/* About Section */}
      <section id="about" className="about">
        <div className="about__container">
          <div className="about__header">
            <h2 className="about__title">Nuestros Fundadores</h2>
            <p className="about__subtitle">
              Conoce al equipo detrás de la innovación en gestión de flotas
            </p>
          </div>

          <div className="about__founders">
            {founders.map((founder, index) => (
              <div key={index} className="founder-card">
                <div className="founder-card__image-container">
                  <img 
                    src={founder.image} 
                    alt={founder.name}
                    className="founder-card__image"
                  />
                </div>
                <div className="founder-card__content">
                  <h3 className="founder-card__name">{founder.name}</h3>
                  <p className="founder-card__role">{founder.role}</p>
                  <p className="founder-card__bio">{founder.bio}</p>
                  <div className="founder-card__social">
                    <a href={founder.linkedin} className="founder-card__social-link">
                    <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="about__stats">
            <div className="about__stat">
              <div className="about__stat-value">5+ años</div>
              <div className="about__stat-label">De Experiencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats__container">
          {[
            { label: 'Clientes Activos', value: '3+' },
            { label: 'Vehículos Monitoreados', value: '30+' },
            { label: 'Ahorro Promedio', value: '30%' },
            { label: 'Satisfacción', value: '100%' }
          ].map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
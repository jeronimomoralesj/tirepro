import React from 'react';
import './Home.css'; // Import the CSS file for styling
import { FiHome } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className='inner'>
      <FiHome />
      </div>

      <div className='inner'>
      <FaRegStar />
      </div>

      <div className='inner'>
      <Link to={"/iniciar"}><button className='red'>Inicia sesión</button></Link>
      </div>

      <div className='inner'>
      <button className='purple'>Crear cuenta</button>
      </div>
    </nav>
  );
};

const Home = () => {
  return (
    <div className="home">
      <Navbar /> 
      <header className="home-header">
        <h1>Maximiza el Rendimiento de Tus Llantas</h1>
        <p>Reduce los Costos de Tu Flota</p>
        <button className="home-button">Get Started</button>
      </header>
      <section className="home-content">
        <img 
          src="https://assets.justinmind.com/wp-content/uploads/2020/02/dashboard-example-applify.png" 
          alt="Dashboard Example" 
          className="home-image" 
        />
        <p className="home-text">
          Gestiona y predice el desgaste de llantas para reducir costos operativos en tu flota.
        </p>
      </section>
    </div>
  );
};

export default Home;

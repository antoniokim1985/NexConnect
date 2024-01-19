import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import nblanco from "../../img/nblanco.png";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';


export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    // Inicializa el estado con el valor almacenado en localStorage o false por defecto
    return localStorage.getItem("darkMode") === "true" ? true : false;
  });
  const [rol, setRol] = useState(0)

  useEffect(() => {
    // Actualiza el valor en localStorage cada vez que cambia el estado
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle('dark', darkMode);
    setRol(store.user_role_id)
  }, [darkMode, store.user_role_id, store.roles]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const handleLogout = () => {
    actions.logout()
  }



  const homeNavbar = (<nav className="navbar navbar-expand-lg navbar-light bg-primary">
    <div className="container mx-5">
      <Link className="navbar-brand" to="/">
        <img src={nblanco} className="logo-nav" alt="Logo" />
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ml-auto">
          {location.pathname == "/" && (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white font-extralight" to="/registro">
                  Registrarse
                </Link>
              </li>

            </>
          )}
          {location.pathname == '/registro' && (
            <li className="nav-item">
              <Link className="nav-link text-white font-extralight" to="/">
                Iniciar sesión
              </Link>
            </li>)}

          <li className="nav-item d-flex align-items-center">
            {/* Cambiar entre íconos de sol y luna según el modo actual */}
            <button className="bg-transparent border-0" onClick={toggleDarkMode}>
              {darkMode ? (
                <i className="fas fa-moon text-dark ms-4"></i>
              ) : (
                <i className="fas fa-sun text-light ms-4"></i>
              )}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>)


  const adminNavbar = (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary">
      <div className="container mx-5">
        <Link className="navbar-brand" to="/">
          <img src={nblanco} className="logo-nav" alt="Logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">

            <li className="nav-item">
              <Link className="nav-link text-white font-extralight" to="/posts/create">
                Crear posts
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white font-extralight" to="/admin">
                Admin
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white font-extralight" to={'/roles'}>
                Roles
              </Link>
            </li>

            <li className="nav-item d-flex align-items-center">
              {/* Cambiar entre íconos de sol y luna según el modo actual */}
              <button className="bg-transparent border-0" onClick={toggleDarkMode}>
                {darkMode ? (
                  <i className="fas fa-moon text-dark ms-4"></i>
                ) : (
                  <i className="fas fa-sun text-light ms-4"></i>
                )}
              </button>
            </li>
            <li className="nav-item align-items-center d-flex ms-5">
              <button onClick={handleLogout}><i className="fa-solid fa-power-off align-items-center"></i></button>
            </li>
          </ul>
        </div>
      </div>

    </nav>)

  const userNavbar = (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary">
      <div className="container mx-5">
        <Link className="navbar-brand" to="/">
          <img src={nblanco} className="logo-nav" alt="Logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item d-flex align-items-center">
              {/* Cambiar entre íconos de sol y luna según el modo actual */}
              <button className="bg-transparent border-0" onClick={toggleDarkMode}>
                {darkMode ? (
                  <i className="fas fa-moon text-dark ms-4"></i>
                ) : (
                  <i className="fas fa-sun text-light ms-4"></i>
                )}
              </button>
            </li>
            <li className="nav-item align-items-center d-flex ms-5">
              <button onClick={handleLogout}><i className="fa-solid fa-power-off align-items-center"></i></button>
            </li>
          </ul>
        </div>
      </div>
    </nav>)




  return (
    <>
      {rol === "0" && homeNavbar}
      {rol === "1" && adminNavbar}
      {rol !== "1" && rol !== "0" && userNavbar}
    </>
  );
};

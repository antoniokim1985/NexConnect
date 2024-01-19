import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Postimg from "../../img/posts-img.png";
import Swal from 'sweetalert2'

export const Home = () => {
    const { store, actions } = useContext(Context);
    const [loginError, setLoginError] = useState(null)
    const navigate = useNavigate()
    const [errMsg, setErrMsg] = useState()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const validateEmail = (email) => {
        // Puedes usar una expresión regular para validar el formato del correo electrónico
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async () => {
        // Validación de campos vacíos
        for (const key in formData) {
            if (formData[key] === "") {
                setLoginError(true);
                setErrMsg(`El campo ${key} no puede estar vacío.`);
                return;
            }
        }
        if (!validateEmail(formData.email)) {
            setLoginError(true);
            setErrMsg("Por favor, introduce un correo electrónico válido.");
            return;
        }
        // Enviar datos al backend o realizar acciones necesarias
        const result = await actions.login(formData);
        if (result.success) {
            // Redireccionar a /posts en caso de éxito
            navigate('/posts');
        } else {
            // Mostrar mensaje de error en el front
            setLoginError(true);
            setErrMsg("Credenciales inválidas");
            return
        }
        // Limpiar el formulario después del registro exitoso
        setFormData({
            email: "",
            password: ""
        });
        setLoginError(false);
    };
    useEffect(() => {
        // Se ejecutará cada vez que errMsg se actualice
        // verifica si el usuario esta logeado no muestra el home 
        if (store.token) {
            navigate('/posts');
        }
    }, [errMsg]);

    const handleForwotPass = () => {
        Swal.fire({
            title: "¿Olvidaste la contraseña?",
            text: "Envia un E-mail a soporte@nexconnect.com con tus datos para reestrablecer tu contraseña",
            icon: "question"
        });
    }
    return (
        <div className="container h-screen mt-5 mb-11" >
            <div className="row">
                <div className="col-12 mb-3 text-center">
                    <h2 className="text-3xl md:text-6xl font-bold text-center text-dark-black dark:text-principal-white big-text">
                        NexConnect
                    </h2>
                </div>
                <div className="col-md-6 mb-3 mt-5">
                    <img src={Postimg} alt="Posts" className="w-100 h-auto" />
                </div>
                <div className="col-md-6 mt-5 ">
                    <div className="form registro rounded shadow  mb-5 dark:bg-dark-black h-100 p-4 pt-5 ">
                        <div className="mb-3 mt-5 ">
                            <input
                                type="email"
                                className="form-control mb-4 "
                                placeholder="tuemail@email.com"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                className="form-control mb-4"
                                placeholder="Tu Contraseña"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <div className="text-center">
                                <button type="button" className="btn bg-dark-black  mt-4 text-principal-white border-2 hover:bg-principal-white hover:border-dark-black hover:text-dark-black" onClick={handleSubmit}>
                                    Iniciar Sesion
                                </button>
                                {loginError ? (
                                    <div>
                                        <p className="p-alerta border-bottom border-danger mt-3" style={{ color: "red" }}>{errMsg}</p>
                                    </div>
                                ) : (<div>
                                </div>)}
                                <div className="container d-flex justify-center mt-4">
                                    <button className="bg-transparent" onClick={handleForwotPass}> Olvide mi contraseña</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

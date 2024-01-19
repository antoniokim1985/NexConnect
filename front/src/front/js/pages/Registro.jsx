import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import Postimg from "../../img/posts-img.png";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'

export const Registro = () => {
    const { store, actions } = useContext(Context);
    const [registroError, setRegistroError] = useState(null)
    const navigate = useNavigate()
    const [errMsg, setErrMsg] = useState("")
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        rol_id: "" // Nuevo campo para el rol_id
    });
    const [editUser, setEditUser] = useState({
        rol_id: "" // Asegúrate de que esto esté definido correctamente
    });
    const [roles, setRoles] = useState([])
    useEffect(() => {
        const fetchRoles = async () => {
            const resp = await actions.getRoles()
            if (resp.success) {
                setRoles(store.roles)
            }
        }
        fetchRoles()
    }, [])
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRadioChange = (e) => {
        // Asignar rol_id según la opción seleccionada
        const roleMappings = {
            maestro: 2,
            alumno: 3,
            padre: 4
        };
        setFormData({
            ...formData,
            rol_id: roleMappings[e.target.value]
        });
    };
    const validateEmail = (email) => {
        // Expresión regular actualizada para requerir al menos dos caracteres después del último punto
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return regex.test(email);
    };


    const handleSubmit = async () => {
        // Validación de campos vacíos
        for (const key in formData) {
            if (formData[key] === "") {
                setRegistroError(true);
                setErrMsg(`El campo ${key} no puede estar vacío.`);
                return;
            }
        }

        // Validación de contraseñas iguales
        if (formData.password !== formData.confirmPassword) {
            setRegistroError(true);
            setErrMsg("Las contraseñas no coinciden.");
            return;
        }

        // Validación de correo electrónico
        if (formData.email !== "" && !validateEmail(formData.email)) {
            setRegistroError(true);
            setErrMsg("Por favor, introduce un correo electrónico válido.");
            return;
        }
        const dataToSend = { ...formData };
        delete dataToSend.confirmPassword;
        // Enviar datos al backend o realizar acciones necesarias
        const result = await actions.createUser(dataToSend);
        if (result.message === "Usuario creado exitosamente") {
            setRegistroError(false);
            setErrMsg(result.message);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: result.message,
                showConfirmButton: false,
                timer: 2500
            });
            navigate('/')
        } else {
            setRegistroError(true);
            setErrMsg(result.message);
        }
        // Limpiar el formulario después del registro exitoso
        setFormData({
            nombre: "",
            apellido: "",
            email: "",
            password: "",
            confirmPassword: "",
            rol_id: ""
        });
    };


    return (
        <div className="container h-screen mt-5 ">
            <div className="row">
                <div className="col-12 mb-3 text-center">
                    <h2 className="text-3xl md:text-6xl font-bold text-center text-dark-black dark:text-principal-white big-text">
                        Crear Cuenta
                    </h2>
                </div>
                <div className="col-md-6 mb-3">
                    <img src={Postimg} alt="Posts" className="w-100 h-auto" />
                </div>
                <div className="col-md-6">
                    <div className="form registro bg-white dark:bg-gray-700 p-4 rounded border shadow p-3 mb-5 bg-body-tertiary rounded">
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control my-3"
                                placeholder="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                className="form-control my-3"
                                placeholder="Apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                            />
                            <input
                                type="email"
                                className="form-control my-3"
                                placeholder="tuemail@email.com"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                className="form-control my-3"
                                placeholder="Tu Contraseña"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                className="form-control my-3"
                                placeholder="Repetir Contraseña"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <div className="mb-3 text-start">
                                <label htmlFor="rol" className="form-label text-dark-black">
                                    Rol
                                </label>
                                <select
                                    className="form-select"
                                    id="rol"
                                    value={formData.rol_id}
                                    onChange={(e) => handleChange(e)}
                                    name="rol_id"
                                >
                                    <option value="" disabled selected>
                                        Seleccionar Rol
                                    </option>
                                    {roles
                                        .filter((role) => role.rol.toLowerCase() !== 'admin')  // Filtra los roles que no sean 'admin'
                                        .map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.rol}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="text-center">
                                <button type="button" className="btn btn-outline-dark" onClick={handleSubmit}>
                                    Registrar
                                </button>
                                {registroError ? (
                                    <div>
                                        <p className="p-alerta border-bottom border-danger mt-3" style={{ color: "red" }}>{errMsg}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="p-alerta  mt-3" style={{ color: "green" }}>{errMsg}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

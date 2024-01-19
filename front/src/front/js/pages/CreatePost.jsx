import { document } from "postcss";
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Context } from "../store/appContext";
import Swal from 'sweetalert2';

export const CreatePost = () => {
  const { store, actions } = useContext(Context);
  const [roles, setRoles] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    rol_id: "",
    titulo: "",
    descripcion: "",
    imagen: "",
    archivo: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const selectedFile = files[0];

    if (name === "imagen" && !selectedFile.type.startsWith("image/")) {
      Swal.fire({
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        icon: 'error',
        title: 'Error al subir archivo',
        text: 'Por favor, seleccione un archivo de imagen válido.',
        customClass: "swal-small"
      });
      // Limpiar el campo de imagen
      e.target.value = null;
      return;
    }
    if (name === "pdf" && selectedFile.type.startsWith("image/")) {
      Swal.fire({
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        icon: 'error',
        title: 'Error al subir archivo',
        text: 'Por favor, seleccione un archivo texto válido.',
        customClass: "swal-small"
      });
      // Limpiar el campo de pdf
      e.target.value = null;
      return;
    }

    setFormData({
      ...formData,
      [name]: selectedFile,
    });
  };

  const handleDropdownChange = (e) => {
    const value = e.target.options[e.target.selectedIndex].value;
    setFormData({
      ...formData,
      rol_id: value,
    });
  };

  const handleLimpiar = () => {
    setFormData({
      rol_id: "",
      titulo: "",
      descripcion: "",
      imagen: "",
      archivo: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    const resp = await actions.createPost(formDataToSend);
    if (resp.success) {
      Swal.fire({
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        icon: 'success',
        title: 'Post Creado',
        text: 'El Post fue creado exitosamente',
        customClass: "swal-small"
      });
      handleLimpiar();
      navigate('/')
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const resp = await actions.getRoles()
      if (resp.success) {
        setRoles(store.roles)
      }
    }
    fetchRoles()
  }, [])

  return (
    <div className="container mb-5 mt-5">
      <div className="row">
        <div className="col-12 mb-3 text-start">
          <h2 className="text-3xl md:text-6xl font-bold text-dark-black dark:text-principal-white big-text">
            Crear nuevo <span className="text-color-primary">Post </span>📑
          </h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="">
        <div className="container dark:bg-dark-black dark:border-dark-black mt-4 rounded-2xl border-5  shadow-2xl border-[#F9FCFD] bg-[#F9FCFD] p-5 ">
          <div className="container  whitespace-normal md:whitespace-pre">
            <div className="mb-3">
              <label htmlFor="titulo" className="form-label text-dark-black font-bold dark:text-principal-white ">
                Título:
              </label>
              <input
                type="text"
                className="form-control"
                id="titulo"
                name="titulo"
                placeholder="Ingrese el título"
                value={formData.titulo}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label text-dark-black font-bold dark:text-principal-white " >
                Descripción:
              </label>
              <textarea
                className="form-control"
                id="descripcion"
                name="descripcion"
                rows="3"
                placeholder="Ingrese la descripción"
                value={formData.descripcion}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="imagen" className="form-label text-dark-black font-bold dark:text-principal-white ">
                Añadir imágenes:
              </label>
              <input
                className="form-control"
                type="file"
                id="imagen"
                name="imagen"
                onChange={handleFileChange}
              />
            </div>
            <div className="mb-3 ">
              <label htmlFor="archivo" className="form-label text-dark-black font-bold dark:text-principal-white ">
                Añadir PDF:
              </label>
              <input
                className="form-control "
                type="file"
                id="archivo"
                name="archivo"
                onChange={handleFileChange}
              />
            </div>
            <div className="mb-3 d-flex  justify-between ">
              <label htmlFor="rol_id" className="form-label text-dark-black font-bold dark:text-principal-white ">
                Postear a:
              </label>
              <div className="dropdown"><label htmlFor="rol" className="form-label text-dark-black">
                Rol
              </label>
                <select
                  className="form-select"
                  id="rol"
                  value={formData.rol_id}
                  onChange={handleDropdownChange} // Cambiado para pasar directamente la función
                  name="rol_id"
                >
                  <option value="" disabled selected>
                    Seleccionar Rol
                  </option>
                  {roles
                    .filter((role) => role.rol.toLowerCase() !== 'admin')
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.rol}
                      </option>
                    ))}
                </select></div>
            </div>
            <div className="mb-3 mt-5 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-dark mx-3"
                onClick={handleLimpiar}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="border border-dark-black btn bg-dark-black text-principal-white hover:text-dark-black hover:border-dark-black hover:border hover:bg-principal-white"
              >
                Crear Post
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

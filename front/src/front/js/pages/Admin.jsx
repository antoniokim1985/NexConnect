import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2'

export const Admin = () => {
  const { store, actions } = useContext(Context);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const usuariosPerPage = 3;
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [password, setPassword] = useState("")
  // Puedes utilizar este array en lugar del array vacío que tenías en tu código.

  const offset = currentPage * usuariosPerPage;
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentUsuarios = filteredUsuarios.slice(offset, offset + usuariosPerPage);
  const pageCount = Math.ceil(filteredUsuarios.length / usuariosPerPage);
  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage);
  };

  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Función asincrónica para obtener los usuarios
  const fetchUsuarios = async () => {
    try {
      const data = await actions.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error fetching usuarios", error);
    }
  };
  const handleEdit = (user) => {
    setEditUser(user);
    setConfirmPassword(user.password)
    setPassword(user.password)
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditUser(null);
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    if (password !== confirmPassword) {
      // Muestra un mensaje de error indicando que las contraseñas no coinciden
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }
    let editedFields = {};
    if (password.trim() !== "") {
      editedFields.password = password;
    }
    const userToUpdate = {
      nombre: editUser.nombre,
      apellido: editUser.apellido,
      email: editUser.email,
      rol_id: editUser.rol_id,
      ...editedFields,
    };

    try {
      const resp = await actions.updateUser(userToUpdate, editUser.id)
      if (resp.success) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `El Usuario se Edito exitosamente`,
          showConfirmButton: false,
          timer: 2500
        });
        fetchUsuarios();
      }
    } catch (error) {

    }
    handleCloseModal();
  };

  useEffect(() => {
    // Función asincrónica para obtener los usuarios
    const fetchUsuarios = async () => {
      try {
        const data = await actions.getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error fetching usuarios", error);
      }
    };
    fetchUsuarios();
    const fetchRoles = async () => {
      try {
        const data = await actions.getRoles()
        if (data.success) {
          setRoles(store.roles)
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchRoles()
  }, [currentPage]);

  const getRolById = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.rol : 'Desconocido';
  };
  const handleDelete = async (userId) => {
    try {
      const confirmation = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo'
      });

      if (confirmation.isConfirmed) {
        const resp = await actions.deleteUser(userId);
        if (resp.success) {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `El Usuario se eliminó exitosamente`,
            showConfirmButton: false,
            timer: 2500
          });

          fetchUsuarios();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {

    }
  };

  return (
    <div className="container h-screen mt-5">
      <div className="row">
        <div className="col-12 mb-3 text-start">
          <h2 className="text-3xl md:text-6xl font-bold text-start text-dark-black dark:text-principal-white big-text">
            Administración 🗃️
          </h2>
        </div>
        <div className="container d-flex justify-content-center">
          <div className="mt-5 d-flex align-items-center justify-content-between w-50">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Buscar usuario"
              aria-label="Buscar usuario"
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(0);
                setSearchTerm(e.target.value.trim());
              }}
            />
          </div>
        </div>
        <div className="col-md-12  mt-5">
          <div className="form registro  p-4 rounded border shadow p-3 mb-5 dark:bg-dark-black  rounded">
            <table className="table table-borderless bg-transparent table-hover ">
              <thead className="">
                <tr className="bg-transparent">
                  <th className="bg-transparent " scope="col">
                    <p className="dark:text-principal-white">Nombre</p>
                  </th>
                  <th className="bg-transparent" scope="col">
                    <p className="dark:text-principal-white">Apellido</p>
                  </th>
                  <th className="bg-transparent" scope="col">
                    <p className="dark:text-principal-white">Email</p>
                  </th>
                  <th className="bg-transparent" scope="col">
                    <p className="dark:text-principal-white">Rol</p>
                  </th>
                  <th className="bg-transparent" scope="col">
                    <p className="text-transparent">edit</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className={`bg-transparent ${hoveredUserId === usuario.id ? "hover:bg-gray-200" : ""
                      }`}
                    onMouseEnter={() => setHoveredUserId(usuario.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                  >
                    <td className="bg-transparent" scope="row">
                      <p className="dark:text-principal-white">{usuario.nombre}</p>
                    </td>
                    <td className="bg-transparent"><p className="dark:text-principal-white">{usuario.apellido}</p></td>
                    <td className="bg-transparent">
                      <p className="inline-block dark:text-principal-white">{usuario.email}</p>
                    </td>
                    <td className="bg-transparent">
                      <p
                        className={`font-black inline-block rounded px-2 text-center capitalize text-dark-black  dark:text-principal-white`}
                      >
                        {getRolById(usuario.rol_id)}
                      </p>
                    </td>
                    <td className="bg-transparent">
                      <div className="edit-icons-container">
                        {hoveredUserId === usuario.id && (
                          <>
                            <button onClick={() => handleEdit(usuario)}>
                              <i className="fa-solid fa-pencil dark:text-principal-white dark:hover:text-color-primary hover:text-color-primary me-5"></i>
                            </button>
                            <button onClick={() => handleDelete(usuario.id)}>
                              <i className="fa-solid fa-trash dark:text-principal-white hover:text-red-500 dark:hover:text-red-500 "></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-center mt-5">
              <ReactPaginate
                previousLabel={"Anterior"}
                nextLabel={"Siguiente"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active dark:text-principal-white"}  // Clase para la página activa
                pageClassName={"custom-page-class dark:text-principal-white"}  // Clase para las páginas
                previousClassName={"custom-previous-class dark:text-principal-white"}  // Clase para "Anterior"
                nextClassName={"custom-next-class dark:text-principal-white"}  // Clase para "Siguiente"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Modal para editar usuario */}
      <Modal show={showModal} onHide={handleCloseModal} className="text-center ">
        <Modal.Header className="dark:bg-dark-black" closeButton>
          <Modal.Title className="dark:bg-dark-black">Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="dark:bg-dark-black">
          {/* Formulario para editar el usuario */}
          {editUser && (
            <form className=" dark:text-principal-white">
              <div className="mb-3 text-start">
                <label htmlFor="nombre" className="form-label text-dark-black dark:text-principal-white">
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  value={editUser.nombre}
                  onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
                />
              </div>
              <div className="mb-3 text-start">
                <label htmlFor="apellido" className="form-label text-dark-black dark:text-principal-white">
                  Apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="apellido"
                  value={editUser.apellido}
                  onChange={(e) => setEditUser({ ...editUser, apellido: e.target.value })}
                />
              </div>
              <div className="mb-3 text-start">
                <label htmlFor="email" className="form-label text-dark-black">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="mb-3 text-start">
                <label htmlFor="password" className="form-label text-dark-black dark:text-principal-white">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-3 text-start">
                <label htmlFor="confirmPassword" className="form-label text-dark-black dark:text-principal-white ">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="mb-3 text-start">
                <label htmlFor="rol" className="form-label  text-dark-black dark:text-principal-white">
                  Rol
                </label>
                <select
                  className="form-select text-dark-black dark:text-principal-white capitalize"
                  id="rol"
                  value={editUser.rol_id}
                  onChange={(e) => setEditUser({ ...editUser, rol_id: parseInt(e.target.value) })}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="capitalize">
                      {role.rol}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer className="dark:bg-dark-black">
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Admin;

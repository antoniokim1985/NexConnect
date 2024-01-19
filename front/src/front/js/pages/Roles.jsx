import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Button, Modal } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2'

export const Roles = () => {
    const { store, actions } = useContext(Context);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const rolesPerPage = 3;
    const [showModal, setShowModal] = useState(false);
    const [editRol, setEditRol] = useState(null);
    const [roles, setRoles] = useState([]);
    const [newRol, setNewRol] = useState({
        rol: ""
    })

    const offset = currentPage * rolesPerPage;
    const filteredRoles = roles.filter(
        (rol) =>
            rol.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentRoles = filteredRoles.slice(offset, offset + rolesPerPage);

    const pageCount = Math.ceil(filteredRoles.length / rolesPerPage);

    const handlePageClick = ({ selected: selectedPage }) => {
        setCurrentPage(selectedPage);
    };

    const [hoveredRolId, setHoveredRolId] = useState(null);

    const [editedRolId, setEditedRolId] = useState(null);

    const handleCreate = async () => {
        if (typeof newRol.rol !== "string" || newRol.rol.trim() === "") {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "El Nombre del Rol no puede ir vacío",
            showConfirmButton: false,
            timer: 2500,
          });
        } else {
          try {
            const resp = await actions.createRol(newRol);
            if (resp.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `El Rol "${newRol.rol}" se creó exitosamente`,
                showConfirmButton: false,
                timer: 2500,
              });
              // Actualiza la lista de roles después de la creación exitosa
              const fetchRoles = async () => {
                try {
                  const resp = await actions.getRoles();
                  if (resp.success) {
                    setRoles(store.roles);
                  }
                } catch (error) {
                  console.error("Error fetching roles", error);
                }
              };
      
              // Llamada a la función asincrónica
              fetchRoles();
            }
          } catch (error) {
            console.error(error);
          } finally {
            setNewRol({ rol: "" });
          }
        }
      };
      

    const handleEdit = (rol) => {
        setEditRol(rol);
        setEditedRolId(rol.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setEditRol(null);
        setShowModal(false);
    };

    const handleSaveChanges = async () => {
        try {
            const resp = await actions.editRol(editRol, editedRolId)
            if (resp.success) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: `El Rol se edito exitosamente`,
                    showConfirmButton: false,
                    timer: 2500
                });
            }
            // Función asincrónica para obtener los roles
            const fetchRoles = async () => {
                try {
                    const resp = await actions.getRoles()
                    if (resp.success) {
                        setRoles(store.roles);
                    }
                } catch (error) {
                    console.error("Error fetching roles", error);
                }
            };
            // Llamada a la función asincrónica
            fetchRoles();
        } catch (error) {
            console.error(error)
        } finally {
            await actions.getRoles()
        }
        handleCloseModal();
    };

    const handleDelete = async (rolId) => {
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
                const resp = await actions.deleteRol(rolId);
                if (resp.success) {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: `El Rol se eliminó exitosamente`,
                        showConfirmButton: false,
                        timer: 2500
                    });
                    const fetchRoles = async () => {
                        try {
                            const resp = await actions.getRoles();
                            if (resp.success) {
                                setRoles(store.roles);
                            }
                        } catch (error) {
                            console.error("Error fetching roles", error);
                        }
                    };
                    fetchRoles();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            await actions.getRoles();
        }
    };

    useEffect(() => {
        // Función asincrónica para obtener los roles
        const fetchRoles = async () => {
            try {
                const resp = await actions.getRoles()
                if (resp.success) {
                    setRoles(store.roles);
                }
            } catch (error) {
                console.error("Error fetching roles", error);
            }
        };

        // Llamada a la función asincrónica
        fetchRoles();
    }, [currentPage, actions.getRoles]);

    return (
        <div className="container h-screen mt-5">
            <div className="row">
                <div className="col-12 mb-3 text-start">
                    <h2 className="text-3xl md:text-6xl font-bold text-start text-dark-black dark:text-principal-white big-text">
                        Roles 👥
                    </h2>
                </div>
                <div className="container d-flex mt-5 align-items-center">
                    <p className="text-dark-black dark:text-principal-white font-semibold me-2">Crear nuevo Rol: </p>
                    <input type="text" placeholder="nuevo rol"
                        value={newRol.rol}
                        className="form-control w-25 me-2" onChange={(e) => setNewRol({ rol: e.target.value })} />
                    <button
                        className="bg-color-primary text-principal-white font-semibold hover:border-principal-white rounded-lg h-100 p-2 hover:bg-green-800"
                        onClick={handleCreate}>
                        Crear Rol
                    </button>
                </div>
                <div className="container d-flex justify-content-center">
                    <div className="mt-5 d-flex align-items-center justify-content-between w-50">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Buscar Roles"
                            aria-label="Buscar Roles"
                            value={searchTerm}
                            onChange={(e) => {
                                setCurrentPage(0);
                                setSearchTerm(e.target.value.trim());
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-12 mt-5 container w-50 ">
                    <div className="form registro p-4 rounded border shadow p-3 mb-5 dark:bg-dark-black rounded ">
                        <table className="table table-borderless bg-transparent table-hover">
                            <thead className="">
                                <tr className="bg-transparent">
                                    <th className="bg-transparent " scope="col">
                                        <p className="dark:text-principal-white font-bold text-lg">Roles</p>
                                    </th>
                                    <th className="bg-transparent " scope="col">
                                        <p className="text-transparent">edit</p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {currentRoles.map((rol) => (
                                    <tr
                                        key={rol.id}
                                        className={`bg-transparent ${hoveredRolId === rol.id ? "hover:bg-gray-200" : ""
                                            }`}
                                        onMouseEnter={() => setHoveredRolId(rol.id)}
                                        onMouseLeave={() => setHoveredRolId(null)}
                                    >
                                        <td className="bg-transparent " scope="row">
                                            <p className="dark:text-principal-white">{rol.rol} </p>
                                        </td>
                                        <td className="bg-transparent">
                                            <div className="d-flex justify-content-around">
                                                {hoveredRolId === rol.id && (
                                                    <>
                                                        <button onClick={() => handleEdit(rol)}>
                                                            <i className="fa-solid fa-pencil dark:text-principal-white dark:hover:text-color-primary hover:text-color-primary"></i>
                                                        </button>
                                                        <button onClick={() => handleDelete(rol.id)}>
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

            {/* Modal para editar rol */}
            <Modal show={showModal} onHide={handleCloseModal} className="text-center ">
                <Modal.Header className="dark:bg-dark-black" closeButton>
                    <Modal.Title className="dark:bg-dark-black">Editar Rol</Modal.Title>
                </Modal.Header>
                <Modal.Body className="dark:bg-dark-black">
                    {editRol && (
                        <form className="dark:text-principal-white">
                            <div className="mb-3 text-start">
                                <label htmlFor="rol" className="form-label text-dark-black">
                                    Rol
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="rol"
                                    value={editRol.rol}
                                    onChange={(e) => setEditRol({ ...editRol, rol: e.target.value })}
                                />
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

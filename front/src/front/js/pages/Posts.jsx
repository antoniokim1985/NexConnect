import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';

export const Posts = () => {
  const { store, actions } = useContext(Context);
  const [loadedImages, setLoadedImages] = useState(0);
  const [expandedDescription, setExpandedDescription] = useState([]);
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState({ titulo: "", descripcion: "", rol_id: "", originalPost: {} });
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Llama a la acción para obtener los posts
      const result = await actions.getPosts();

      // Si la llamada fue exitosa, actualiza el estado posts
      if (result.success) {
        setPosts(store.posts);
      }
    };

    // Llama a fetchData cuando el componente se monta
    fetchData();
    setUser(store.user)
    const fetchRoles = async () => {
      const resp = await actions.getRoles()
      if (resp.success) {
        setRoles(store.roles)
      }
    }
    fetchRoles()
  }, [store.user]);

  useEffect(() => {
    const handleImageLoad = () => {
      setLoadedImages((prevCount) => prevCount + 1);
    };
    const images = document.querySelectorAll('.card-img-top');
    images.forEach((img) => {
      img.addEventListener('load', handleImageLoad);
    });
    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  const openPDF = (pdfURL) => {
    window.open("http://localhost:3000/" + pdfURL, '_blank');
  };
  const toggleDescriptionExpand = (index) => {
    setExpandedDescription((prevIndexes) => {
      const newIndexes = [...prevIndexes];
      newIndexes[index] = !newIndexes[index];
      return newIndexes;
    });
  };
  // Función para obtener el nombre del rol según el ID del rol
  const getNombreRol = (idRol) => {
    const rol = roles.find((r) => r.id === idRol);
    return rol ? rol.rol : "Rol Desconocido";
  };

  const handleEdit = (post) => {
    setPostToDeleteId(post.id);
    // Verificar y asignar un valor predeterminado si es null

    setEditPost({
      titulo: post.titulo,
      descripcion: post.descripcion,
      rol_id: post.rol_id
    });
    setSelectedPostId(post.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      const formDataToSend = new FormData();

      for (const key in editPost) {
        // No añadir el 'id' al formulario
        if (editPost[key] instanceof File) {
          formDataToSend.append(key, editPost[key]);
        } else if (editPost[key] !== null) {
          // Si no es un archivo y no es nulo, agregar al formulario
          formDataToSend.append(key, editPost[key]);
        }
      }

      // Llama a la acción para actualizar el post
      const result = await actions.updatePost(formDataToSend, selectedPostId);
      // Verifica si la actualización fue exitosa
      if (result.success) {
        Swal.fire({
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          icon: 'success',
          title: 'Post Actualizado',
          text: 'El Post fue actualizado exitosamente',
          customClass: "swal-small"
        });
        const fetchData = async () => {
          // Llama a la acción para obtener los posts
          const result = await actions.getPosts();

          // Si la llamada fue exitosa, actualiza el estado posts
          if (result.success) {
            setPosts(store.posts);
          }
        };

        // Llama a fetchData cuando el componente se monta
        fetchData();
      } else {
        console.error("Error al actualizar el post");
      }
    } catch (error) {
      console.error("Error al procesar la actualización del post", error);
    } finally {
      handleCloseModal();
    }
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

    setEditPost((prevEditPost) => ({
      ...prevEditPost,
      [name]: selectedFile,
    }));
  };

  const handleDropdownChange = (e) => {
    const value = e.target.options[e.target.selectedIndex].value;
    setEditPost({
      ...editPost,
      rol_id: value,
    });
  };

  useEffect(() => {
  }, [editPost]);

  const handleDelete = async (post) => {
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
        const resp = await actions.deletePost(postToDeleteId)
        if (resp.success) {
          Swal.fire({
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            icon: 'success',
            title: 'Post Eliminado',
            text: 'El Post fue ELiminado exitosamente',
            customClass: "swal-small"
          });
        }
        const fetchData = async () => {
          // Llama a la acción para obtener los posts
          const result = await actions.getPosts();

          // Si la llamada fue exitosa, actualiza el estado posts
          if (result.success) {
            setPosts(store.posts);
          }
        };
        // Llama a fetchData cuando el componente se monta
        fetchData();
      }
    } catch (error) {
      console.error(error)
    } finally {
      handleCloseModal()
    }

  }

  const openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl("");
  };

  return (
    <div className="container mb-5 mt-5 d-flex flex-column align-items-center justify-content-center">
      <div className="col-12 mb-3 text-start">
        <h2 className="text-3xl md:text-6xl font-bold text-dark-black dark:text-principal-white big-text">
          Hola {store.user} 👋
        </h2>
      </div>
      {posts.map((post, index) => (
  <div key={index} className="card w-100 h-100 border-5 shadow-2xl border-[#F9FCFD] bg-[#F9FCFD] mt-5 mb-3" style={{ maxWidth: '680px' }}>
    <div className="row g-0">
      <div className="col-md-6">
        <div className="position-relative h-100">
          <img
            src={`http://localhost:3000/${post.url_imagen}`}
            className="img-fluid rounded-start card-img-top h-100 cursor-pointer"
            alt="..."
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onClick={() => openImageModal(`http://localhost:3000/${post.url_imagen}`)}
          />
        </div>
      </div>
      <div className="col-md-6">
        <div className="card-body">
          <div className="flex justify-between">
            <h5 className="card-title">{post.titulo}</h5>
            <button className="pb-5 ps-5" onClick={() => handleEdit(post)}>
              <i className="fa-solid fa-pencil"></i>
            </button>
          </div>
          <p className="card-text">
            {expandedDescription[index]
              ? post.descripcion
              : `${post.descripcion.slice(0, 150)}...`}
          </p>
          {post.descripcion.length > 250 && (
            <a
              onClick={() => toggleDescriptionExpand(index)}
              className="btn btn-link"
            >
              {expandedDescription[index] ? "Leer menos" : "Leer más"}
            </a>
          )}
          <p className="mt-5 font-light text-color-primary">
            {getNombreRol(post.rol_id).charAt(0).toUpperCase() +
              getNombreRol(post.rol_id).slice(1).toLowerCase()}
          </p>
          {post.url_archivo && (
            <button
              type="button"
              className="btn btn-outline-dark text-start border-dark-black hover:bg-dark-black hover:text-principal-white"
              onClick={() => openPDF(post.url_archivo)}
            >
              Descargar PDF <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
))}


      {/* Modal para editar usuario */}
      <Modal show={showModal} onHide={handleCloseModal} className="text-center">
        <Modal.Header className="dark:bg-dark-black" closeButton>
          <Modal.Title className="dark:bg-dark-black">Editar Post</Modal.Title>
        </Modal.Header>
        <Modal.Body className="dark:bg-dark-black">
          {/* Formulario para editar el usuario */}
          {editPost && (
            <form onSubmit={handleSaveChanges} className="">
              <div className="container dark:bg-dark-black dark:border-dark-black mt-4 ">
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
                      value={editPost.titulo}
                      onChange={(e) => setEditPost({ ...editPost, titulo: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label text-dark-black font-bold dark:text-principal-white " >
                      Descripción:
                    </label>
                    <textarea
                      type="text"
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      placeholder="Ingrese la desciocion"
                      value={editPost.descripcion}
                      onChange={(e) => setEditPost({ ...editPost, descripcion: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="imagen" className="form-label text-dark-black font-bold dark:text-principal-white ">
                      Añadir imágen:
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="imagen"
                      name="imagen"
                      placeholder="Ingrese imagen"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3 ">
                    <label htmlFor="archivo" className="form-label text-dark-black font-bold dark:text-principal-white ">
                      Añadir PDF:
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="archivo"
                      name="archivo"
                      placeholder="Ingrese el archivo PDF"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3 d-flex justify-between align-items-center">
                    <label htmlFor="rol_id" className="form-label mt-4 text-dark-black font-bold dark:text-principal-white">
                      Postear a:
                    </label>
                    <div className="dropdown">
                      <label htmlFor="rol" className="form-label text-dark-black"></label>
                      <select
                        className="form-select align-middle w-100"
                        id="rol"
                        value={editPost.rol_id}
                        onChange={handleDropdownChange}
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
                      </select>
                    </div>
                  </div>
                  <div className="mb-3 mt-5 d-flex justify-content-end">

                  </div>
                </div>
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
          <Button className="bg-red-500 text-principal-white hover:bg-red-900" onClick={handleDelete}>
            Eliminar Post
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal para mostrar la imagen */}
      <Modal show={showImageModal} onHide={closeImageModal} centered >
        <Modal.Body className="dark:bg-dark-black">
          {showImageModal && (
            <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-10000 ">
              <button className="rounded-full bg-[#00000066] cursor-pointer p-2 px-3 my-2 hover:bg-[#000000ab] transition delay-75 duration-100" onClick={closeImageModal}>
                <i className="fa-solid fa-x text-principal-white transition delay-75 duration-100"></i>
              </button>
            </div>
          )}
          <img
            src={selectedImageUrl}
            alt="Imagen ampliada"
            className="img-fluid"
          />
        </Modal.Body>

      </Modal>

    </div>
  );
};
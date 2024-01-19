import { jwtDecode } from 'jwt-decode';
const getState = ({ getStore, getActions, setStore }) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
    return {
        store: {
            user_role_id: localStorage.getItem('rol') ?? "0",
            usuarios: [],
            token: localStorage.getItem('userToken'),
            posts: [],
            user_id: null,
            user: localStorage.getItem('user') ?? "usuario",
            roles: []
        },
        actions: {
            createUser: async (jsonBody) => {
                const url = `${backendUrl}/usuarios`
                const options = {
                    method: 'POST',
                    body: JSON.stringify(jsonBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                try {
                    const resp = await fetch(url, options)
                    if (resp.ok) {
                        const data = await resp.json();
                        return data
                    } else {
                        return { message: "No se ha podido crear el usuario" }
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, message: "Error en red" };
                }
            },
            login: async (jsonBody) => {
                const url = `${backendUrl}/login`;
                const options = {
                    method: "POST",
                    body: JSON.stringify(jsonBody),
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.ok) {
                        const data = await resp.json();
                        localStorage.setItem("userToken", data.token);
                        await setStore({ token: data.token })
                        let decode = jwtDecode(data.token);
                        let rol_id = decode.rol_id
                        localStorage.setItem("rol", rol_id)
                        await setStore({ user_role_id: String(rol_id) })
                        await getActions().getUsuario();
                        return { success: true };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error de autenticación" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            logout: () => {
                localStorage.removeItem('userToken')
                localStorage.removeItem('rol')
                localStorage.removeItem('user')
                setStore({ token: null })
                setStore({ user_role_id: "0" })
                setStore({ user: "usuario" })
            },
            getUsuarios: async () => {
                const url = "http://localhost:3000/usuarios";
                const { token } = getStore();
                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + token
                    },
                };
                try {
                    // fetching data from the backend
                    const resp = await fetch(url, options);
                    const data = await resp.json();
                    const usuarios = data
                    setStore({ usuarios });
                    // don't forget to return something, that is how the async resolves
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },
            getPosts: async () => {
                const { token } = getStore();
                const url = `${backendUrl}/informacion`;
                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.ok) {
                        const data = await resp.json();
                        await setStore({ posts: data })
                        return { success: true };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, msg: "No Hay Posts Generados" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            getUsuario: async () => {
                const { token } = getStore()
                let decode = jwtDecode(token);
                let user_id = decode.id
                await setStore({ user_id: user_id })
                const url = `${backendUrl}/usuarios/${user_id}`;
                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.ok) {
                        const data = await resp.json();
                        setStore({ user: data.nombre })
                        localStorage.setItem('user', data.nombre)
                        return { success: true };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error de autenticación" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            getRoles: async () => {
                const url = `${backendUrl}/roles`;
                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.ok) {
                        const data = await resp.json();
                        setStore({ roles: data })
                        return { success: true };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            createPost: async (jsonBody) => {
                const url = `${backendUrl}/informacion`;
                const { token } = getStore();
                const options = {
                    method: "POST",
                    body: jsonBody,
                    headers: {
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 201) {
                        const data = await resp.json();
                        return { success: true, message: "Post Creado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al Crear el Post" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            updatePost: async (jsonBody, id) => {
                const url = `${backendUrl}/informacion/${id}`;
                const { token } = getStore();
                const options = {
                    method: "PUT",
                    body: jsonBody,
                    headers: {
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Post actualizado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al actualizar el Post" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            deletePost: async (id) => {
                const url = `${backendUrl}/informacion/${id}`;
                const { token } = getStore();
                const options = {
                    method: "DELETE",
                    headers: {
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Post Eliminado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al Eliminar el Post" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            createRol: async (jsonBody) => {
                const url = `${backendUrl}/roles`;
                const { token } = getStore();
                const options = {
                    method: "POST",
                    body: JSON.stringify(jsonBody),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 201) {
                        const data = await resp.json();
                        return { success: true, message: "Rol Creado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al Crear el Rol" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            editRol: async (jsonBody, idRol) => {
                const url = `${backendUrl}/roles/${idRol}`;
                const { token } = getStore();
                const options = {
                    method: "PUT",
                    body: JSON.stringify(jsonBody),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Rol editado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al editar el Rol" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            deleteRol: async (idRol) => {
                const url = `${backendUrl}/roles/${idRol}`;
                const { token } = getStore();
                const options = {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Rol eliminado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al eliminar el Rol" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            deleteUser: async (idUser) => {
                const url = `${backendUrl}/usuarios/${idUser}`;
                const { token } = getStore();
                const options = {
                    method: "DELETE",
                    headers: {
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Usuario Eliminado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al Eliminar el Usuario" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            },
            updateUser: async (jsonBody, idUser) => {
                const url = `${backendUrl}/usuarios/${idUser}`;
                const { token } = getStore();
                const options = {
                    method: "PUT",
                    body: JSON.stringify(jsonBody),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": 'Bearer ' + token
                    }
                };
                try {
                    const resp = await fetch(url, options);
                    if (resp.status === 200) {
                        const data = await resp.json();
                        return { success: true, message: "Usuario editado exitosamente" };
                    } else {
                        const errorData = await resp.json();
                        return { success: false, error: errorData.error || "Error al editar el Usuario" };
                    }
                } catch (error) {
                    console.error(error);
                    return { success: false, error: "Error de red" };
                }
            }
        },
    };
};
export default getState;
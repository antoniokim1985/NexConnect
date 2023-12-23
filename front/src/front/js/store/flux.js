const getState = ({ getStore, getActions, setStore }) => {
   
  
    return {
      store: {
        usuarios:[]
      },
  
      actions: {
        getUsuarios: async () => {
          console.log(process.env.REACT_APP_BACKEND_URL)
          const url = "http://localhost:3000/usuarios";
          
          const options = {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
              
            },
          };
  
          try {
            // fetching data from the backend
            const resp = await fetch(url, options);
            const data = await resp.json();
            const usuarios = data
            
          setStore({usuarios});

          console.log("Usuarios en store:", getStore().usuarios);

            // don't forget to return something, that is how the async resolves
            return data;
          } catch (error) {
            console.log("Error loading message from backend", error);
          }
        },
      },
    };
  };
  export default getState;
import React, { useContext, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Pages 
import { Home } from "./pages/Home";
import { Registro } from "./pages/Registro.jsx";
import { Posts } from "./pages/Posts.jsx";
import { CreatePost } from "./pages/CreatePost.jsx";
import { Admin } from "./pages/Admin.jsx";
import { Roles } from "./pages/Roles.jsx";
import { NotFound } from "./pages/NotFound.jsx";
// Componentes
import { Navbar } from "./component/Navbar";
import { Footer } from "./component/Footer.jsx";

// Contexto
import { Context } from "./store/appContext";
import injectContext from "./store/appContext";

const Layout = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    // Realizar alguna lógica si es necesario cuando el token cambia
  }, [store.token]);

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Registro />} path="/registro" />
          {!store.token ? (
            <>
              <Route element={<Navigate to="/" replace />} path="/posts" />
              <Route element={<Navigate to="/" replace />} path="/admin" />
              <Route element={<Navigate to="/" replace />} path="/posts/create" />
              <Route element={<Navigate to="/" replace />} path="/roles" />
            </>
          ) : (
            <>
              <Route element={<Posts />} path="/posts" />
              <Route element={<CreatePost />} path="/posts/create" />
              <Route element={<Admin />} path="/admin" />
              <Route element={<Roles to="/" replace />} path="/roles" />
            </>
          )}
          <Route element={<NotFound/>} path="*"/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);

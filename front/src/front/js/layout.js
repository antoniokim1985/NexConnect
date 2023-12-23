import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Context } from "./store/appContext";
import { Home } from "./pages/Home";
import { Navbar } from "./component/Navbar";
import injectContext from "./store/appContext";



//create your first component
const Layout = () => {
  const { store, actions } = useContext(Context);
  
  const basename = process.env.BASENAME || "";

  return (
    <div>
      <BrowserRouter basename={basename}>
          <Navbar></Navbar>
          <Routes>
            <Route element={<Home />} path="/" />
        
            
          </Routes>
  
          </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
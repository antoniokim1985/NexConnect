import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../store/appContext";
import nazul from "../../img/nazul.png";

export const Footer = () => {
    return (
        <div className=" bg-[#1D1D1F] text-white text-center py-8 mt-5">
            <div className="flex flex-col items-center">
                <img src={nazul} className="w-16 h-16 " alt="NexConnect Logo" />
                <h5 className=" font-light">NexConnect</h5>
            </div>
            <div className=" mt-5">
                <p className="font-thin text-xs text-[#F9FCFD]">© 2023 CEO y Colaboradores de NexConnect</p>
            </div>
        </div>
    );
};

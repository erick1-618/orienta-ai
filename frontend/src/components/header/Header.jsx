// Header react
import React from "react";
import "./Header.css";
import {useNavigate} from "react-router-dom";

const Header = () => {

    const navigate = useNavigate();

    const handleClickPesquisadores = () => {
        navigate("/professores");
    }

    const handleClickHome = () => {
        navigate("/");
    }

    const handleClickSobre = () => {
        navigate("/sobre");
    }

    const handleClickAdmin = () => {
        navigate("/admin-login");
    }

    return (
        <header>
            <img src="src/assets/logo.png" alt="Logo Orienta AI" id="logo" onClick={handleClickHome}/>
            <div className="header-right">
                <p className="underline-anim" onClick={handleClickPesquisadores}>Base de Pesquisadores</p>
                <p className="underline-anim" onClick={handleClickSobre}>Sobre</p>
                <p className="underline-anim" onClick={handleClickAdmin}>Login Admin</p>
            </div>
        </header>
    );
};

export default Header;
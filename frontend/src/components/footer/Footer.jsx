// Footer react component
import React from "react";
import "./Footer.css";
import eicIcon from "../../assets/eic.png";
import cefetIcon from "../../assets/cefet-logo.png";

const Footer = () => {
    return (
        <footer>
            <div className="footer-content-left">
                <p>Projeto de férias - 2026</p>
                <p>Erick Borba ☆</p>
            </div>
            
            <div className="footer-content-right">
                <a href="https://eic.cefet-rj.br/portal/">
                    <img src={eicIcon} alt="Logo EIC" id="logo-eic"/>
                </a>
                <a href="https://www.cefet-rj.br/">
                    <img src={cefetIcon} alt="Logo CEFET-RJ" id="logo-cefet"/>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
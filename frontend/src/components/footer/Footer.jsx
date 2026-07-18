// Footer react component
import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer>
            <div className="footer-content-left">
                <p>Projeto de férias - 2026</p>
                <p>Erick Borba ☆</p>
            </div>
            
            <div className="footer-content-right">
                <a href="https://eic.cefet-rj.br/portal/">
                    <img src="src/assets/eic.png" alt="Logo EIC" id="logo-eic"/>
                </a>
                <a href="https://www.cefet-rj.br/">
                    <img src="src/assets/cefet-logo.png" alt="Logo CEFET-RJ" id="logo-cefet"/>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
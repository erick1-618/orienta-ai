import React from 'react'
import './ProfessorCard.css'

export default function ProfessorCard({ nome, resumo, linhas_de_pesquisa, onClick }) {
    return (
        <div className="professor-card" onClick={onClick}>
            <h3 className="professor-nome">{nome}</h3>
            <p className="professor-resumo">{resumo}</p>

            {linhas_de_pesquisa && linhas_de_pesquisa.length > 0 && (
                <div className="professor-tags">
                    {linhas_de_pesquisa.slice(0, 3).map((linha, i) => (
                        <span key={i} className="professor-tag">{linha}</span>
                    ))}
                </div>
            )}
        </div>
    )
}
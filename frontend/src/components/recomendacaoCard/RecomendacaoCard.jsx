import React from 'react'
import './RecomendacaoCard.css'

export default function RecomendacaoCard({ nome, score, justificativa, onClick }) {
    return (
        <div className="recomendacao-card" onClick={onClick}>
            <div className="recomendacao-header">
                <h3 className="recomendacao-nome">{nome}</h3>
                <div className="recomendacao-score">
                    <span>{score}</span>
                    <small>%</small>
                </div>
            </div>
            <p className="recomendacao-justificativa">{justificativa}</p>
        </div>
    )
}
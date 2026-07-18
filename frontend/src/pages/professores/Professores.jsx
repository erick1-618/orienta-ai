import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfessorCard from '../../components/professorCard/ProfessorCard'
import './Professores.css'

const API_URL = 'http://localhost:8000/professores'

export default function Professores() {
    const navigate = useNavigate()
    const [professores, setProfessores] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error('Falha ao buscar professores')
                const data = await response.json()
                setProfessores(data)
            } catch (err) {
                setErro('Não foi possível carregar os professores.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfessores()
    }, [])

    const handleCardClick = (professor) => {
        navigate(`/pesquisador/${encodeURIComponent(professor.id)}`)
    }

    return (
        <div className="professores-body">
            <div className="professores-header">
                <h1>Nossos Pesquisadores</h1>
                <p>Conheça os orientadores disponíveis e suas linhas de pesquisa.</p>
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner" />
                    <p>Carregando professores...</p>
                </div>
            )}

            {erro && <p className="erro">{erro}</p>}

            {!loading && !erro && (
                <div className="professores-grid">
                    {professores.map((p) => (
                        <ProfessorCard
                            key={p.id}
                            nome={p.nome}
                            resumo={p.resumo}
                            linhas_de_pesquisa={p.linhas_de_pesquisa}
                            onClick={() => handleCardClick(p)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
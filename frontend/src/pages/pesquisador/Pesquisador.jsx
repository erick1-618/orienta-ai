import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Pesquisador.css'

const API_URL = 'http://localhost:8000/professores'

export default function Pesquisador() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [professor, setProfessor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        const fetchProfessor = async () => {
            setLoading(true)
            setErro(null)
            try {
                const response = await fetch(`${API_URL}/${id}`)
                if (!response.ok) throw new Error('Professor não encontrado')
                const data = await response.json()
                setProfessor(data)
            } catch (err) {
                setErro('Não foi possível carregar os dados deste pesquisador.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfessor()
    }, [id])

    if (loading) {
        return (
            <div className="pesquisador-body">
                <div className="loading">
                    <div className="spinner" />
                    <p>Carregando pesquisador...</p>
                </div>
            </div>
        )
    }

    if (erro || !professor) {
        return (
            <div className="pesquisador-body">
                <p className="erro">{erro || 'Pesquisador não encontrado.'}</p>
                <button className="voltar-btn" onClick={() => navigate('/professores')}>
                    Voltar para a lista
                </button>
            </div>
        )
    }

    return (
        <div className="pesquisador-body">
            <div className="pesquisador-card">
                <button className="voltar-btn" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <h1 className="pesquisador-nome">{professor.nome}</h1>

                <p className="pesquisador-resumo">{professor.resumo}</p>

                {professor.linhas_de_pesquisa?.length > 0 && (
                    <section className="pesquisador-secao">
                        <h2>Linhas de Pesquisa</h2>
                        <div className="tags">
                            {professor.linhas_de_pesquisa.map((linha, i) => (
                                <span key={i} className="tag">{linha}</span>
                            ))}
                        </div>
                    </section>
                )}

                {professor.areas_de_atuacao?.length > 0 && (
                    <section className="pesquisador-secao">
                        <h2>Áreas de Atuação</h2>
                        <div className="tags">
                            {professor.areas_de_atuacao.map((area, i) => (
                                <span key={i} className="tag tag-outline">{area}</span>
                            ))}
                        </div>
                    </section>
                )}

                {professor.projetos_pesquisa?.length > 0 && (
                    <section className="pesquisador-secao">
                        <h2>Projetos de Pesquisa</h2>
                        <ul className="lista">
                            {professor.projetos_pesquisa.map((projeto, i) => (
                                <li key={i}>{projeto}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {professor.publicacoes_recentes?.length > 0 && (
                    <section className="pesquisador-secao">
                        <h2>Publicações Recentes</h2>
                        <ul className="lista">
                            {professor.publicacoes_recentes.map((pub, i) => (
                                <li key={i}>{pub}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {professor.palavras_chave?.length > 0 && (
                    <section className="pesquisador-secao">
                        <h2>Palavras-chave</h2>
                        <div className="tags">
                            {professor.palavras_chave.map((palavra, i) => (
                                <span key={i} className="tag tag-small">{palavra}</span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
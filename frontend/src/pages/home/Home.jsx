import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RecomendacaoCard from '../../components/recomendacaoCard/RecomendacaoCard'
import './Home.css'

const apiUrl = import.meta.env.VITE_API_URL
const API_URL = `${apiUrl}/professores/comparar`

export default function Home() {
    const textareaRef = useRef(null)
    const resultsRef = useRef(null)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [resultados, setResultados] = useState(null)
    const [erro, setErro] = useState(null)

    const handleInput = () => {
        const el = textareaRef.current
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
    }

    const handleSend = async () => {
        const texto = textareaRef.current.value.trim()
        if (!texto || loading) return

        setLoading(true)
        setErro(null)
        setResultados(null)

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linha_pesquisa: texto })
            })

            if (!response.ok) throw new Error('Falha ao buscar recomendações')

            const data = await response.json()
            setResultados(data.recomendacoes)
        } catch (err) {
            setErro('Não foi possível buscar as recomendações. Tente novamente.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // rola até os resultados assim que eles chegam
    useEffect(() => {
        if (resultados && resultados.length > 0) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [resultados])

    const handleCardClick = (pesquisador) => {
        navigate(`/pesquisador/${encodeURIComponent(pesquisador.id)}`)
    }

    return (
        <div className="body">
            <div className="greeting">
                <h1>Bem-vindo ao Orienta.ai</h1>
                <p>Para ajudar a selecionar o orientador mais adequado à sua linha de pesquisa, entre com o seu tema de pesquisa de interesse:</p>
            </div>

            <div className="input">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Digite sua linha de pesquisa"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <img
                    src="src/assets/lupa.png"
                    alt="Lupa"
                    onClick={handleSend}
                    style={{ opacity: loading ? 0.4 : 0.7, pointerEvents: loading ? 'none' : 'auto' }}
                />
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner" />
                    <p>Buscando os orientadores mais adequados...</p>
                </div>
            )}

            {erro && <p className="erro">{erro}</p>}

            {resultados && resultados.length > 0 && (
                <div className="results" ref={resultsRef}>
                    {resultados.map((r, i) => (
                        <RecomendacaoCard
                            key={i}
                            nome={r.nome}
                            score={r.score}
                            justificativa={r.justificativa}
                            onClick={() => handleCardClick(r)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const apiUrl = import.meta.env.VITE_API_URL
const API_URL = `${apiUrl}/professores`

export default function Admin() {
    const navigate = useNavigate()
    const token = sessionStorage.getItem('admin_token')

    const [professores, setProfessores] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    const [novoPdf, setNovoPdf] = useState(null)
    const [enviando, setEnviando] = useState(false)

    // controla qual professor está com upload de atualização aberto
    const [atualizandoId, setAtualizandoId] = useState(null)
    const [pdfAtualizacao, setPdfAtualizacao] = useState(null)
    const [atualizandoEnvio, setAtualizandoEnvio] = useState(false)

    const authHeader = { Authorization: `Bearer ${token}` }

    const fetchProfessores = async () => {
        setLoading(true)
        try {
            const response = await fetch(API_URL)
            if (!response.ok) throw new Error('Falha ao buscar professores')
            const data = await response.json()
            setProfessores(data)
        } catch (err) {
            setErro('Erro ao carregar professores.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfessores()
    }, [])

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!novoPdf) return

        setEnviando(true)
        const formData = new FormData()
        formData.append('pdf', novoPdf)

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: authHeader, // não define Content-Type manualmente, o browser cuida do boundary
                body: formData
            })

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('admin_token')
                navigate('/admin-login')
                return
            }
            if (!response.ok) throw new Error('Falha ao cadastrar')

            setNovoPdf(null)
            e.target.reset()
            fetchProfessores()
        } catch (err) {
            alert('Erro ao cadastrar professor.')
            console.error(err)
        } finally {
            setEnviando(false)
        }
    }

    const handleAtualizar = async (professorId) => {
        if (!pdfAtualizacao) return

        setAtualizandoEnvio(true)
        const formData = new FormData()
        formData.append('pdf', pdfAtualizacao)

        try {
            const response = await fetch(`${API_URL}/${professorId}`, {
                method: 'PUT',
                headers: authHeader,
                body: formData
            })

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('admin_token')
                navigate('/admin-login')
                return
            }
            if (!response.ok) throw new Error('Falha ao atualizar')

            setAtualizandoId(null)
            setPdfAtualizacao(null)
            fetchProfessores()
        } catch (err) {
            alert('Erro ao atualizar professor.')
            console.error(err)
        } finally {
            setAtualizandoEnvio(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover este professor?')) return

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: authHeader
            })

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('admin_token')
                navigate('/admin-login')
                return
            }
            if (!response.ok) throw new Error('Falha ao remover')

            setProfessores((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            alert('Erro ao remover professor.')
            console.error(err)
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('admin_token')
        navigate('/admin-login')
    }

    return (
        <div className="admin-body">
            <div className="admin-header">
                <h1>Painel do Administrador</h1>
                <button className="logout-btn" onClick={handleLogout}>Sair</button>
            </div>

            <form className="admin-form" onSubmit={handleUpload}>
                <h2>Cadastrar novo professor</h2>
                <p className="admin-hint">
                    Envie o PDF do currículo Lattes; nome e perfil são extraídos automaticamente.
                </p>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNovoPdf(e.target.files[0])}
                    required
                />
                <button type="submit" disabled={enviando}>
                    {enviando ? 'Processando...' : 'Cadastrar'}
                </button>
            </form>

            <div className="admin-lista">
                <h2>Professores cadastrados</h2>

                {loading && <p>Carregando...</p>}
                {erro && <p className="admin-erro">{erro}</p>}

                {!loading && professores.map((p) => (
                    <div key={p.id} className="admin-item">
                        <div className="admin-item-info">
                            <span className="admin-item-nome">{p.nome}</span>

                            {atualizandoId === p.id && (
                                <div className="admin-item-update">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setPdfAtualizacao(e.target.files[0])}
                                    />
                                    <button
                                        onClick={() => handleAtualizar(p.id)}
                                        disabled={atualizandoEnvio || !pdfAtualizacao}
                                    >
                                        {atualizandoEnvio ? 'Enviando...' : 'Confirmar'}
                                    </button>
                                    <button
                                        className="cancelar-btn"
                                        onClick={() => {
                                            setAtualizandoId(null)
                                            setPdfAtualizacao(null)
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        {atualizandoId !== p.id && (
                            <div className="admin-item-acoes">
                                <button onClick={() => setAtualizandoId(p.id)}>
                                    Atualizar PDF
                                </button>
                                <button className="remover-btn" onClick={() => handleDelete(p.id)}>
                                    Remover
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
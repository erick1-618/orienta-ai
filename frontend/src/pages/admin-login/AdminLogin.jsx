import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

const apiUrl = import.meta.env.VITE_API_URL
const API_URL = `${apiUrl}/professores`

export default function AdminLogin() {
    const [token, setToken] = useState('')
    const [erro, setErro] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token.trim()) return

        setLoading(true)
        setErro(null)

        try {
            // usa DELETE num id inexistente só pra validar o token contra verificar_admin
            const response = await fetch(`${API_URL}/__token_check__`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.status === 401 || response.status === 403) {
                throw new Error('Token inválido')
            }
            // 404 (id não existe) ou 200 = token passou pela autenticação

            sessionStorage.setItem('admin_token', token)
            navigate('/admin')
        } catch (err) {
            setErro('Token inválido ou erro de conexão.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-login-body">
            <form className="admin-login-card" onSubmit={handleSubmit}>
                <h1>Área do Administrador</h1>
                <p>Digite o token de acesso para continuar.</p>

                <input
                    type="password"
                    placeholder="Token secreto"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                />

                {erro && <p className="admin-erro">{erro}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Verificando...' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}
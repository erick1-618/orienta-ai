import React from 'react'
import { Navigate } from 'react-router-dom'

export default function RequireAdmin({ children }) {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
        return <Navigate to="/admin-login" replace />
    }
    return children
}
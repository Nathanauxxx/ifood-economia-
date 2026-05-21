import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Endpoint criado no backend
      const response = await api.post('/auth/login', { email, senha });
      
      const { token, usuario } = response.data;
      
      // Salva dados no local storage
      localStorage.setItem('@ifood-economia:token', token);
      localStorage.setItem('@ifood-economia:user', JSON.stringify(usuario));

      // Navega para o Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in-up">
      <div className="glass-panel login-card">
        
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--ifood-red)' }}>
            <Activity size={48} strokeWidth={2.5} />
          </div>
          <h1 className="login-title">iFood Economia</h1>
          <p className="login-subtitle">O seu ecossistema financeiro premium.</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">
              <Mail size={16} className="input-icon" /> E-mail
            </label>
            <input 
              id="email" 
              type="email" 
              className="input-base" 
              placeholder="exemplo@ifood.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">
              <Lock size={16} className="input-icon" /> Senha
            </label>
            <input 
              id="senha" 
              type="password" 
              className="input-base" 
              placeholder="Sua senha secreta"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Acessando...' : 'Entrar na Plataforma'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          Não possui uma conta? <Link to="/register">Crie uma agora</Link>
        </div>

      </div>
    </div>
  );
}

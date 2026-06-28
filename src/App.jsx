import React, { useState } from 'react';
import Cartera from './Cartera';
import Creditos from './Creditos';
import Cotizador from './Cotizador';
import { Users, CreditCard, LogOut, FileText } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('cartera');

  const handleLogin = (e) => {
    e.preventDefault();
    const userLower = username.toLowerCase();
    
    if (userLower === 'epysur' && password === 'rodoepysur') {
      setIsLoggedIn(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifycontent: 'center', 
        backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' 
      }}>
        <form onSubmit={handleLogin} style={{ 
          backgroundColor: 'white', padding: '2.5rem', borderRadius: '15px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px' 
        }}>
          <h2 style={{ textAlign: 'center', color: '#1e40af', marginBottom: '1.5rem' }}>EPYSUR ERP</h2>
          
          <label style={lS}>USUARIO</label>
          <input 
            type="text" 
            style={iS} 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Ingrese usuario"
            required 
          />
          
          <label style={lS}>CONTRASEÑA</label>
          <input 
            type="password" 
            style={iS} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <button type="submit" style={{ 
            width: '100%', padding: '12px', backgroundColor: '#1e40af', color: 'white', 
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' 
          }}>
            INGRESAR
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <nav style={{ 
        backgroundColor: '#1e40af', color: 'white', padding: '1rem 2rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50
      }} className="no-print">
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>EPYSUR ERP</h1>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={() => setView('cartera')} style={{ ...navBtn, fontWeight: view === 'cartera' ? 'bold' : '500', color: view === 'cartera' ? '#fef08a' : 'white' }}>
            <Users size={18} /> Cartera
          </button>
          <button onClick={() => setView('creditos')} style={{ ...navBtn, fontWeight: view === 'creditos' ? 'bold' : '500', color: view === 'creditos' ? '#fef08a' : 'white' }}>
            <CreditCard size={18} /> Créditos
          </button>
          <button onClick={() => setView('cotizador')} style={{ ...navBtn, fontWeight: view === 'cotizador' ? 'bold' : '500', color: view === 'cotizador' ? '#fef08a' : 'white' }}>
            <FileText size={18} /> Cotizador
          </button>
          <button onClick={() => setIsLoggedIn(false)} style={{ ...navBtn, color: '#fca5a5' }}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </nav>

      {/* Regresamos el padding exacto de 2rem que requería Cartera para verse e imprimirse bien */}
      <main style={{ padding: '2rem' }}>
        {view === 'cartera' && <Cartera />}
        {view === 'creditos' && <Creditos />}
        {view === 'cotizador' && <Cotizador />}
      </main>
    </div>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' };
const lS = { fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' };
const navBtn = { 
  background: 'none', border: 'none', color: 'white', cursor: 'pointer', 
  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '500',
  transition: 'color 0.2s'
};

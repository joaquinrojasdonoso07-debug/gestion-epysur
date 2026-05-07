import React, { useState } from 'react';
import Cartera from './Cartera';
import Creditos from './Creditos';
import { Users, CreditCard, LogOut } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('cartera');

  const handleLogin = (e) => {
    e.preventDefault();
    // Convertimos a minúsculas para que acepte epysur, Epysur, EPYSUR, etc.
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
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
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
          <button onClick={() => setView('cartera')} style={navBtn}>
            <Users size={18} /> Cartera
          </button>
          <button onClick={() => setView('creditos')} style={navBtn}>
            <CreditCard size={18} /> Créditos
          </button>
          <button onClick={() => setIsLoggedIn(false)} style={{ ...navBtn, color: '#fca5a5' }}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        {view === 'cartera' ? <Cartera /> : <Creditos />}
      </main>
    </div>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' };
const lS = { fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' };
const navBtn = { 
  background: 'none', border: 'none', color: 'white', cursor: 'pointer', 
  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '500' 
};

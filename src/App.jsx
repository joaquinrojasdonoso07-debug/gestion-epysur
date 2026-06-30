import React, { useState } from 'react';
import Cartera from './Cartera';
import Creditos from './Creditos';
import Cotizador from './Cotizador';
import Inventario from './Inventario';
import Agenda from './Agenda'; 
import RutasTerreno from './RutasTerreno'; 
import PreCartera from './PreCartera'; // Nueva Importación

export default function App() {
  const [view, setView] = useState('inicio'); 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if ((username.toLowerCase() === 'epysur') && password === 'rodoepysur') {
      setIsLoggedIn(true);
    } else {
      alert('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#1e40af', marginBottom: '20px' }}>EPYSUR ERP</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>USUARIO</label>
              <input type="text" placeholder="epysur" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }} value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>CONTRASEÑA</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>INGRESAR</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <style>{`
        .navbar-epysur {
          background-color: #1e40af; color: white; padding: 1rem 2rem;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 50;
        }
        .buttons-container-epysur { display: flex; gap: 1.5rem; }
        .nav-btn-epysur { background: none; border: none; color: white; font-weight: 600; cursor: pointer; font-size: 10.5pt; padding: 6px 12px; border-radius: 6px; }
        .nav-btn-epysur:hover { background: rgba(255,255,255,0.1); }
        
        @media (max-width: 640px) {
          .navbar-epysur { flex-direction: column; gap: 10px; padding: 1rem; text-align: center; }
          .buttons-container-epysur { width: 100%; justify-content: space-around; flex-wrap: wrap; gap: 5px; }
          .nav-btn-epysur { font-size: 0.85rem; padding: 6px 4px; }
        }
      `}</style>

      <nav className="navbar-epysur no-print">
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>EPYSUR ERP</h1>
        <div className="buttons-container-epysur">
          <button onClick={() => setView('inicio')} className="nav-btn-epysur" style={{ color: view === 'inicio' ? '#fef08a' : 'white' }}>Inicio</button>
          <button onClick={() => setView('cartera')} className="nav-btn-epysur" style={{ color: view === 'cartera' ? '#fef08a' : 'white' }}>Cartera</button>
          <button onClick={() => setView('precartera')} className="nav-btn-epysur" style={{ color: view === 'precartera' ? '#fef08a' : 'white' }}>Pre-Cartera</button>
          <button onClick={() => setView('creditos')} className="nav-btn-epysur" style={{ color: view === 'creditos' ? '#fef08a' : 'white' }}>Créditos</button>
          <button onClick={() => setView('cotizador')} className="nav-btn-epysur" style={{ color: view === 'cotizador' ? '#fef08a' : 'white' }}>Cotizador</button>
          <button onClick={() => setView('inventario')} className="nav-btn-epysur" style={{ color: view === 'inventario' ? '#fef08a' : 'white' }}>Inventario</button>
          <button onClick={() => setIsLoggedIn(false)} className="nav-btn-epysur" style={{ color: '#ef4444' }}>Salir</button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        {view === 'inicio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <RutasTerreno />
            <Agenda />
          </div>
        )}

        {view === 'cartera' && <Cartera />}
        {view === 'precartera' && <PreCartera />}
        {view === 'creditos' && <Creditos />}
        {view === 'cotizador' && <Cotizador />}
        {view === 'inventario' && <Inventario />}
      </main>
    </div>
  );
}

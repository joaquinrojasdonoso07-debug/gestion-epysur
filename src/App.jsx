import React, { useState } from 'react';
import Cartera from './Cartera';
import Creditos from './Creditos';
import Cotizador from './Cotizador';
import Agenda from './Agenda';
import { Users, CreditCard, LogOut, FileText, Home, Calendar } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('inicio'); // Cambiado a 'inicio' por defecto

  const handleLogin = (e) => {
    e.preventDefault();
    const userLower = username.toLowerCase();
    
    if (userLower === 'epysur' && password === 'rodoepysur') {
      setIsLoggedIn(true);
      setView('inicio'); // Te manda directo al Dashboard
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
            placeholder="Ingrese contraseña"
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
      <style>{`
        .navbar-epysur {
          background-color: #1e40af;
          color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .buttons-container-epysur {
          display: flex;
          gap: 1.5rem;
        }
        .grid-accesos-rapidos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .card-acceso {
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card-acceso:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        @media (max-width: 640px) {
          .navbar-epysur {
            flex-direction: column !important;
            gap: 10px !important;
            padding: 1rem !important;
            text-align: center;
          }
          .buttons-container-epysur {
            width: 100% !important;
            justify-content: space-around !important;
            gap: 5px !important;
            flex-wrap: wrap !important;
          }
          .nav-btn-epysur {
            font-size: 0.85rem !important;
            padding: 6px 4px !important;
          }
        }
      `}</style>

      <nav className="navbar-epysur no-print">
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>EPYSUR ERP</h1>
        <div className="buttons-container-epysur">
          <button onClick={() => setView('inicio')} className="nav-btn-epysur" style={{ ...navBtn, fontWeight: view === 'inicio' ? 'bold' : '500', color: view === 'inicio' ? '#fef08a' : 'white' }}>
            <Home size={18} /> Inicio
          </button>
          <button onClick={() => setView('cartera')} className="nav-btn-epysur" style={{ ...navBtn, fontWeight: view === 'cartera' ? 'bold' : '500', color: view === 'cartera' ? '#fef08a' : 'white' }}>
            <Users size={18} /> Cartera
          </button>
          <button onClick={() => setView('creditos')} className="nav-btn-epysur" style={{ ...navBtn, fontWeight: view === 'creditos' ? 'bold' : '500', color: view === 'creditos' ? '#fef08a' : 'white' }}>
            <CreditCard size={18} /> Créditos
          </button>
          <button onClick={() => setView('cotizador')} className="nav-btn-epysur" style={{ ...navBtn, fontWeight: view === 'cotizador' ? 'bold' : '500', color: view === 'cotizador' ? '#fef08a' : 'white' }}>
            <FileText size={18} /> Cotizador
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="nav-btn-epysur" style={{ ...navBtn, color: '#fca5a5' }}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        {view === 'inicio' && (
          <div>
            {/* PANEL DE ACCESOS RÁPIDOS SUPERIOR */}
            <div className="grid-accesos-rapidos">
              <div className="card-acceso" onClick={() => setView('cartera')}>
                <div style={{ padding: '12px', background: '#eff6ff', color: '#1e40af', borderRadius: '8px' }}><Users size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '11pt', color: '#1e293b' }}>Cartera de Clientes</h4>
                  <span style={{ fontSize: '8.5pt', color: '#64748b' }}>Fichas y ubicaciones</span>
                </div>
              </div>
              <div className="card-acceso" onClick={() => setView('creditos')}>
                <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px' }}><CreditCard size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '11pt', color: '#1e293b' }}>Control Financiero</h4>
                  <span style={{ fontSize: '8.5pt', color: '#64748b' }}>Créditos y abonos</span>
                </div>
              </div>
              <div className="card-acceso" onClick={() => setView('cotizador')}>
                <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px' }}><FileText size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '11pt', color: '#1e293b' }}>Cotizador</h4>
                  <span style={{ fontSize: '8.5pt', color: '#64748b' }}>Generar presupuestos</span>
                </div>
              </div>
            </div>

            {/* INTEGRACIÓN DE LA AGENDA COMO CUERPO CENTRAL */}
            <Agenda />
          </div>
        )}

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

import React, { useState } from 'react';
import Cartera from './Cartera'; // Importamos el componente de clientes
import Creditos from './Creditos'; // Importamos el componente de deudas
import { Users, CreditCard, LogOut } from 'lucide-react';

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [view, setView] = useState('cartera');

  if (!isAuth) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0f172a', fontFamily:'sans-serif'}}>
        <div style={{backgroundColor:'white', padding:'2rem', borderRadius:'0.8rem', width:'300px'}}>
          <h2 style={{textAlign:'center', color:'#1e40af'}}>EpySur ERP</h2>
          <input type="text" placeholder="Usuario" style={iS} onChange={e => setUser(e.target.value)} />
          <input type="password" placeholder="Clave" style={iS} onChange={e => setPass(e.target.value)} />
          <button onClick={() => user === 'epysur' && pass === 'rodoepysur' ? setIsAuth(true) : alert('Error')} style={btnP}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#f8fafc', fontFamily:'sans-serif'}}>
      <nav style={{backgroundColor:'#1e40af', color:'white', padding:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:'2rem'}}>
          <button onClick={() => setView('cartera')} style={view === 'cartera' ? btnAct : btnNav}> <Users size={18}/> Cartera</button>
          <button onClick={() => setView('creditos')} style={view === 'creditos' ? btnAct : btnNav}> <CreditCard size={18}/> Créditos</button>
        </div>
        <button onClick={() => setIsAuth(false)} style={{backgroundColor:'red', color:'white', border:'none', padding:'8px 15px', borderRadius:'6px', cursor:'pointer'}}> <LogOut size={16}/> Salir</button>
      </nav>

      <main style={{padding:'1.5rem'}}>
        {view === 'cartera' ? <Cartera /> : <Creditos />}
      </main>
    </div>
  );
}

const iS = { width:'100%', padding:'12px', marginBottom:'10px', border:'1px solid #ccc', borderRadius:'8px' };
const btnP = { width:'100%', padding:'12px', backgroundColor:'#1e40af', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
const btnNav = { background:'none', border:'none', color:'white', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', opacity:0.7 };
const btnAct = { ...btnNav, opacity:1, borderBottom:'2px solid white' };

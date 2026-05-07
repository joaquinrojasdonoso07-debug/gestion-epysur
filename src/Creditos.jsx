import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Printer, Search, Edit3 } from 'lucide-react';

export default function Creditos() {
  const [creditos, setCreditos] = useState([]);
  const [search, setSearch] = useState('');
  const fetchData = async () => {
    const { data } = await supabase.from('creditos').select('*, clientes(nombre_fantasia)').order('id', { ascending: false });
    setCreditos(data || []);
  };
  useEffect(() => { fetchData(); }, []);

  const filtrados = creditos.filter(c => String(c.clientes?.nombre_fantasia).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          table { width: 100% !important; font-size: 8pt !important; border-collapse: collapse !important; table-layout: fixed !important; }
          th, td { border: 1px solid #ccc !important; padding: 4px !important; word-wrap: break-word !important; }
          @page { size: landscape; margin: 1cm; }
        }
      `}</style>

      <div className="no-print" style={{marginBottom:'20px'}}>
        <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
          <button style={{...btn, backgroundColor:'#991b1b', flex:1}}>NUEVA DEUDA</button>
          <button onClick={()=>window.print()} style={{...btn, backgroundColor:'#64748b', width:'60px'}}><Printer size={18}/></button>
        </div>
        <input type="text" placeholder="Buscar..." style={iS} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', minWidth:'1000px'}}>
          <thead>
            <tr style={{backgroundColor:'#fee2e2', color:'#991b1b'}}>
              <th>FECHA</th>
              <th style={{width:'200px'}}>CLIENTE</th>
              <th style={{width:'300px'}}>DETALLE PRODUCTOS</th>
              <th>TOTAL</th>
              <th>SALDO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(cr => (
              <tr key={cr.id} style={{borderBottom:'1px solid #eee'}}>
                <td>{cr.fecha_deuda}</td>
                <td><b>{cr.clientes?.nombre_fantasia}</b></td>
                <td style={{whiteSpace:'normal'}}>{cr.productos_detalle}</td>
                <td>${Number(cr.valor_total).toLocaleString('es-CL')}</td>
                <td>${(cr.valor_total - cr.abono).toLocaleString('es-CL')}</td>
                <td style={{fontWeight:'bold', color: cr.pagada ? 'green' : 'red'}}>{cr.pagada ? 'PAGADA' : 'PENDIENTE'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const iS = { width:'100%', padding:'12px', border:'1px solid #ccc', borderRadius:'8px' };
const btn = { padding:'12px', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };

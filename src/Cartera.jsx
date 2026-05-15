import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle } from 'lucide-react';

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempProducts, setTempProducts] = useState([{ nombre: '', precio: '' }]);

  const initialForm = {
    nombre_fantasia: '', nombre_cliente: '', rut: '', telefono: '', correo: '', 
    direccion: '', comuna: '', region: '', responsable: '', ultimo_contacto: '', 
    proximo_contacto: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: true });
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({ ...initialForm, ...c });
    if (c.productos_ofrecidos) {
      const prods = c.productos_ofrecidos.split(' | ').map(p => {
        const parts = p.split(' ($');
        return { nombre: parts[0] || '', precio: parts[1] ? parts[1].replace(')', '').replace(/\./g, '') : '' };
      });
      setTempProducts(prods);
    } else setTempProducts([{ nombre: '', precio: '' }]);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const pStr = tempProducts.filter(p => p.nombre.trim() !== '').map(p => `${p.nombre} ($${Number(p.precio || 0).toLocaleString('es-CL')})`).join(' | ');
    const cleanData = { ...formData, productos_ofrecidos: pStr || null };
    if (editingId) await supabase.from('clientes').update(cleanData).eq('id', editingId);
    else await supabase.from('clientes').insert([cleanData]);
    setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; border: 1px solid black; }
        .app-table th, .app-table td { border: 1px solid black; padding: 10px; vertical-align: top; }
        .app-table th { background: #1e40af; color: white; text-align: left; }
        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; }
          td { height: 2.85cm !important; border: 2pt solid black !important; font-size: 11pt !important; white-space: normal !important; }
          th { border: 2pt solid black !important; background: #e5e5e5 !important; color: black !important; text-transform: uppercase; text-align: center !important; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{nombre:'', precio:''}]); setShowForm(true);}} style={btnG}>NUEVO CLIENTE</button>
        <button onClick={() => window.print()} style={btnS}>IMPRIMIR</button>
        <input type="text" placeholder="Buscar..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#1e40af'}}>FICHA CLIENTE</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <label style={lS}>Fantasía</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required />
              <label style={lS}>Razón Social</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required />
              <label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} />
              <label style={lS}>Cliente</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} />
              <label style={lS}>Teléfono</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
              <label style={lS}>Correo</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />
              <label style={lS}>Dirección</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
              <label style={lS}>Comuna</label><input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} />
              <label style={lS}>Región</label><input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} />
              <label style={lS}>Último Contacto</label><input type="date" style={iS} value={formData.ultimo_contacto} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} />
              <label style={lS}>Próximo Contacto</label><input type="date" style={iS} value={formData.proximo_contacto} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} />
              <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}>
                <label style={lS}>Productos</label>
                {tempProducts.map((p, idx) => (
                  <div key={idx} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                    <input type="text" placeholder="Nombre" style={iS} value={p.nombre} onChange={e=>{let n=[...tempProducts]; n[idx].nombre=e.target.value; setTempProducts(n);}} />
                    <input type="number" placeholder="$" style={{...iS, width:'100px'}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                    <button type="button" onClick={()=>setTempProducts(tempProducts.filter((_,i)=>i!==idx))}><XCircle color="red"/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempProducts([...tempProducts, {nombre:'', precio:''}])}>+ Agregar</button>
              </div>
              <label style={lS}>Observaciones</label><textarea style={{...iS, height:'50px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
              <button type="submit" style={btnP}>GUARDAR</button>
              <button type="button" onClick={()=>setShowForm(false)} style={btnS}>CERRAR</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-area">
        <table className="app-table">
          <thead>
            <tr>
              <th className="no-print" style={{width:'80px'}}>ACC</th>
              <th style={{width:'180px'}}>FANTASÍA</th>
              <th style={{width:'150px'}}>CLIENTE</th>
              <th className="only-print">UBICACIÓN / CONTACTO</th>
              <th style={{width:'300px'}}>PRODUCTOS</th>
              <th style={{width:'100px'}}>ÚLT. CONT</th>
              <th style={{width:'100px'}}>PRÓX. CONT</th>
              <th style={{width:'200px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td className="no-print">
                   <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={()=>handleEdit(c)} style={smEdit}><Edit3 size={14}/></button>
                      <button onClick={async ()=>{if(window.confirm('¿Eliminar?')){await supabase.from('clientes').delete().eq('id',c.id); fetchData();}}} style={smDel}><Trash2 size={14}/></button>
                   </div>
                </td>
                <td style={{fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                <td>{c.responsable}</td>
                <td className="only-print">{c.direccion}, {c.comuna}<br/>{c.telefono}</td>
                <td>{c.productos_ofrecidos?.split(' | ').map((p,i)=><div key={i} style={{borderBottom:'1px solid black', padding:'2px'}}>{p}</div>)}</td>
                <td>{formatFechaChile(c.ultimo_contacto)}</td>
                <td style={{fontWeight:'bold'}}>{formatFechaChile(c.proximo_contacto)}</td>
                <td>{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'8px' };
const btnG = { padding:'12px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold' };
const btnP = { padding:'15px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1 };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const lS = { fontSize:'0.7rem', fontWeight:'bold', color:'#475569', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

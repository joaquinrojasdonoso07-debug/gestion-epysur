import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle } from 'lucide-react';

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  
  // NUEVOS FILTROS SEPARADOS PARA EVITAR MEZCLAS
  const [searchComuna, setSearchComuna] = useState('');
  const [searchRegion, setSearchRegion] = useState('');

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
    const { data: res } = await supabase.from('clientes').select('*').order('id', { ascending: true });
    setData(res || []);
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

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres eliminar a "${nombre}"? Esto no se puede deshacer.`)) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      else fetchData();
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const pStr = tempProducts.filter(p => p.nombre.trim() !== '').map(p => `${p.nombre} ($${Number(p.precio || 0).toLocaleString('es-CL')})`).join(' | ');
    const cleanData = { 
      ...formData, 
      productos_ofrecidos: pStr || null,
      ultimo_contacto: formData.ultimo_contacto || null,
      proximo_contacto: formData.proximo_contacto || null
    };
    if (editingId) await supabase.from('clientes').update(cleanData).eq('id', editingId);
    else await supabase.from('clientes').insert([cleanData]);
    setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
  };

  // LOGICA DE FILTRADO ESTRICTO QUE SEPARA BUSQUEDA GENERAL, COMUNA Y REGION
  const filtrados = data.filter(c => {
    const cumpleGeneral = Object.values(c).some(v => String(v || '').toLowerCase().includes(search.toLowerCase()));
    const cumpleComuna = (c.comuna || '').toLowerCase().includes(searchComuna.toLowerCase());
    const cumpleRegion = (c.region || '').toLowerCase().includes(searchRegion.toLowerCase());
    return cumpleGeneral && cumpleComuna && cumpleRegion;
  });

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; border: 1px solid black; }
        .app-table th, .app-table td { border: 1.5pt solid black; padding: 10px; vertical-align: top; }
        .app-table th { background: #1e40af; color: white; text-align: left; }
        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; }
          th { border: 2pt solid black !important; background: #e5e5e5 !important; color: black !important; font-size: 10pt !important; text-align: center !important; }
          td { height: 2.85cm !important; border: 1.5pt solid black !important; font-size: 11pt !important; white-space: normal !important; word-wrap: break-word !important; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{nombre:'', precio:''}]); setShowForm(true);}} style={btnG}>NUEVO CLIENTE</button>
          <button onClick={() => window.print()} style={btnS}>IMPRIMIR</button>
        </div>
        
        {/* BLOQUE DE BUSCADORES ORGANIZADOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <input type="text" placeholder="Buscar por Nombre, RUT o Datos generales..." style={iS} value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Filtrar estrictamente por COMUNA... (Ej: Los Lagos)" style={iS} value={searchComuna} onChange={e => setSearchComuna(e.target.value)} />
            <input type="text" placeholder="Filtrar estrictamente por REGIÓN... (Ej: Los Lagos)" style={iS} value={searchRegion} onChange={e => setSearchRegion(e.target.value)} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#1e40af', marginBottom:'15px'}}>FICHA CLIENTE</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div><label style={lS}>Fantasía</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required /></div>
              <div><label style={lS}>Razón Social</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required /></div>
              <div><label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} /></div>
              <div><label style={lS}>Cliente</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} /></div>
              <div><label style={lS}>Teléfono</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} /></div>
              <div><label style={lS}>Correo</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} /></div>
              <div><label style={lS}>Dirección</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} /></div>
              <div><label style={lS}>Comuna</label><input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} /></div>
              <div><label style={lS}>Región</label><input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} /></div>
              <div><label style={lS}>Último Contacto</label><input type="date" style={iS} value={formData.ultimo_contacto} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} /></div>
              <div><label style={lS}>Próximo Contacto</label><input type="date" style={iS} value={formData.proximo_contacto} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} /></div>
              
              <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}>
                <label style={lS}>Productos</label>
                {tempProducts.map((p, idx) => (
                  <div key={idx} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                    <input type="text" placeholder="Nombre" style={iS} value={p.nombre} onChange={e=>{let n=[...tempProducts]; n[idx].nombre=e.target.value; setTempProducts(n);}} />
                    <input type="number" placeholder="$" style={{...iS, width:'100px'}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                    <button type="button" onClick={()=>setTempProducts(tempProducts.filter((_,i)=>i!==idx))} style={{background:'none', border:'none'}}><XCircle color="red" size={20}/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempProducts([...tempProducts, {nombre:'', precio:''}])} style={{fontSize:'0.8rem', color:'#1e40af', background:'none', border:'none', cursor:'pointer'}}>+ Agregar Producto</button>
              </div>
              <div><label style={lS}>Observaciones</label><textarea style={{...iS, height:'60px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} /></div>
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
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
              <th style={{width:'250px'}}>DIRECCIÓN</th>
              <th style={{width:'120px'}}>TELÉFONO</th>
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
                      <button onClick={()=>handleDelete(c.id, c.nombre_fantasia)} style={smDel}><Trash2 size={14}/></button>
                   </div>
                </td>
                <td style={{fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                <td>{c.responsable}</td>
                <td>{c.direccion}, {c.comuna}</td>
                <td>{c.telefono}</td>
                <td style={{padding:0}}>{c.productos_ofrecidos?.split(' | ').map((p,i)=><div key={i} style={{borderBottom:'1px solid black', padding:'4px'}}>{p}</div>)}</td>
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

const iS = { width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'8px' };
const btnG = { padding:'12px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' };
const btnP = { padding:'15px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1, cursor:'pointer' };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

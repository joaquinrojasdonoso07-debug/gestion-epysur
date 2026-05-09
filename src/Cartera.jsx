import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Printer, Search, Edit3, Trash2 } from 'lucide-react';

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempProducts, setTempProducts] = useState([{ nombre: '', precio: 0 }]);

  const initialForm = {
    id_cliente: '', nombre_fantasia: '', nombre_cliente: '', rut: '', 
    telefono: '', correo: '', direccion: '', comuna: '', region: '', 
    whatsapp: false, responsable: '', productos_ofrecidos: '', 
    ultimo_contacto: '', proximo_contacto: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchC = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    setData(data || []);
  };

  useEffect(() => { fetchC(); }, []);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    if (cliente.productos_ofrecidos) {
      const prods = cliente.productos_ofrecidos.split(' | ').map(p => {
        const [n, v] = p.split(' ($');
        return { nombre: n.replace('• ', ''), precio: v ? parseInt(v.replace(')', '').replace(/\./g, '')) : 0 };
      });
      setTempProducts(prods);
    } else { setTempProducts([{ nombre: '', precio: 0 }]); }
    setShowForm(true);
  };

  const deleteCliente = async (id, nombre) => {
    if (window.confirm(`¿Eliminar al cliente "${nombre}"?`)) {
      await supabase.from('clientes').delete().eq('id', id);
      fetchC();
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const productString = tempProducts
      .filter(p => p.nombre && p.nombre.trim() !== '')
      .map(p => `${p.nombre} ($${Number(p.precio).toLocaleString('es-CL')})`)
      .join(' | ');

    const cleanData = { ...formData, productos_ofrecidos: productString || null };
    Object.keys(cleanData).forEach(key => { if (cleanData[key] === '') cleanData[key] = null; });

    try {
      if (editingId) await supabase.from('clientes').update(cleanData).eq('id', editingId);
      else await supabase.from('clientes').insert([cleanData]);
      setShowForm(false); setEditingId(null); setFormData(initialForm); fetchC();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .only-print { display: none !important; }
        .table-container { width: 100%; overflow-x: auto; background: white; border-radius: 12px; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; }
        .app-table th { background: #1e40af; color: white; padding: 12px; text-align: left; white-space: nowrap; }
        .app-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }

        @media print {
          @page { size: letter landscape; margin: 10mm; }
          .no-print { display: none !important; }
          .only-print { display: table-cell !important; }
          .hide-on-print { display: none !important; }
          body { background: white !important; font-family: sans-serif; }
          .table-container { overflow: visible !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; }
          th, td { border: 1px solid black !important; padding: 5px !important; font-size: 8pt !important; word-wrap: break-word !important; white-space: normal !important; }
          th { background: #eee !important; color: black !important; }
        }
      `}</style>

      {/* CABECERA */}
      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{nombre:'', precio:0}]); setShowForm(true);}} style={btnG}> NUEVO CLIENTE </button>
          <button onClick={() => window.print()} style={btnS}> <Printer size={20}/> </button>
        </div>
        <input type="text" placeholder="Buscar cliente..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* FORMULARIO COMPLETO (UNA COLUMNA) */}
      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#1e40af', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>FICHA TÉCNICA COMPLETA</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={lS}>ID Personalizado</label><input type="text" style={iS} value={formData.id_cliente} onChange={e=>setFormData({...formData, id_cliente: e.target.value})} />
              <label style={lS}>Nombre Fantasía *</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required />
              <label style={lS}>Razón Social *</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required />
              <label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} />
              <label style={lS}>Cliente (Responsable)</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} />
              <label style={lS}>Dirección</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
              <label style={lS}>Comuna</label><input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} />
              <label style={lS}>Región</label><input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} />
              <label style={lS}>Teléfono</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
              <label style={lS}>Correo</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />
              
              <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'10px', borderRadius:'8px'}}>
                <input type="checkbox" checked={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.checked})} />
                <label style={lS}>¿Tiene WhatsApp?</label>
              </div>

              <label style={lS}>Fecha Último Contacto</label><input type="date" style={iS} value={formData.ultimo_contacto || ''} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} />
              <label style={lS}>Fecha Próximo Contacto</label><input type="date" style={iS} value={formData.proximo_contacto || ''} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} />

              <div style={{background:'#f1f5f9', padding:'10px', borderRadius:'8px'}}>
                <label style={lS}>Gestión de Productos</label>
                {tempProducts.map((p, idx) => (
                  <div key={idx} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                    <input type="text" placeholder="Producto" style={iS} value={p.nombre} onChange={e=>{let n=[...tempProducts]; n[idx].nombre=e.target.value; setTempProducts(n);}} />
                    <input type="number" placeholder="$" style={{...iS, width:'100px'}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                    <button type="button" onClick={()=>setTempProducts(tempProducts.filter((_,i)=>i!==idx))} style={{color:'red', border:'none', background:'none'}}>×</button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempProducts([...tempProducts, {nombre:'', precio:0}])} style={{fontSize:'0.75rem', color:'#1e40af', border:'none', background:'none', cursor:'pointer'}}>+ Añadir producto</button>
              </div>

              <label style={lS}>Observaciones</label><textarea style={{...iS, height:'60px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button type="submit" style={btnP}>GUARDAR CAMBIOS</button>
              <button type="button" onClick={()=>setShowForm(false)} style={btnS}>CERRAR</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA APP (TODAS LAS COLUMNAS) */}
      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th className="no-print">ACC.</th>
              <th>ID PERS.</th>
              <th>FANTASÍA</th>
              <th>RAZÓN SOCIAL</th>
              <th className="hide-on-print">RUT</th>
              <th>CLIENTE</th>
              <th className="only-print">UBICACIÓN</th>
              <th className="hide-on-print">DIRECCIÓN</th>
              <th className="hide-on-print">COMUNA</th>
              <th className="hide-on-print">REGIÓN</th>
              <th className="only-print">CONTACTO</th>
              <th className="hide-on-print">TELÉFONO</th>
              <th className="hide-on-print">CORREO</th>
              <th className="hide-on-print">WSP</th>
              <th>PRODUCTOS</th>
              <th>ÚLT. CONT.</th>
              <th>PRÓX. CONT.</th>
              <th>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td className="no-print">
                  <div style={{display:'flex', gap:'5px'}}>
                    <button onClick={()=>handleEdit(c)} style={smEdit}><Edit3 size={14}/></button>
                    <button onClick={()=>deleteCliente(c.id, c.nombre_fantasia)} style={smDel}><Trash2 size={14}/></button>
                  </div>
                </td>
                <td>{c.id_cliente}</td>
                <td style={{fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                <td>{c.nombre_cliente}</td>
                <td className="hide-on-print">{c.rut}</td>
                <td>{c.responsable}</td>
                <td className="only-print">{c.direccion}, {c.comuna}, {c.region}</td>
                <td className="hide-on-print">{c.direccion}</td>
                <td className="hide-on-print">{c.comuna}</td>
                <td className="hide-on-print">{c.region}</td>
                <td className="only-print">{c.telefono} / {c.correo}</td>
                <td className="hide-on-print">{c.telefono}</td>
                <td className="hide-on-print">{c.correo}</td>
                <td className="hide-on-print">{c.whatsapp ? 'SÍ' : 'NO'}</td>
                <td style={{whiteSpace:'normal'}}>{c.productos_ofrecidos}</td>
                <td>{formatFechaChile(c.ultimo_contacto)}</td>
                <td style={{fontWeight:'bold', color:'#e11d48'}}>{formatFechaChile(c.proximo_contacto)}</td>
                <td style={{whiteSpace:'normal'}}>{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'8px', border:'1px solid #cbd5e1', borderRadius:'6px', fontSize:'0.9rem' };
const btnG = { padding:'12px', background:'#059669', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', flex:1 };
const btnP = { padding:'12px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', flex:1 };
const btnS = { padding:'12px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'5px', borderRadius:'4px', cursor:'pointer' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'5px', borderRadius:'4px', cursor:'pointer' };
const lS = { fontSize:'0.7rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'2px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'25px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

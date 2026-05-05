import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, PlusCircle, Save, X, Edit3, Search, Printer } from 'lucide-react';

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    id_cliente: '', nombre_fantasia: '', nombre_cliente: '', rut: '', telefono: '', 
    whatsapp: false, correo: '', direccion: '', comuna: '', region: '', 
    productos_ofrecidos: '', ultimo_contacto: '', ultimo_valor: 0, 
    proximo_contacto: '', estado: 'pendiente', origen: '', responsable: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchC = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    setData(data || []);
  };

  useEffect(() => { fetchC(); }, []);

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('clientes').update(formData).eq('id', editingId);
        if (error) throw error;
        alert("Actualizado correctamente");
      } else {
        const { error } = await supabase.from('clientes').insert([formData]);
        if (error) throw error;
        alert("Creado correctamente");
      }
      setShowForm(false); setEditingId(null); setFormData(initialForm); fetchC();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', gap:'1rem'}}>
        <div style={{position:'relative', flex:1}}>
          <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}} />
          <input type="text" placeholder="Buscador universal (RUT, Nombre, Comuna...)" style={iS} paddingleft="40px" onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => window.print()} style={{...btn, backgroundColor:'#64748b', width:'auto'}}> <Printer size={18}/> Reporte </button>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setShowForm(true);}} style={{...btn, backgroundColor:'#059669', width:'auto'}}> <PlusCircle size={18}/> Nuevo Cliente </button>
      </div>

      {showForm && (
        <div className="no-print" style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form onSubmit={save} style={{backgroundColor:'white', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'1000px', maxHeight:'90vh', overflowY:'auto'}}>
            <h3 style={{marginTop:0, color:'#1e40af', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>
              {editingId ? 'Editar Ficha Completa' : 'Nueva Ficha Completa'}
            </h3>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginTop:'15px'}}>
              <div><label style={lS}>ID CLIENTE</label><input type="text" style={iS} value={formData.id_cliente} onChange={e=>setFormData({...formData, id_cliente: e.target.value})} required/></div>
              <div><label style={lS}>FANTASÍA</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required/></div>
              <div><label style={lS}>NOMBRE REAL</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} /></div>
              <div><label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} /></div>
              <div><label style={lS}>TELÉFONO</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} /></div>
              <div style={{paddingTop:'20px'}}><label style={lS}><input type="checkbox" checked={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.checked})} /> ¿WSP?</label></div>
              <div><label style={lS}>CORREO</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} /></div>
              <div><label style={lS}>DIRECCIÓN</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} /></div>
              <div><label style={lS}>COMUNA</label><input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} /></div>
              <div><label style={lS}>REGIÓN</label><input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} /></div>
              <div><label style={lS}>ORIGEN</label><input type="text" style={iS} value={formData.origen} onChange={e=>setFormData({...formData, origen: e.target.value})} /></div>
              <div><label style={lS}>RESPONSABLE</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} /></div>
              <div style={{backgroundColor:'#e0f2fe', padding:'5px', borderRadius:'5px'}}><label style={lS}>ÚLT. CONTACTO</label><input type="date" style={iS} value={formData.ultimo_contacto} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} /></div>
              <div style={{backgroundColor:'#fef2f2', padding:'5px', borderRadius:'5px'}}><label style={lS}>PRÓX. CONTACTO</label><input type="date" style={iS} value={formData.proximo_contacto} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} /></div>
              <div><label style={lS}>VALOR VENTA</label><input type="number" style={iS} value={formData.ultimo_valor} onChange={e=>setFormData({...formData, ultimo_valor: e.target.value})} /></div>
              <div><label style={lS}>ESTADO</label>
                <select style={iS} value={formData.estado} onChange={e=>setFormData({...formData, estado: e.target.value})}>
                  <option value="pendiente">Pendiente</option>
                  <option value="contactado">Contactado</option>
                  <option value="cotizado">Cotizado</option>
                </select>
              </div>
            </div>
            <div style={{marginTop:'10px'}}>
              <label style={lS}>PRODUCTOS</label><textarea style={{...iS, height:'50px'}} value={formData.productos_ofrecidos} onChange={e=>setFormData({...formData, productos_ofrecidos: e.target.value})} />
              <label style={lS}>OBSERVACIONES</label><textarea style={{...iS, height:'50px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
              <button type="submit" style={{...btn, backgroundColor:'#1e40af'}}>Guardar</button>
              <button type="button" onClick={()=>{setShowForm(false); setEditingId(null);}} style={{...btn, backgroundColor:'#64748b'}}>Cerrar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{overflowX:'auto', backgroundColor:'white', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.65rem', minWidth:'2600px'}}>
          <thead>
            <tr style={{backgroundColor:'#1e40af', color:'white'}}>
              <th className="no-print" style={tH}>EDITAR</th>
              <th style={tH}>FECHA INGRESO</th>
              <th style={tH}>ID CLIENTE</th>
              <th style={tH}>FANTASÍA</th>
              <th style={tH}>NOMBRE REAL</th>
              <th style={tH}>RUT</th>
              <th style={tH}>TELÉFONO</th>
              <th style={tH}>WSP</th>
              <th style={tH}>CORREO</th>
              <th style={tH}>DIRECCIÓN</th>
              <th style={tH}>COMUNA</th>
              <th style={tH}>REGIÓN</th>
              <th style={tH}>PRODUCTOS</th>
              <th style={tH}>ÚLT. CONTACTO</th>
              <th style={tH}>VALOR VENTA</th>
              <th style={tH}>PRÓX. CONTACTO</th>
              <th style={tH}>ESTADO</th>
              <th style={tH}>ORIGEN</th>
              <th style={tH}>RESPONSABLE</th>
              <th style={tH}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id} style={{borderBottom:'1px solid #eee'}}>
                <td className="no-print" style={tD}><button onClick={() => handleEdit(c)}>Modificar</button></td>
                <td style={tD}>{c.fecha_ingreso}</td>
                <td style={tD}><b>{c.id_cliente}</b></td>
                <td style={{...tD, fontWeight:'bold', color:'#1e40af'}}>{c.nombre_fantasia}</td>
                <td style={tD}>{c.nombre_cliente}</td>
                <td style={tD}>{c.rut}</td>
                <td style={tD}>{c.telefono}</td>
                <td style={tD}>{c.whatsapp ? '✅' : '❌'}</td>
                <td style={tD}>{c.correo}</td>
                <td style={tD}>{c.direccion}</td>
                <td style={tD}>{c.comuna}</td>
                <td style={tD}>{c.region}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'250px'}}>{c.productos_ofrecidos}</td>
                <td style={tD}>{c.ultimo_contacto}</td>
                <td style={tD}>${Number(c.ultimo_valor).toLocaleString('es-CL')}</td>
                <td style={{...tD, backgroundColor:'#fff1f2', color:'#e11d48', fontWeight:'bold'}}>{c.proximo_contacto}</td>
                <td style={tD}>{c.estado?.toUpperCase()}</td>
                <td style={tD}>{c.origen}</td>
                <td style={tD}>{c.responsable}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'250px'}}>{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #cbd5e1', borderRadius:'8px', boxSizing:'border-box', fontSize:'0.85rem', marginBottom:'5px' };
const btn = { padding:'12px', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' };
const tH = { padding:'15px 10px', textAlign:'left', whiteSpace:'nowrap' };
const tD = { padding:'12px 10px', whiteSpace:'nowrap' };
const lS = { fontSize:'0.6rem', fontWeight:'bold', color:'#64748b', display:'block', marginBottom:'2px' };

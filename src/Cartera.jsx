import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, PlusCircle, Save, X, Edit3, Search, Printer, Trash2 } from 'lucide-react';

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempProducts, setTempProducts] = useState([{ nombre: '', precio: 0 }]);

  const initialForm = {
    nombre_fantasia: '', nombre_cliente: '', rut: '', telefono: '', 
    whatsapp: false, correo: '', direccion: '', comuna: '', region: '', 
    productos_ofrecidos: '', ultimo_contacto: '', ultimo_valor: 0, 
    proximo_contacto: '', responsable: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchC = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    setData(data || []);
  };

  useEffect(() => { fetchC(); }, []);

  const hoy = new Date().toISOString().split('T')[0];

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const formatRut = (v) => {
    let cleaned = v.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    let cuerpo = cleaned.slice(0, -1);
    let dv = cleaned.slice(-1).toUpperCase();
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
  };

  const formatPhone = (v) => {
    let c = v.replace(/\D/g, '');
    if (c.startsWith('56')) {
        let rest = c.slice(2);
        if (rest.length <= 1) return `+56 ${rest}`;
        if (rest.length <= 5) return `+56 ${rest.slice(0,1)} ${rest.slice(1)}`;
        return `+56 ${rest.slice(0,1)} ${rest.slice(1,5)} ${rest.slice(5,9)}`;
    } 
    if (c.startsWith('9') || c.length > 0) {
        if (c.length <= 4) return c;
        return `${c.slice(0,1)} ${c.slice(1,5)} ${c.slice(5,9)}`;
    }
    return v;
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
    } else {
      setTempProducts([{ nombre: '', precio: 0 }]);
    }
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
    const totalValue = tempProducts.reduce((sum, p) => sum + Number(p.precio), 0);
    const productString = tempProducts
      .filter(p => p.nombre && p.nombre.trim() !== '')
      .map(p => `${p.nombre} ($${Number(p.precio).toLocaleString('es-CL')})`)
      .join(' | ');

    const cleanData = { ...formData };
    Object.keys(cleanData).forEach(key => { if (cleanData[key] === '') cleanData[key] = null; });
    const finalData = { ...cleanData, productos_ofrecidos: productString || null, ultimo_valor: totalValue || 0 };

    try {
      if (editingId) await supabase.from('clientes').update(finalData).eq('id', editingId);
      else await supabase.from('clientes').insert([finalData]);
      setShowForm(false); setEditingId(null); setFormData(initialForm); fetchC();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <style>{` @media print { .no-print { display: none !important; } table { font-size: 8px !important; width: 100% !important; } } `}</style>

      <div className="no-print" style={{marginBottom:'20px'}}>
        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setShowForm(true);}} style={{...btn, backgroundColor:'#059669', flex:1}}> <PlusCircle size={18}/> NUEVO CLIENTE </button>
          <button onClick={() => window.print()} style={{...btn, backgroundColor:'#64748b', width:'60px'}}> <Printer size={18}/> </button>
        </div>
        <div style={{position:'relative'}}>
          <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}} />
          <input type="text" placeholder="Buscar cliente..." style={{...iS, paddingLeft:'40px', marginBottom:0}} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <div className="no-print" style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto'}}>
          <form onSubmit={save} style={{backgroundColor:'white', padding:'2rem', borderRadius:'15px', width:'100%', maxWidth:'700px', alignSelf:'flex-start', boxShadow:'0 20px 40px rgba(0,0,0,0.4)'}}>
            <h3 style={{marginTop:0, color:'#1e40af', borderBottom:'2px solid #f1f5f9', paddingBottom:'10px', textAlign:'center'}}>FICHA DE CLIENTE</h3>
            
            <div style={{marginTop:'20px'}}>
              <h4 style={sectionTitle}>Identificación</h4>
              <label style={lS}>Nombre de Fantasía *</label>
              <input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required />
              <label style={lS}>Razón Social *</label>
              <input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required />
              <label style={lS}>RUT</label>
              <input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: formatRut(e.target.value)})} placeholder="12.345.678-9" />
              
              <h4 style={sectionTitle}>Contacto</h4>
              <label style={lS}>Teléfono</label>
              <input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: formatPhone(e.target.value)})} />
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px', background:'#f0fdf4', padding:'10px', borderRadius:'8px'}}>
                <input type="checkbox" id="ws" checked={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.checked})} style={{width:'18px', height:'18px'}} />
                <label htmlFor="ws" style={{fontWeight:'bold', color:'#166534', fontSize:'0.9rem'}}>¿Tiene WhatsApp?</label>
              </div>
              <label style={lS}>Correo Electrónico</label>
              <input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />

              <h4 style={sectionTitle}>Ubicación</h4>
              <label style={lS}>Dirección</label>
              <input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
              <label style={lS}>Comuna</label>
              <input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} />
              <label style={lS}>Región</label>
              <input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} />

              <h4 style={sectionTitle}>Gestión</h4>
              <label style={lS}>Vendedor / Responsable</label>
              <input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} />
              <label style={lS}>Último Contacto</label>
              <input type="date" style={iS} value={formData.ultimo_contacto || ''} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} />
              <label style={lS}>Próxima Llamada</label>
              <input type="date" style={iS} min={hoy} value={formData.proximo_contacto || ''} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} />
            </div>

            <h4 style={sectionTitle}>Productos</h4>
            <div style={{background:'#f8fafc', padding:'20px', borderRadius:'10px', border:'1px solid #e2e8f0', marginBottom:'20px'}}>
              {tempProducts.map((p, idx) => (
                <div key={idx} style={{marginBottom:'15px', borderBottom:'1px solid #e2e8f0', paddingBottom:'15px'}}>
                  <div style={{display:'flex', gap:'10px', marginBottom:'8px'}}>
                    <input type="text" placeholder="Producto" style={{...iS, marginBottom:0}} value={p.nombre} onChange={e=>{let n=[...tempProducts]; n[idx].nombre=e.target.value; setTempProducts(n);}} />
                    {tempProducts.length > 1 && <button type="button" onClick={()=>setTempProducts(tempProducts.filter((_,i)=>i!==idx))} style={{color:'#ef4444', border:'none', background:'none'}}><Trash2 size={20}/></button>}
                  </div>
                  <input type="number" placeholder="Precio $" style={{...iS, marginBottom:0}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                </div>
              ))}
              <button type="button" onClick={() => setTempProducts([...tempProducts, {nombre:'', precio:0}])} style={{...btn, backgroundColor:'#1e40af', padding:'8px 15px', fontSize:'0.8rem', width:'auto'}}>+ Añadir Producto</button>
              <div style={{textAlign:'right', fontWeight:'bold', color:'#1e40af', fontSize:'1.2rem', marginTop:'15px'}}> Total: ${tempProducts.reduce((sum, p) => sum + Number(p.precio), 0).toLocaleString('es-CL')} </div>
            </div>

            <label style={lS}>Observaciones</label>
            <textarea style={{...iS, height:'120px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />

            <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
              <button type="submit" style={{...btn, backgroundColor:'#1e40af', flex:1}}>GUARDAR</button>
              <button type="button" onClick={()=>{setShowForm(false); setEditingId(null);}} style={{...btn, backgroundColor:'#64748b', flex:1}}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div style={{overflowX:'auto', backgroundColor:'white', borderRadius:'12px'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.65rem', minWidth:'2800px'}}>
          <thead>
            <tr style={{backgroundColor:'#1e40af', color:'white'}}>
              <th className="no-print" style={tH}>ACCIONES</th>
              <th style={tH}>ID</th>
              <th style={tH}>NOMBRE FANTASÍA</th>
              <th style={tH}>RAZÓN SOCIAL</th>
              <th style={tH}>RUT</th>
              <th style={tH}>TELÉFONO</th>
              <th style={tH}>DIRECCIÓN</th>
              <th style={tH}>UBICACIÓN (COM/REG)</th>
              <th style={tH}>PRODUCTOS</th>
              <th style={tH}>TOTAL</th>
              <th style={tH}>ÚLT. CONTACTO</th>
              <th style={tH}>PRÓX. CONTACTO</th>
              <th style={tH}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id} style={{borderBottom:'1px solid #eee'}}>
                <td className="no-print" style={{...tD, display:'flex', gap:'5px'}}>
                  <button onClick={()=>handleEdit(c)} style={{...smBtn, backgroundColor:'#3b82f6'}}><Edit3 size={14} color="white"/></button>
                  <button onClick={()=>deleteCliente(c.id, c.nombre_fantasia)} style={{...smBtn, backgroundColor:'#ef4444'}}><Trash2 size={14} color="white"/></button>
                </td>
                <td style={tD}>{c.id_cliente || c.id}</td>
                <td style={{...tD, fontWeight:'bold', color:'#1e40af'}}>{c.nombre_fantasia}</td>
                <td style={tD}>{c.nombre_cliente}</td>
                <td style={tD}>{c.rut}</td>
                <td style={tD}>{c.telefono} {c.whatsapp && '✅'}</td>
                <td style={tD}>{c.direccion}</td>
                <td style={tD}>{c.comuna} / {c.region}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'400px'}}>
                  {c.productos_ofrecidos?.split(' | ').map((p, i) => <div key={i}>• {p}</div>)}
                </td>
                <td style={{...tD, fontWeight:'bold'}}>${Number(c.ultimo_valor).toLocaleString('es-CL')}</td>
                <td style={tD}>{formatFechaChile(c.ultimo_contacto)}</td>
                <td style={{...tD, color:'#e11d48', fontWeight:'bold'}}>{formatFechaChile(c.proximo_contacto)}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'300px'}}>{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px', boxSizing:'border-box', fontSize:'1rem', marginBottom:'15px' };
const btn = { padding:'15px', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px', justifyContent:'center' };
const smBtn = { padding:'6px', border:'none', borderRadius:'4px', cursor:'pointer' };
const tH = { padding:'15px 10px', textAlign:'left', whiteSpace:'nowrap' };
const tD = { padding:'12px 10px', whiteSpace:'nowrap' };
const lS = { fontSize:'0.8rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'6px', textTransform:'uppercase' };
const sectionTitle = { borderLeft:'4px solid #1e40af', paddingLeft:'10px', color:'#1e40af', marginTop:'25px', marginBottom:'15px', fontSize:'1.1rem' };

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

  const validarRutChileno = (rut) => {
    if (!rut) return true;
    const limpio = rut.replace(/\./g, '').replace('-', '').toUpperCase();
    if (limpio.length < 8) return false;
    const cuerpo = limpio.slice(0, -1);
    let dv = limpio.slice(-1);
    let suma = 0; let multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
      suma = suma + (multiplo * limpio.charAt(cuerpo.length - i));
      if (multiplo < 7) multiplo++; else multiplo = 2;
    }
    let dvEsperado = 11 - (suma % 11);
    dv = (dv === 'K') ? 10 : parseInt(dv);
    dvEsperado = (dvEsperado === 11) ? 0 : (dvEsperado === 10) ? 10 : dvEsperado;
    return dv === dvEsperado;
  };

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
    if (formData.rut && !validarRutChileno(formData.rut)) {
      alert("RUT inválido."); return;
    }
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
        {/* BOTONES ARRIBA */}
        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setShowForm(true);}} style={{...btn, backgroundColor:'#059669', flex:1}}> <PlusCircle size={18}/> NUEVO CLIENTE </button>
          <button onClick={() => window.print()} style={{...btn, backgroundColor:'#64748b', width:'60px'}}> <Printer size={18}/> </button>
        </div>
        {/* BUSCADOR ABAJO */}
        <div style={{position:'relative'}}>
          <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}} />
          <input type="text" placeholder="Buscar cliente por cualquier dato..." style={{...iS, paddingLeft:'40px', marginBottom:0}} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <div className="no-print" style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto'}}>
          <form onSubmit={save} style={{backgroundColor:'white', padding:'2rem', borderRadius:'15px', width:'100%', maxWidth:'450px', alignSelf:'flex-start'}}>
            <h3 style={{marginTop:0, color:'#1e40af', borderBottom:'2px solid #f1f5f9', paddingBottom:'10px', textAlign:'center'}}>FICHA DE CLIENTE</h3>
            <label style={lS}>NOMBRE DE FANTASÍA *</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required />
            <label style={lS}>NOMBRE REAL *</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required />
            <label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: formatRut(e.target.value)})} placeholder="12.345.678-9" />
            <label style={lS}>TELÉFONO</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: formatPhone(e.target.value)})} />
            <label style={lS}>ÚLT. CONTACTO</label><input type="date" style={iS} value={formData.ultimo_contacto || ''} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} />
            <label style={lS}>PRÓX. CONTACTO</label><input type="date" style={iS} min={hoy} value={formData.proximo_contacto || ''} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} />
            <label style={lS}>OBSERVACIONES</label><textarea style={{...iS, height:'80px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            <div style={{display:'flex', gap:'10px'}}>
              <button type="submit" style={{...btn, backgroundColor:'#1e40af', flex:1}}>GUARDAR</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{...btn, backgroundColor:'#64748b', flex:1}}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div style={{overflowX:'auto', backgroundColor:'white', borderRadius:'12px'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.65rem', minWidth:'2000px'}}>
          <thead>
            <tr style={{backgroundColor:'#1e40af', color:'white'}}>
              <th className="no-print" style={tH}>ACCIONES</th>
              <th style={tH}>ID</th>
              <th style={tH}>NOMBRE DE FANTASÍA</th>
              <th style={tH}>PRODUCTOS</th>
              <th style={tH}>VALOR TOTAL</th>
              <th style={tH}>TELÉFONO</th>
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
                <td style={{...tD, fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'300px'}}>{c.productos_ofrecidos?.split(' | ').map((p, i) => <div key={i}>• {p}</div>)}</td>
                <td style={{...tD, fontWeight:'bold'}}>${Number(c.ultimo_valor).toLocaleString('es-CL')}</td>
                <td style={tD}>{c.telefono}</td>
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
const iS = { width:'100%', padding:'10px', border:'1px solid #cbd5e1', borderRadius:'8px', boxSizing:'border-box', fontSize:'0.9rem', marginBottom:'12px' };
const btn = { padding:'12px', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' };
const smBtn = { padding:'6px', border:'none', borderRadius:'4px', cursor:'pointer' };
const tH = { padding:'15px 10px', textAlign:'left', whiteSpace:'nowrap' };
const tD = { padding:'12px 10px', whiteSpace:'nowrap' };
const lS = { fontSize:'0.7rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px' };

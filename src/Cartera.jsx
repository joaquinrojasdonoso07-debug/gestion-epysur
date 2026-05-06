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

  const formatRut = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    const cuerpo = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();
    let res = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return res + "-" + dv;
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('569')) {
      const part = cleaned.slice(3);
      if (part.length <= 4) return `+56 9 ${part}`;
      return `+56 9 ${part.slice(0, 4)} ${part.slice(4, 8)}`;
    }
    return value;
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    if (cliente.productos_ofrecidos) {
      const prods = cliente.productos_ofrecidos.split(' | ').map(p => {
        const [n, v] = p.split(' ($');
        return { nombre: n, precio: v ? parseInt(v.replace(')', '').replace(/\./g, '')) : 0 };
      });
      setTempProducts(prods);
    } else {
      setTempProducts([{ nombre: '', precio: 0 }]);
    }
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const totalValue = tempProducts.reduce((sum, p) => sum + Number(p.precio), 0);
    const productString = tempProducts
      .filter(p => p.nombre.trim() !== '')
      .map(p => `${p.nombre} ($${Number(p.precio).toLocaleString('es-CL')})`)
      .join(' | ');

    const finalData = { ...formData, productos_ofrecidos: productString, ultimo_valor: totalValue };

    try {
      if (editingId) {
        const { error } = await supabase.from('clientes').update(finalData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clientes').insert([finalData]);
        if (error) throw error;
      }
      setShowForm(false); setEditingId(null); setFormData(initialForm); setTempProducts([{ nombre: '', precio: 0 }]); fetchC();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 5mm; }
            .no-print { display: none !important; }
            table { min-width: 100% !important; width: 100% !important; font-size: 8px !important; }
            th, td { padding: 4px !important; border: 1px solid #e2e8f0 !important; white-space: normal !important; }
            body { background: white !important; }
            .print-container { box-shadow: none !important; border: none !important; }
          }
        `}
      </style>

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', gap:'1rem'}}>
        <div style={{position:'relative', flex:1}}>
          <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}} />
          <input type="text" placeholder="Buscador universal..." style={iS} paddingleft="40px" onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => window.print()} style={{...btn, backgroundColor:'#64748b', width:'auto'}}> <Printer size={18}/> Reporte </button>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{ nombre: '', precio: 0 }]); setShowForm(true);}} style={{...btn, backgroundColor:'#059669', width:'auto'}}> <PlusCircle size={18}/> Nuevo Cliente </button>
      </div>

      {showForm && (
        <div className="no-print" style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form onSubmit={save} style={{backgroundColor:'white', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'1000px', maxHeight:'90vh', overflowY:'auto'}}>
            <h3 style={{marginTop:0, color:'#1e40af', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>
              {editingId ? 'Editar Ficha' : 'Nueva Ficha'}
            </h3>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginTop:'15px'}}>
              <div><label style={lS}>NOMBRE DE FANTASÍA</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required/></div>
              <div><label style={lS}>NOMBRE REAL</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} /></div>
              <div><label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: formatRut(e.target.value)})} placeholder="12.345.678-9" /></div>
              <div><label style={lS}>TELÉFONO</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: formatPhone(e.target.value)})} placeholder="+56 9 1234 5678" /></div>
              <div style={{paddingTop:'20px'}}><label style={lS}><input type="checkbox" checked={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.checked})} /> ¿WSP?</label></div>
              <div><label style={lS}>CORREO</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} /></div>
              <div><label style={lS}>DIRECCIÓN</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} /></div>
              <div><label style={lS}>COMUNA</label><input type="text" style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} /></div>
              <div><label style={lS}>REGIÓN</label><input type="text" style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} /></div>
              <div><label style={lS}>INGRESADO POR</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} /></div>
              <div><label style={lS}>ÚLT. CONTACTO</label><input type="date" style={iS} value={formData.ultimo_contacto} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} /></div>
              <div><label style={lS}>PRÓX. CONTACTO</label><input type="date" style={iS} value={formData.proximo_contacto} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} /></div>
            </div>

            <div style={{marginTop:'20px', padding:'15px', backgroundColor:'#f8fafc', borderRadius:'10px', border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <label style={{...lS, color:'#1e40af', fontSize:'0.75rem'}}>PRODUCTOS Y SERVICIOS</label>
                <button type="button" onClick={() => setTempProducts([...tempProducts, { nombre: '', precio: 0 }])} style={{...btn, backgroundColor:'#1e40af', padding:'5px 10px', fontSize:'0.7rem'}}>+ Añadir Producto</button>
              </div>
              {tempProducts.map((p, index) => (
                <div key={index} style={{display:'flex', gap:'10px', marginBottom:'8px'}}>
                  <input type="text" placeholder="Producto" style={iS} value={p.nombre} onChange={e => {
                    const n = [...tempProducts]; n[index].nombre = e.target.value; setTempProducts(n);
                  }} required />
                  <input type="number" placeholder="Valor $" style={{...iS, width:'150px'}} value={p.precio} onChange={e => {
                    const n = [...tempProducts]; n[index].precio = e.target.value; setTempProducts(n);
                  }} required />
                  {tempProducts.length > 1 && (
                    <button type="button" onClick={() => setTempProducts(tempProducts.filter((_, i) => i !== index))} style={{backgroundColor:'transparent', border:'none', color:'#ef4444', cursor:'pointer'}}><Trash2 size={18}/></button>
                  )}
                </div>
              ))}
              <div style={{textAlign:'right', fontWeight:'bold', color:'#1e40af', marginTop:'5px'}}>
                Total: ${tempProducts.reduce((sum, p) => sum + Number(p.precio), 0).toLocaleString('es-CL')}
              </div>
            </div>

            <div style={{marginTop:'15px'}}>
              <label style={lS}>OBSERVACIONES</label><textarea style={{...iS, height:'50px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
              <button type="submit" style={{...btn, backgroundColor:'#1e40af'}}>Guardar</button>
              <button type="button" onClick={()=>{setShowForm(false); setEditingId(null);}} style={{...btn, backgroundColor:'#64748b'}}>Cerrar</button>
            </div>
          </form>
        </div>
      )}

      <div className="print-container" style={{overflowX:'auto', backgroundColor:'white', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.65rem', minWidth:'2400px'}}>
          <thead>
            <tr style={{backgroundColor:'#1e40af', color:'white'}}>
              <th className="no-print" style={tH}>EDITAR</th>
              <th style={tH}>ID CLIENTE</th>
              <th style={tH}>NOMBRE DE FANTASÍA</th>
              <th style={tH}>RUT</th>
              <th style={tH}>PRODUCTOS (DETALLE)</th>
              <th style={tH}>VALOR TOTAL</th>
              <th style={tH}>TELÉFONO</th>
              <th style={tH}>WSP</th>
              <th style={tH}>COMUNA / REGIÓN</th>
              <th style={tH}>ÚLT. CONTACTO</th>
              <th style={tH}>PRÓX. CONTACTO</th>
              <th style={tH}>INGRESADO POR</th>
              <th style={tH}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id} style={{borderBottom:'1px solid #eee'}}>
                <td className="no-print" style={tD}><button onClick={() => handleEdit(c)}>Modificar</button></td>
                <td style={tD}><b>{c.id_cliente || c.id}</b></td>
                <td style={{...tD, fontWeight:'bold', color:'#1e40af'}}>{c.nombre_fantasia}</td>
                <td style={tD}>{c.rut}</td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'400px', color:'#475569'}}>
                  {c.productos_ofrecidos?.split(' | ').map((p, i) => <div key={i}>• {p}</div>)}
                </td>
                <td style={{...tD, fontWeight:'bold'}}>${Number(c.ultimo_valor).toLocaleString('es-CL')}</td>
                <td style={tD}>{c.telefono}</td>
                <td style={tD}>{c.whatsapp ? '✅' : '❌'}</td>
                <td style={tD}>{c.comuna} / {c.region}</td>
                <td style={tD}>{c.ultimo_contacto}</td>
                <td style={{...tD, backgroundColor:'#fff1f2', color:'#e11d48', fontWeight:'bold'}}>{c.proximo_contacto}</td>
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

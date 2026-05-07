import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Save, Search, Edit3, Trash2, Printer } from 'lucide-react';

export default function Creditos() {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempItems, setTempItems] = useState([{ nombre: '', precio: 0 }]);

  const initialForm = { cliente_id: '', fecha_deuda: new Date().toISOString().split('T')[0], valor_total: 0, abono: 0, pagada: false, observacion: '', productos_detalle: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data: resC } = await supabase.from('creditos').select('*, clientes(nombre_fantasia, id_cliente)').order('id', { ascending: false });
    const { data: resL } = await supabase.from('clientes').select('id, nombre_fantasia, id_cliente');
    setCreditos(resC || []);
    setClientes(resL || []);
  };

  useEffect(() => { fetchData(); }, []);

  const formatFechaChile = (fechaStr) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const total = tempItems.reduce((sum, item) => sum + Number(item.precio), 0);
    setFormData(prev => ({ ...prev, valor_total: total }));
  }, [tempItems]);

  const handleEdit = (c) => {
    setFormData({ ...c, observacion: c.observacion || '' });
    if (c.productos_detalle) {
      const items = c.productos_detalle.split(' | ').map(i => {
        const parts = i.split(' ($');
        return { nombre: parts[0], precio: parts[1] ? parseInt(parts[1].replace(')', '').replace(/\./g, '')) : 0 };
      });
      setTempItems(items);
    } else { setTempItems([{ nombre: 'Venta', precio: c.valor_total }]); }
    setEditingId(c.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const detalle = tempItems.filter(i => i.nombre.trim() !== '').map(i => `${i.nombre} ($${Number(i.precio).toLocaleString('es-CL')})`).join(' | ');
    const finalData = { ...formData, productos_detalle: detalle };
    try {
      if (editingId) await supabase.from('creditos').update(finalData).eq('id', editingId);
      else await supabase.from('creditos').insert([finalData]);
      setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filtrados = creditos.filter(c => {
    const s = search.toLowerCase();
    const estado = c.pagada ? 'pagada' : 'pendiente';
    return (String(c.clientes?.nombre_fantasia).toLowerCase().includes(s) || estado.includes(s));
  });

  return (
    <div>
      <div className="no-print" style={{ marginBottom: '20px' }}>
        {/* BOTONES ARRIBA */}
        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
          <button onClick={() => {setEditingId(null); setShowForm(true);}} style={{...btnRed, flex:1}}> <PlusCircle size={18}/> NUEVA DEUDA </button>
          <button onClick={() => window.print()} style={{...btnGray, width:'60px'}}> <Printer size={18}/> </button>
        </div>
        {/* BUSCADOR ABAJO */}
        <div style={{position:'relative'}}>
          <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}} />
          <input type="text" placeholder="Buscar por cliente o estado..." style={{...iS, paddingLeft:'40px', marginBottom:0}} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', padding: '20px', zIndex: 100, overflowY:'auto' }}>
          <form onSubmit={save} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: '400px', alignSelf:'flex-start' }}>
            <h3 style={{ color: '#991b1b', borderBottom: '2px solid #fee2e2', paddingBottom: '10px' }}>REGISTRO DE DEUDA</h3>
            <label style={lS}>CLIENTE</label>
            <select style={iS} value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>[{c.id_cliente}] {c.nombre_fantasia}</option>)}
            </select>
            <label style={lS}>FECHA</label>
            <input type="date" style={iS} value={formData.fecha_deuda} onChange={e => setFormData({ ...formData, fecha_deuda: e.target.value })} required />
            <div style={{textAlign:'right', fontWeight:'bold', color:'#991b1b'}}> TOTAL: ${Number(formData.valor_total).toLocaleString('es-CL')} </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" style={{ ...btnRed, flex: 1 }}>GUARDAR</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...btnGray, flex: 1 }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowX:'auto'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', minWidth: '1100px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              <th className="no-print" style={tH}>EDITAR</th>
              <th style={tH}>FECHA</th>
              <th style={tH}>CLIENTE</th>
              <th style={tH}>DETALLE PRODUCTOS</th>
              <th style={tH}>TOTAL</th>
              <th style={tH}>SALDO</th>
              <th style={tH}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(cr => (
              <tr key={cr.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                <td className="no-print" style={tD}><button onClick={() => handleEdit(cr)}>Edit</button></td>
                <td style={tD}>{formatFechaChile(cr.fecha_deuda)}</td>
                <td style={tD}><b>{cr.clientes?.nombre_fantasia}</b></td>
                <td style={{...tD, whiteSpace:'normal', maxWidth:'300px'}}>{cr.productos_detalle?.split(' | ').map((item, i) => <div key={i}>• {item}</div>)}</td>
                <td style={tD}>${Number(cr.valor_total).toLocaleString('es-CL')}</td>
                <td style={{ ...tD, color: '#e11d48', fontWeight: 'bold' }}> ${(cr.valor_total - cr.abono).toLocaleString('es-CL')} </td>
                <td style={{...tD, fontWeight:'bold', color: cr.pagada ? 'green' : 'red'}}>{cr.pagada ? 'PAGADA' : 'PENDIENTE'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const iS = { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize:'1rem' };
const btnRed = { padding: '12px', color: 'white', backgroundColor: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' };
const btnGray = { padding: '12px', color: 'white', backgroundColor: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', justifyContent:'center' };
const tH = { padding: '12px 10px', textAlign: 'left' };
const tD = { padding: '10px' };
const lS = { fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' };

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CreditCard, PlusCircle, Save, Search, Edit3, Trash2, Printer } from 'lucide-react';

export default function Creditos() {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempItems, setTempItems] = useState([{ nombre: '', precio: 0 }]);

  const initialForm = { 
    cliente_id: '', fecha_deuda: new Date().toISOString().split('T')[0], 
    valor_unitario: 0, cantidad: 1, valor_total: 0, abono: 0, 
    pagada: false, observacion: '', productos_detalle: '' 
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data: resC } = await supabase.from('creditos').select('*, clientes(nombre_fantasia, id_cliente)').order('id', { ascending: false });
    const { data: resL } = await supabase.from('clientes').select('id, nombre_fantasia, id_cliente');
    setCreditos(resC || []);
    setClientes(resL || []);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const totalItems = tempItems.reduce((sum, item) => sum + Number(item.precio), 0);
    setFormData(prev => ({ ...prev, valor_total: totalItems }));
  }, [tempItems]);

  const handleEdit = (credito) => {
    setFormData({
      cliente_id: credito.cliente_id, fecha_deuda: credito.fecha_deuda,
      valor_unitario: credito.valor_unitario, cantidad: credito.cantidad,
      valor_total: credito.valor_total, abono: credito.abono,
      pagada: credito.pagada, observacion: credito.observacion || '',
      productos_detalle: credito.productos_detalle || ''
    });

    if (credito.productos_detalle && credito.productos_detalle.includes(' | ')) {
      const items = credito.productos_detalle.split(' | ').map(i => {
        const parts = i.split(' ($');
        return { 
          nombre: parts[0], 
          precio: parts[1] ? parseInt(parts[1].replace(')', '').replace(/\./g, '')) : 0 
        };
      });
      setTempItems(items);
    } else {
      setTempItems([{ nombre: 'Servicio', precio: credito.valor_total }]);
    }
    setEditingId(credito.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const detalleString = tempItems
      .filter(i => i.nombre.trim() !== '')
      .map(i => `${i.nombre} ($${Number(i.precio).toLocaleString('es-CL')})`)
      .join(' | ');

    const finalData = { ...formData, productos_detalle: detalleString };

    try {
      if (editingId) {
        await supabase.from('creditos').update(finalData).eq('id', editingId);
      } else {
        await supabase.from('creditos').insert([finalData]);
      }
      setShowForm(false); setEditingId(null); setFormData(initialForm); setTempItems([{ nombre: '', precio: 0 }]); fetchData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      await supabase.from('creditos').delete().eq('id', id);
      fetchData();
    }
  };

  const filtrados = creditos.filter(c => {
    const s = search.toLowerCase();
    const estado = c.pagada ? 'pagada' : 'pendiente';
    return (
      String(c.clientes?.nombre_fantasia).toLowerCase().includes(s) ||
      String(c.clientes?.id_cliente).toLowerCase().includes(s) ||
      estado.includes(s)
    );
  });

  return (
    <div>
      <style>
        {` @media print { @page { size: landscape; margin: 10mm; } .no-print { display: none !important; } table { width: 100% !important; font-size: 9px !important; } th, td { border: 1px solid #eee !important; padding: 4px !important; white-space: normal !important; } } `}
      </style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input type="text" placeholder="Buscar..." style={{...iS, paddingLeft: '40px', marginBottom: 0}} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => window.print()} style={{...btn, backgroundColor:'#64748b', width:'auto'}}> <Printer size={18}/> Reporte </button>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempItems([{ nombre: '', precio: 0 }]); setShowForm(true);}} style={{ ...btn, backgroundColor: '#991b1b', width: 'auto' }}> <PlusCircle size={18}/> Nueva Deuda </button>
      </div>

      {showForm && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
          <form onSubmit={save} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '95vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b', borderBottom: '2px solid #fee2e2', paddingBottom: '10px' }}> {editingId ? 'Editar Deuda' : 'Nueva Deuda'} </h3>
            
            <label style={lS}>CLIENTE</label>
            <select style={iS} value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>[{c.id_cliente}] {c.nombre_fantasia}</option>)}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label style={lS}>FECHA</label><input type="date" style={iS} value={formData.fecha_deuda} onChange={e => setFormData({ ...formData, fecha_deuda: e.target.value })} required /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={formData.pagada} onChange={e => setFormData({ ...formData, pagada: e.target.checked })} /> ¿PAGADA?
              </label>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fee2e2', margin: '15px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={lS}>DETALLE DE PRODUCTOS</label>
                <button type="button" onClick={() => setTempItems([...tempItems, { nombre: '', precio: 0 }])} style={{ ...btn, backgroundColor: '#991b1b', padding: '5px 10px', fontSize: '0.7rem' }}>+ Añadir</button>
              </div>
              {tempItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input type="text" placeholder="Producto" style={iS} value={item.nombre} onChange={e => { const n = [...tempItems]; n[index].nombre = e.target.value; setTempItems(n); }} required />
                  <input type="number" placeholder="$" style={{ ...iS, width: '120px' }} value={item.precio} onChange={e => { const n = [...tempItems]; n[index].precio = e.target.value; setTempItems(n); }} required />
                  {tempItems.length > 1 && ( <button type="button" onClick={() => setTempItems(tempItems.filter((_, i) => i !== index))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}> <Trash2 size={16}/> </button> )}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label style={lS}>ABONO ($)</label><input type="number" style={iS} value={formData.abono} onChange={e => setFormData({ ...formData, abono: e.target.value })} /></div>
              <div><label style={lS}>TOTAL</label><div style={{ ...iS, backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>${Number(formData.valor_total).toLocaleString('es-CL')}</div></div>
            </div>

            <label style={lS}>OBSERVACIONES GENERALES</label>
            <textarea style={{ ...iS, height: '60px' }} value={formData.observacion} onChange={e => setFormData({ ...formData, observacion: e.target.value })} placeholder="Ej: Pago pendiente para el próximo mes..." />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ ...btn, backgroundColor: '#991b1b' }}> <Save size={18}/> Guardar </button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} style={{ ...btn, backgroundColor: '#64748b' }}>Cerrar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', minWidth: '1200px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fee2e2', color: '#991b1b', textAlign: 'left' }}>
              <th className="no-print" style={tH}>ACCIONES</th>
              <th style={tH}>FECHA</th>
              <th style={tH}>ID CLI</th>
              <th style={tH}>CLIENTE</th>
              <th style={tH}>DETALLE PRODUCTOS</th>
              <th style={tH}>TOTAL</th>
              <th style={tH}>ABONO</th>
              <th style={tH}>SALDO</th>
              <th style={tH}>ESTADO</th>
              <th style={tH}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(cr => (
              <tr key={cr.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                <td className="no-print" style={{...tD, display: 'flex', gap: '5px'}}>
                  <button onClick={() => handleEdit(cr)} style={actionBtn}> <Edit3 size={12}/> </button>
                  {cr.pagada && <button onClick={() => handleDelete(cr.id)} style={{...actionBtn, color: '#e11d48', borderColor: '#e11d48'}}> <Trash2 size={12}/> </button>}
                </td>
                <td style={tD}>{cr.fecha_deuda}</td>
                <td style={tD}>{cr.clientes?.id_cliente}</td>
                <td style={tD}><b>{cr.clientes?.nombre_fantasia}</b></td>
                <td style={{...tD, whiteSpace: 'normal', maxWidth: '300px', color: '#475569'}}>
                  {cr.productos_detalle?.split(' | ').map((item, i) => <div key={i}>• {item}</div>)}
                </td>
                <td style={tD}>${Number(cr.valor_total).toLocaleString('es-CL')}</td>
                <td style={tD}>${Number(cr.abono).toLocaleString('es-CL')}</td>
                <td style={{ ...tD, color: '#e11d48', fontWeight: 'bold' }}> ${(cr.valor_total - cr.abono).toLocaleString('es-CL')} </td>
                <td style={{...tD, fontWeight: 'bold', color: cr.pagada ? '#059669' : '#e11d48'}}> {cr.pagada ? 'PAGADA' : 'PENDIENTE'} </td>
                <td style={{...tD, whiteSpace: 'normal', maxWidth: '200px'}}>{cr.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' };
const btn = { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', cursor:'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' };
const actionBtn = { cursor: 'pointer', border: '1px solid #991b1b', borderRadius: '4px', padding: '4px', color: '#991b1b', backgroundColor: 'transparent' };
const tH = { padding: '15px 10px' };
const tD = { padding: '12px 10px' };
const lS = { fontSize: '0.6rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '2px' };

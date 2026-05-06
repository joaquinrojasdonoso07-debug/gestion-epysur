import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CreditCard, PlusCircle, Save, Search, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function Creditos() {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = { 
    cliente_id: '', fecha_deuda: new Date().toISOString().split('T')[0], 
    valor_unitario: 0, cantidad: 1, valor_total: 0, abono: 0, 
    pagada: false, observacion: '' 
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
    const total = Number(formData.valor_unitario) * Number(formData.cantidad);
    setFormData(prev => ({ ...prev, valor_total: total }));
  }, [formData.valor_unitario, formData.cantidad]);

  const handleEdit = (credito) => {
    setFormData({
      cliente_id: credito.cliente_id, fecha_deuda: credito.fecha_deuda,
      valor_unitario: credito.valor_unitario, cantidad: credito.cantidad,
      valor_total: credito.valor_total, abono: credito.abono,
      pagada: credito.pagada, observacion: credito.observacion || ''
    });
    setEditingId(credito.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('creditos').update(formData).eq('id', editingId);
        if (error) throw error;
        alert("Crédito actualizado");
      } else {
        const { error } = await supabase.from('creditos').insert([formData]);
        if (error) throw error;
        alert("Crédito registrado");
      }
      setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro pagado? Esta acción no se puede deshacer.")) {
      const { error } = await supabase.from('creditos').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      else { fetchData(); alert("Registro eliminado"); }
    }
  };

  const filtrados = creditos.filter(c => 
    String(c.clientes?.nombre_fantasia).toLowerCase().includes(search.toLowerCase()) ||
    String(c.clientes?.id_cliente).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input type="text" placeholder="Buscar crédito por nombre de fantasía..." style={{...iS, paddingLeft: '40px', marginBottom: 0}} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setShowForm(true);}} style={{ ...btn, backgroundColor: '#991b1b', width: 'auto' }}>
          <PlusCircle size={18}/> Nuevo Crédito
        </button>
      </div>

      {showForm && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
          <form onSubmit={save} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b', borderBottom: '2px solid #fee2e2', paddingBottom: '10px' }}>
              {editingId ? 'Modificar Crédito' : 'Nuevo Crédito'}
            </h3>
            <label style={lS}>NOMBRE DE FANTASÍA (CLIENTE)</label>
            <select style={iS} value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>[{c.id_cliente}] {c.nombre_fantasia}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="date" style={iS} value={formData.fecha_deuda} onChange={e => setFormData({ ...formData, fecha_deuda: e.target.value })} required />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={formData.pagada} onChange={e => setFormData({ ...formData, pagada: e.target.checked })} /> ¿PAGADA?
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <input type="number" placeholder="Unitario" style={iS} value={formData.valor_unitario} onChange={e => setFormData({ ...formData, valor_unitario: e.target.value })} required />
              <input type="number" placeholder="Cant." style={iS} value={formData.cantidad} onChange={e => setFormData({ ...formData, cantidad: e.target.value })} required />
              <input type="number" style={{...iS, backgroundColor: '#f1f5f9'}} value={formData.valor_total} readOnly />
            </div>
            <label style={lS}>ABONO ($)</label>
            <input type="number" style={iS} value={formData.abono} onChange={e => setFormData({ ...formData, abono: e.target.value })} />
            <textarea placeholder="Observación" style={{ ...iS, height: '60px' }} value={formData.observacion} onChange={e => setFormData({ ...formData, observacion: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ ...btn, backgroundColor: '#991b1b' }}> <Save size={18}/> Guardar</button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} style={{ ...btn, backgroundColor: '#64748b' }}>Cerrar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', minWidth: '1100px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fee2e2', color: '#991b1b', textAlign: 'left' }}>
              <th style={tH}>ACCIONES</th>
              <th style={tH}>FECHA</th>
              <th style={tH}>ID CLI</th>
              <th style={tH}>NOMBRE DE FANTASÍA</th>
              <th style={tH}>TOTAL</th>
              <th style={tH}>ABONO</th>
              <th style={tH}>SALDO</th>
              <th style={tH}>PAGADA</th>
              <th style={tH}>OBSERVACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(cr => (
              <tr key={cr.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                <td style={{...tD, display: 'flex', gap: '5px'}}>
                  <button onClick={() => handleEdit(cr)} style={actionBtn}> <Edit3 size={12}/> </button>
                  {cr.pagada && (
                    <button onClick={() => handleDelete(cr.id)} style={{...actionBtn, color: '#e11d48', borderColor: '#e11d48'}}> <Trash2 size={12}/> </button>
                  )}
                </td>
                <td style={tD}>{cr.fecha_deuda}</td>
                <td style={tD}>{cr.clientes?.id_cliente}</td>
                <td style={tD}><b>{cr.clientes?.nombre_fantasia}</b></td>
                <td style={tD}>${Number(cr.valor_total).toLocaleString('es-CL')}</td>
                <td style={tD}>${Number(cr.abono).toLocaleString('es-CL')}</td>
                <td style={{ ...tD, color: '#e11d48', fontWeight: 'bold' }}>
                  ${(cr.valor_total - cr.abono).toLocaleString('es-CL')}
                </td>
                <td style={tD}>{cr.pagada ? <CheckCircle size={16} color="green"/> : <XCircle size={16} color="red"/>}</td>
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
const btn = { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', cursor:'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const actionBtn = { cursor: 'pointer', border: '1px solid #991b1b', borderRadius: '4px', padding: '4px', color: '#991b1b', backgroundColor: 'transparent' };
const tH = { padding: '15px 10px' };
const tD = { padding: '12px 10px' };
const lS = { fontSize: '0.6rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '2px' };

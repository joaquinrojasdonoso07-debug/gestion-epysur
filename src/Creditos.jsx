import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle } from 'lucide-react';

export default function Creditos() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempAbonos, setTempAbonos] = useState([{ fecha: '', monto: '' }]);

  const initialForm = { cliente_id: '', fecha_deuda: '', productos_detalle: '', valor_total: '', pagada: false, observaciones: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data: cls } = await supabase.from('clientes').select('*').order('nombre_fantasia');
    const { data: deudas } = await supabase.from('creditos').select('*, clientes!cliente_id(*)').order('id', { ascending: false });
    setClientes(cls || []);
    setData(deudas || []);
  };

  useEffect(() => { fetchData(); }, []);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...initialForm, ...item });
    try {
      const hist = item.abono_historial ? JSON.parse(item.abono_historial) : [];
      setTempAbonos(hist.length > 0 ? hist : [{ fecha: item.fecha_deuda || '', monto: item.abono || '' }]);
    } catch (e) { setTempAbonos([{ fecha: '', monto: '' }]); }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este registro de crédito?")) {
      await supabase.from('creditos').delete().eq('id', id);
      fetchData();
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const totalAbonado = tempAbonos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    const payload = { 
      ...formData, 
      cliente_id: parseInt(formData.cliente_id), 
      abono: totalAbonado, 
      abono_historial: JSON.stringify(tempAbonos),
      fecha_deuda: formData.fecha_deuda || null
    };
    if (editingId) await supabase.from('creditos').update(payload).eq('id', editingId);
    else await supabase.from('creditos').insert([payload]);
    setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
  };

  const filtrados = data.filter(item => (item.clientes?.nombre_fantasia || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; border: 1.5pt solid black; }
        .app-table th, .app-table td { border: 1.5pt solid black; padding: 10px; vertical-align: top; }
        .app-table th { background: #991b1b; color: white; text-align: left; }
        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; }
          th { border: 2pt solid black !important; background: #e5e5e5 !important; color: black !important; text-align: center !important; }
          td { height: 2.85cm !important; border: 2pt solid black !important; font-size: 11pt !important; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempAbonos([{fecha: '', monto: ''}]); setShowForm(true);}} style={btnG}>NUEVO CRÉDITO</button>
        <button onClick={() => window.print()} style={btnS}>IMPRIMIR</button>
        <input type="text" placeholder="Buscar crédito..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#991b1b', marginBottom:'15px'}}>GESTIÓN CRÉDITO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lS}>Cliente</label>
              <select style={iS} value={formData.cliente_id} onChange={e=>setFormData({...formData, cliente_id: e.target.value})} required>
                <option value="">-- Seleccionar --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre_fantasia}</option>)}
              </select></div>
              <div><label style={lS}>Monto Total</label><input type="number" style={iS} value={formData.valor_total} onChange={e=>setFormData({...formData, valor_total: e.target.value})} required /></div>
              <div style={{background:'#f1f5f9', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}>
                <label style={lS}>Abonos</label>
                {tempAbonos.map((ab, idx) => (
                  <div key={idx} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                    <input type="date" style={{...iS, width:'auto'}} value={ab.fecha} onChange={e => {let n=[...tempAbonos]; n[idx].fecha=e.target.value; setTempAbonos(n);}} />
                    <input type="number" placeholder="$" style={{...iS, flex:1}} value={ab.monto} onChange={e => {let n=[...tempAbonos]; n[idx].monto=e.target.value; setTempAbonos(n);}} />
                    <button type="button" onClick={() => setTempAbonos(tempAbonos.filter((_,i)=>i!==idx))} style={{background:'none', border:'none'}}><XCircle color="red" size={20}/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempAbonos([...tempAbonos, {fecha: '', monto: ''}])} style={{fontSize:'0.8rem', color:'#1e40af', background:'none', border:'none', cursor:'pointer'}}>+ Agregar Pago</button>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}><input type="checkbox" checked={formData.pagada} onChange={e=>setFormData({...formData, pagada: e.target.checked})} /> <label>PAGADA</label></div>
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
              <th style={{width:'220px'}}>ABONOS</th>
              <th style={{width:'110px'}}>TOTAL</th>
              <th style={{width:'110px'}}>SALDO</th>
              <th style={{width:'200px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id}>
                <td className="no-print">
                   <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={()=>handleEdit(item)} style={smEdit}><Edit3 size={14}/></button>
                      <button onClick={()=>handleDelete(item.id)} style={smDel}><Trash2 size={14}/></button>
                   </div>
                </td>
                <td style={{fontWeight:'bold'}}>{item.clientes?.nombre_fantasia}</td>
                <td style={{padding:0}}>{JSON.parse(item.abono_historial || '[]').map((a,i)=><div key={i} style={{borderBottom:'1px solid black', padding:'4px'}}>{formatFechaChile(a.fecha)}: ${a.monto}</div>)}</td>
                <td>${item.valor_total}</td>
                <td style={{fontWeight:'bold', color:'red'}}>${item.valor_total - item.abono}</td>
                <td>{item.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'8px' };
const btnG = { padding:'12px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' };
const btnP = { padding:'15px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1, cursor:'pointer' };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

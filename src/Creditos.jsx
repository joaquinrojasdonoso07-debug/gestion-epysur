import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle } from 'lucide-react';

export default function Creditos() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filtroClienteForm, setFiltroClienteForm] = useState('');
  const [tempAbonos, setTempAbonos] = useState([{ fecha: new Date().toISOString().split('T')[0], monto: '' }]);

  const initialForm = { cliente_id: '', fecha_deuda: new Date().toISOString().split('T')[0], productos_detalle: '', valor_total: '', pagada: false, observaciones: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data: cls } = await supabase.from('clientes').select('*').order('nombre_fantasia');
    setClientes(cls || []);
    const { data: deudas } = await supabase.from('creditos').select('*, clientes!cliente_id(*)').order('id', { ascending: false });
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
    setFormData({
      cliente_id: item.cliente_id,
      fecha_deuda: item.fecha_deuda,
      productos_detalle: item.productos_detalle || '',
      valor_total: item.valor_total || '',
      pagada: item.pagada,
      observaciones: item.observaciones || ''
    });
    setTempAbonos(item.abono_historial ? JSON.parse(item.abono_historial) : [{ fecha: item.fecha_deuda, monto: item.abono || '' }]);
    setFiltroClienteForm('');
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const totalAbonado = tempAbonos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    const valorDeuda = Number(formData.valor_total || 0);

    if (totalAbonado > valorDeuda) {
      return alert(`¡Error! Los abonos ($${totalAbonado.toLocaleString()}) superan la deuda ($${valorDeuda.toLocaleString()}).`);
    }

    const payload = {
      cliente_id: parseInt(formData.cliente_id),
      fecha_deuda: formData.fecha_deuda,
      productos_detalle: formData.productos_detalle,
      valor_total: valorDeuda,
      abono: totalAbonado,
      abono_historial: JSON.stringify(tempAbonos),
      pagada: formData.pagada,
      observaciones: formData.observaciones
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
        .app-table { width: 100%; min-width: 3400px; border-collapse: collapse; border: 1px solid black; }
        .app-table th, .app-table td { border: 1px solid black; padding: 10px; vertical-align: top; }
        .app-table th { background: #991b1b; color: white; text-align: left; }
        .app-table td.col-acc { width: 80px !important; text-align: center; }
        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .only-print { display: table-cell !important; }
          .hide-on-print { display: none !important; }
          body { background: white !important; font-family: 'Arial', sans-serif !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; border-collapse: collapse !important; }
          th { border: 2pt solid black !important; padding: 5px !important; font-size: 11pt !important; background: #e5e5e5 !important; color: black !important; text-align: center !important; }
          td { border: 2pt solid black !important; padding: 8px 5px !important; font-size: 12pt !important; height: 2.85cm !important; vertical-align: top !important; word-wrap: break-word !important; white-space: normal !important; color: black !important; line-height: 1.1; }
          .abono-item-print { border-bottom: 1.5pt solid black; padding: 2px 0; }
          .abono-item-print:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempAbonos([{fecha: new Date().toISOString().split('T')[0], monto: ''}]); setShowForm(true);}} style={btnG}>NUEVO CRÉDITO</button>
          <button onClick={() => window.print()} style={btnS}><Printer size={20}/></button>
        </div>
        <input type="text" placeholder="Buscar crédito..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#991b1b', marginBottom: '20px'}}>GESTIÓN DE CRÉDITO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={lS}>Seleccionar Cliente</label>
              <input type="text" placeholder="Filtrar cliente..." style={iS} value={filtroClienteForm} onChange={e => setFiltroClienteForm(e.target.value)} />
              <select style={iS} value={formData.cliente_id} onChange={e=>setFormData({...formData, cliente_id: e.target.value})} required>
                <option value="">-- Seleccionar --</option>
                {clientes.filter(c => c.nombre_fantasia.toLowerCase().includes(filtroClienteForm.toLowerCase())).map(c => <option key={c.id} value={c.id}>{c.nombre_fantasia}</option>)}
              </select>

              <label style={lS}>Fecha y Monto</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input type="date" style={iS} value={formData.fecha_deuda} onChange={e=>setFormData({...formData, fecha_deuda: e.target.value})} />
                <input type="number" placeholder="Total Deuda $" style={iS} value={formData.valor_total} onChange={e=>setFormData({...formData, valor_total: e.target.value})} />
              </div>

              <label style={lS}>Detalle Productos</label>
              <textarea style={{...iS, height:'60px'}} value={formData.productos_detalle} onChange={e=>setFormData({...formData, productos_detalle: e.target.value})} />
              
              <div style={{background:'#f1f5f9', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                <label style={lS}>Historial de Abonos</label>
                {tempAbonos.map((ab, idx) => (
                  <div key={idx} style={{display:'flex', gap:'8px', marginBottom:'8px', alignItems:'center'}}>
                    <input type="date" style={iS} value={ab.fecha} onChange={e => {let n=[...tempAbonos]; n[idx].fecha=e.target.value; setTempAbonos(n);}} />
                    <input type="number" placeholder="$" style={iS} value={ab.monto} onChange={e => {let n=[...tempAbonos]; n[idx].monto=e.target.value; setTempAbonos(n);}} />
                    <button type="button" onClick={() => setTempAbonos(tempAbonos.filter((_,i)=>i!==idx))} style={{background:'none', border:'none', color:'#ef4444'}}><XCircle size={22} /></button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempAbonos([...tempAbonos, {fecha: new Date().toISOString().split('T')[0], monto: ''}])} style={{fontSize:'0.8rem', color:'#1e40af', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>+ Agregar Pago</button>
              </div>

              <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#f8fafc', borderRadius:'8px'}}>
                <input type="checkbox" id="pagada" checked={formData.pagada} onChange={e=>setFormData({...formData, pagada: e.target.checked})} style={{width: 20, height: 20}} />
                <label htmlFor="pagada" style={lS}>¿PAGADA TOTALMENTE?</label>
              </div>
              
              <label style={lS}>Observaciones</label>
              <textarea style={{...iS, height:'60px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'25px'}}>
              <button type="submit" style={btnP}>GUARDAR CAMBIOS</button>
              <button type="button" onClick={()=>setShowForm(false)} style={btnS}>CERRAR</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-area">
        <table className="app-table">
          <thead>
            <tr>
              <th className="no-print col-acc">ACC.</th>
              <th style={{width:'100px'}}>FECHA</th>
              <th style={{width:'180px'}}>FANTASÍA</th>
              <th className="only-print" style={{width:'220px'}}>UBICACIÓN / CONTACTO</th>
              <th style={{width:'220px'}}>ABONOS</th>
              <th style={{width:'110px'}}>TOTAL</th>
              <th style={{width:'110px'}}>SALDO</th>
              <th style={{width:'80px'}}>ESTADO</th>
              <th style={{width:'250px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => {
              const c = item.clientes || {};
              const abonos = item.abono_historial ? JSON.parse(item.abono_historial) : [];
              const saldo = (item.valor_total || 0) - (item.abono || 0);
              return (
                <tr key={item.id}>
                  <td className="no-print col-acc">
                    <div style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                      <button onClick={()=>handleEdit(item)} style={smEdit}><Edit3 size={14}/></button>
                      <button onClick={async ()=>{if(window.confirm('¿Eliminar?')){await supabase.from('creditos').delete().eq('id',item.id); fetchData();}}} style={smDel}><Trash2 size={14}/></button>
                    </div>
                  </td>
                  <td>{formatFechaChile(item.fecha_deuda)}</td>
                  <td style={{fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                  <td className="only-print">{c.direccion}<br/>{c.telefono}</td>
                  <td style={{padding:0}}>
                    {abonos.map((a, i) => (
                      <div key={i} className="abono-item-print" style={{padding:'4px 8px'}}>{formatFechaChile(a.fecha)}: <strong>${Number(a.monto).toLocaleString('es-CL')}</strong></div>
                    ))}
                  </td>
                  <td>${Number(item.valor_total).toLocaleString('es-CL')}</td>
                  <td style={{fontWeight:'bold', color: saldo > 0 ? 'red' : 'black'}}>${saldo.toLocaleString('es-CL')}</td>
                  <td>{item.pagada ? 'PAG' : 'PEN'}</td>
                  <td>{item.observaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #cbd5e1', borderRadius:'8px' };
const btnG = { padding:'12px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold' };
const btnP = { padding:'15px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1 };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'650px', alignSelf:'flex-start' };

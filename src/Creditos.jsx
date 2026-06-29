import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle, Search } from 'lucide-react';

export default function Creditos() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [catalogo, setCatalogo] = useState([]); // Almacena el catálogo de inventario para el buscador
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempAbonos, setTempAbonos] = useState([{ fecha: '', monto: '' }]);

  const [busquedaClienteForm, setBusquedaClienteForm] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mostrarSugerenciasInv, setMostrarSugerenciasInv] = useState(false); // Controla sugerencias de inventario
  const [busquedaInvTexto, setBusquedaInvTexto] = useState(''); // Texto que el usuario escribe para buscar productos

  const initialForm = { cliente_id: '', fecha_deuda: '', productos_detalle: '', valor_total: '', pagada: false, observaciones: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data: cls } = await supabase.from('clientes').select('*').order('nombre_fantasia');
    const { data: deudas } = await supabase.from('creditos').select('*, clientes!cliente_id(*)').order('id', { ascending: false });
    
    // Traer el inventario de Supabase ordenado
    const { data: inv } = await supabase.from('inventario').select('codigo, descripcion').order('descripcion', { ascending: true });
    
    setClientes(cls || []);
    setData(deudas || []);
    setCatalogo(inv || []);
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
    
    const clienteAsociado = clientes.find(c => c.id === item.cliente_id);
    setBusquedaClienteForm(clienteAsociado ? clienteAsociado.nombre_fantasia : '');
    
    try {
      const hist = item.abono_historial ? JSON.parse(item.abono_historial) : [];
      setTempAbonos(hist.length > 0 ? hist : [{ fecha: item.fecha_deuda || '', monto: item.abono || '' }]);
    } catch (e) { setTempAbonos([{ fecha: '', monto: '' }]); }
    setMostrarSugerenciasInv(false);
    setShowForm(true);
  };

  const handleDelete = async (id, pagada) => {
    if (!pagada) {
      alert("No se puede eliminar un crédito pendiente.");
      return;
    }
    if (window.confirm("¿Seguro que quieres borrar este registro de crédito?")) {
      await supabase.from('creditos').delete().eq('id', id);
      fetchData();
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id) {
      alert("Por favor, selecciona un cliente válido de la lista de sugerencias.");
      return;
    }

    const maximoPermitido = Number(formData.valor_total || 0);
    const totalAbonado = tempAbonos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    
    if (totalAbonado > maximoPermitido) {
      alert(`¡Error! La suma de los abonos ($${totalAbonado.toLocaleString('es-CL')}) supera el monto total de la deuda ($${maximoPermitido.toLocaleString('es-CL')}). Por favor, corrige los montos.`);
      return;
    }

    const estaPagadacompletamente = totalAbonado === maximoPermitido ? true : formData.pagada;
    
    const payload = { 
      cliente_id: parseInt(formData.cliente_id), 
      fecha_deuda: formData.fecha_deuda || null,
      productos_detalle: formData.productos_detalle || '',
      valor_total: maximoPermitido,
      abono: totalAbonado, 
      abono_historial: JSON.stringify(tempAbonos),
      pagada: Boolean(estaPagadacompletamente),
      observaciones: formData.observaciones || ''
    };

    delete payload.clientes;
    delete payload.id;

    if (editingId) {
      const { error } = await supabase.from('creditos').update(payload).eq('id', editingId);
      if (error) alert("Error al actualizar crédito: " + error.message);
    } else {
      const { error } = await supabase.from('creditos').insert([payload]);
      if (error) alert("Error al insertar nuevo crédito: " + error.message);
    }
    
    setShowForm(false); setEditingId(null); setFormData(initialForm); setBusquedaClienteForm(''); setBusquedaInvTexto(''); fetchData();
  };

  const sugerenciasClientes = clientes.filter(c => 
    c.nombre_fantasia.toLowerCase().includes(busquedaClienteForm.toLowerCase())
  );

  const sugerenciasInventario = catalogo.filter(p =>
    p.descripcion.toLowerCase().includes(busquedaInvTexto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busquedaInvTexto.toLowerCase())
  );

  const filtrados = data.filter(item => (item.clientes?.nombre_fantasia || '').toLowerCase().includes(search.toLowerCase()));

  // Añadir acumulativo sin el código SKU, guarda solo la descripción
  const agregarProductoSugerido = (prod) => {
    const textoActual = formData.productos_detalle ? formData.productos_detalle.trim() : '';
    const nuevoFormato = `${prod.descripcion}`;
    
    const textoFinal = textoActual ? `${textoActual}\n${nuevoFormato}` : nuevoFormato;
    
    setFormData({ ...formData, productos_detalle: textoFinal });
    setBusquedaInvTexto(''); 
    setMostrarSugerenciasInv(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 2200px; border-collapse: collapse; border: 1px solid black; table-layout: fixed; }
        .app-table th, .app-table td { border: 1.5pt solid black; padding: 10px; vertical-align: top; word-wrap: break-word; }
        .app-table th { background: #991b1b; color: white; text-align: left; }
        
        .sugerencias-container { position: relative; width: 100%; }
        .sugerencias-lista { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; max-height: 200px; overflow-y: auto; z-index: 200; list-style: none; padding: 0; margin: 0; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .sugerencia-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 0.9rem; text-align: left; }
        .sugerencia-item:hover { background: #f1f5f9; }

        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; }
          th { border: 2pt solid black !important; background: #e5e5e5 !important; color: black !important; text-align: center !important; }
          td { height: 2.85cm !important; border: 2pt solid black !important; font-size: 11pt !important; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setBusquedaClienteForm(''); setBusquedaInvTexto(''); setTempAbonos([{fecha: '', monto: ''}]); setMostrarSugerenciasInv(false); setShowForm(true);}} style={btnG}>NUEVO CRÉDITO</button>
          <button onClick={() => window.print()} style={btnS}>IMPRIMIR</button>
        </div>
        <input type="text" placeholder="Buscar crédito..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#991b1b', marginBottom:'15px'}}>GESTIÓN CRÉDITO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div className="sugerencias-container">
                <label style={lS}>Escribir Nombre del Cliente</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    style={iS} 
                    placeholder="Empieza a escribir para buscar..." 
                    value={busquedaClienteForm}
                    onChange={e => {
                      setBusquedaClienteForm(e.target.value);
                      setMostrarSugerencias(true);
                      if(!e.target.value) setFormData({...formData, cliente_id: ''});
                    }}
                    onFocus={() => setMostrarSugerencias(true)}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '12px', color: '#94a3b8' }} />
                </div>
                
                {mostrarSugerencias && busquedaClienteForm && (
                  <ul className="sugerencias-lista">
                    {sugerenciasClientes.length > 0 ? (
                      sugerenciasClientes.map(c => (
                        <li 
                          key={c.id} 
                          className="sugerencia-item"
                          onClick={() => {
                            setFormData({ ...formData, cliente_id: c.id });
                            setBusquedaClienteForm(c.nombre_fantasia);
                            setMostrarSugerencias(false);
                          }}
                        >
                          {c.nombre_fantasia} <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({c.responsable || 'Sin contacto'})</span>
                        </li>
                      ))
                    ) : (
                      <li className="sugerencia-item" style={{ color: '#ef4444', cursor: 'default' }}>No se encontraron clientes</li>
                    )}
                  </ul>
                )}
              </div>

              <div><label style={lS}>Fecha Deuda (Opcional)</label><input type="date" style={iS} value={formData.fecha_deuda || ''} onChange={e=>setFormData({...formData, fecha_deuda: e.target.value})} /></div>
              
              <div className="sugerencias-container">
                <label style={lS}>Buscar y Añadir Productos del Inventario</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Busca por código o nombre para sumarlo..." 
                    style={iS} 
                    value={busquedaInvTexto} 
                    onChange={e => {
                      setBusquedaInvTexto(e.target.value);
                      setMostrarSugerenciasInv(e.target.value.length > 0);
                    }}
                    onFocus={() => { if (busquedaInvTexto) setMostrarSugerenciasInv(true); }}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '12px', color: '#94a3b8' }} />
                </div>
                
                {mostrarSugerenciasInv && busquedaInvTexto && (
                  <ul className="sugerencias-lista" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', zIndex: 250 }}>
                    {sugerenciasInventario.length > 0 ? (
                      sugerenciasInventario.map((prod, idx) => (
                        <li 
                          key={idx} 
                          className="sugerencia-item"
                          onClick={() => agregarProductoSugerido(prod)}
                        >
                          <strong>[{prod.codigo}]</strong> {prod.descripcion}
                        </li>
                      ))
                    ) : (
                      <li className="sugerencia-item" style={{ color: '#64748b', cursor: 'default' }}>No se encontraron coincidencias</li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label style={lS}>Detalle de Productos / Servicios Seleccionados (*)</label>
                <textarea 
                  style={{...iS, height:'90px', resize:'vertical', fontFamily:'inherit'}} 
                  placeholder="Aquí aparecerán los productos seleccionados..."
                  value={formData.productos_detalle || ''} 
                  onChange={e=>setFormData({...formData, productos_detalle: e.target.value})}
                  required
                />
              </div>

              <div><label style={lS}>Monto Total</label><input type="number" style={iS} value={formData.valor_total || ''} onChange={e=>setFormData({...formData, valor_total: e.target.value})} required /></div>
              
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
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}><input type="checkbox" checked={formData.pagada || false} onChange={e=>setFormData({...formData, pagada: e.target.checked})} /> <label>PAGADA</label></div>
              <div><label style={lS}>Observaciones</label><textarea style={{...iS, height:'50px'}} value={formData.observaciones || ''} onChange={e=>setFormData({...formData, observaciones: e.target.value})} /></div>
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button type="submit" style={btnP}>GUARDAR</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnS}>CERRAR</button>
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
              <th className="no-print" style={{width:'140px'}}>FECHA INICIO</th>
              <th className="no-print" style={{width:'300px'}}>DETALLE PRODUCTOS</th>
              <th style={{width:'220px'}}>ABONOS</th>
              <th style={{width:'110px'}}>TOTAL</th>
              <th style={{width:'110px'}}>SALDO</th>
              <th className="no-print" style={{width:'120px'}}>ESTADO</th>
              <th style={{width:'250px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id}>
                <td className="no-print">
                   <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={()=>handleEdit(item)} style={smEdit}><Edit3 size={14}/></button>
                      <button 
                        onClick={()=>handleDelete(item.id, item.pagada)} 
                        disabled={!item.pagada}
                        style={{
                          ...smDel,
                          background: item.pagada ? '#ef4444' : '#cbd5e1',
                          cursor: item.pagada ? 'pointer' : 'not-allowed',
                          opacity: item.pagada ? 1 : 0.6
                        }}
                        title={item.pagada ? "Eliminar crédito" : "No se puede eliminar un crédito pendiente"}
                      >
                        <Trash2 size={14}/>
                      </button>
                   </div>
                </td>
                <td style={{fontWeight:'bold'}}>{item.clientes?.nombre_fantasia}</td>
                <td className="no-print">{formatFechaChile(item.fecha_deuda)}</td>
                <td className="no-print" style={{whiteSpace:'pre-wrap'}}>{item.productos_detalle}</td>
                <td style={{padding:0}}>{JSON.parse(item.abono_historial || '[]').map((a,i)=><div key={i} style={{borderBottom:'1px solid black', padding:'4px'}}>{formatFechaChile(a.fecha)}: ${a.monto}</div>)}</td>
                <td>${item.valor_total}</td>
                <td style={{fontWeight:'bold', color: item.valor_total - item.abono > 0 ? 'red' : 'green'}}>${item.valor_total - item.abono}</td>
                <td className="no-print" style={{fontWeight:'bold', color: item.pagada ? 'green' : 'orange'}}>{item.pagada ? 'PAGADA' : 'PENDIENTE'}</td>
                <td>{item.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'8px', backgroundColor:'white', boxSizing:'border-box' };
const btnG = { padding:'12px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' };
const btnP = { padding:'15px', background:'#991b1b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1, cursor:'pointer' };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

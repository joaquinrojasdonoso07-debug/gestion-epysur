import React, { useState, useEffect } from 'react';
import logoImg from './logo.png';

export default function Cotizador() {
  const [numCotizacion, setNumCotizacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [atencion, setAtencion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [validez, setValidez] = useState('15 días');

  const [items, setItems] = useState([
    { id: Date.now(), descripcion: '', cantidad: 1, precio: 0 }
  ]);

  const [totales, setTotales] = useState({ neto: 0, iva: 0, total: 0 });

  // CONTADOR AUTOMÁTICO PERSISTENTE
  useEffect(() => {
    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0];
    setFecha(hoyString);

    const anioActual = hoy.getFullYear();
    
    // Intentamos recuperar el último número correlativo guardado en el navegador
    let ultimoCorrelativo = localStorage.getItem('epysur_correlativo_cotizacion');
    let nuevoCorrelativo = 1;

    if (ultimoCorrelativo) {
      nuevoCorrelativo = parseInt(ultimoCorrelativo, 10) + 1;
    } else {
      // Si es la primera vez que se usa el sistema, lo inicializamos en 1
      localStorage.setItem('epysur_correlativo_cotizacion', '1');
    }

    // Formateamos el número para que siempre tenga 3 dígitos (ej: 001, 012, 105)
    const numeroFormateado = String(nuevoCorrelativo).padStart(3, '0');
    setNumCotizacion(`${anioActual}-${numeroFormateado}`);
  }, []);

  useEffect(() => {
    let netoAcumulado = 0;
    items.forEach(item => {
      const q = parseFloat(item.cantidad) || 0;
      const p = parseFloat(item.precio) || 0;
      netoAcumulado += Math.round(q * p);
    });
    const ivaTotal = Math.round(netoAcumulado * 0.19);
    setTotales({
      neto: netoAcumulado,
      iva: ivaTotal,
      total: netoAcumulado + ivaTotal
    });
  }, [items]);

  const handleRut = (e) => {
    let valor = e.target.value.replace(/\./g, '').replace(/-/g, '');
    if (valor.length < 2) {
      setRut(valor);
      return;
    }
    let cuerpo = valor.slice(0, -1).slice(0, 8);
    let dv = valor.slice(-1).toUpperCase();
    const rutFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
    setRut(rutFormateado);
  };

  const handleTelefono = (e) => {
    let num = e.target.value.replace(/\D/g, '');
    if (num.startsWith('56')) num = num.slice(2);
    if (num.length > 9) num = num.slice(0, 9);
    if (num.length > 0) {
      let formatted = "+56 ";
      if (num.length > 0) formatted += num.substring(0, 1) + " ";
      if (num.length > 1) formatted += num.substring(1, 5) + " ";
      if (num.length > 5) formatted += num.substring(5, 9);
      setTelefono(formatted.trim());
    } else {
      setTelefono('');
    }
  };

  const agregarFila = () => {
    setItems([...items, { id: Date.now(), descripcion: '', cantidad: 1, precio: 0 }]);
  };

  const eliminarFila = (id) => {
    if (items.length === 1) {
      setItems([{ id: Date.now(), descripcion: '', cantidad: 1, precio: 0 }]);
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, campo, valor) => {
    setItems(items.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  // Función al presionar el botón de impresión que incrementa el contador de manera definitiva
  const ejecutarImpresion = () => {
    window.print();
    
    // Una vez mandado a imprimir o guardado en PDF, guardamos el correlativo actual como usado
    const correlativoActual = numCotizacion.split('-')[1];
    localStorage.setItem('epysur_correlativo_cotizacion', parseInt(correlativoActual, 10).toString());
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px 0', minHeight: '100vh', boxSizing: 'border-box' }} className="cotizador-contenedor-padre">
      <style>{`
        @page { 
          size: letter portrait; 
          margin: 0.5in; 
        }
        
        .page {
          width: 8.5in;
          min-height: 11in;
          background: white;
          padding: 0.4in;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        .header-table-cot {
          display: table !important;
          width: 100% !important;
          border-bottom: 3px solid #A61F1F;
          padding-bottom: 10pt;
          margin-bottom: 15pt;
        }
        
        .header-row-cot { display: table-row !important; }
        .header-left-cell-cot { display: table-cell !important; width: 60% !important; vertical-align: bottom !important; }
        .header-right-cell-cot { display: table-cell !important; width: 40% !important; text-align: right !important; vertical-align: bottom !important; }
        
        .input-group-cot { margin-bottom: 8pt; }
        .input-group-cot label { display: block; font-size: 8pt; font-weight: bold; color: #555; text-transform: uppercase; margin-bottom: 2pt; }
        .input-group-cot input, .input-group-cot textarea {
          width: 100%; border: 1px solid #cbd5e1; background: #fcfcfc; padding: 5pt; font-size: 9.5pt; border-radius: 4px; box-sizing: border-box; font-family: inherit;
        }
        .obs-textarea-cot { resize: none; height: 45pt; line-height: 1.3; overflow: hidden; display: block; border: 1px solid #cbd5e1; }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type=number] {
          -moz-appearance: textfield !important;
        }
        
        .info-table-cot {
          display: table !important;
          width: 100% !important;
          margin-bottom: 10pt;
          table-layout: fixed !important;
        }
        
        .info-row-cot { display: table-row !important; }
        .info-cell-cot { display: table-cell !important; width: 48% !important; padding-right: 10pt; vertical-align: top !important; }
        .info-cell-cot:last-child { padding-right: 0 !important; padding-left: 10pt; }
        
        .table-responsive-cot { width: 100%; margin-top: 10pt; }
        .tabla-items-cot { width: 100%; border-collapse: collapse; }
        .tabla-items-cot th { background: #A61F1F; color: white; padding: 8pt; font-size: 9pt; text-align: left; border: 1px solid #A61F1F; }
        .tabla-items-cot td { padding: 6pt 8pt; border-bottom: 1px solid #e2e8f0; }
        .btn-delete-cot { background: #ef4444; color: white; border: none; padding: 4pt 7pt; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 9pt; }
        
        .summary-cot { 
          margin-left: auto !important; 
          width: 220pt !important; 
          margin-top: 15pt; 
          background: #f8fafc; 
          padding: 10pt; 
          border-radius: 6px; 
          border: 1px solid #e2e8f0; 
        }
        .summary-row-cot { display: flex; justify-content: space-between; padding: 4pt 0; font-size: 9.5pt; color: #334155; }
        .total-row-cot { border-top: 2px solid #A61F1F; color: #A61F1F; font-weight: bold; font-size: 14pt; padding-top: 6pt; }
        
        .condiciones-stack-cot { margin-top: 15pt; border-top: 1px solid #e2e8f0; padding-top: 12pt; display: flex; flex-direction: column; gap: 5pt; }
        
        .app-controls-cot { position: fixed; bottom: 15pt; width: 100%; display: flex; justify-content: center; z-index: 100; left: 0; }
        .btn-print-cot { background: #A61F1F; color: white; padding: 12pt 35pt; border: none; border-radius: 50pt; font-weight: bold; cursor: pointer; box-shadow: 0 4pt 15pt rgba(0,0,0,0.3); }

        @media print {
          nav.no-print, .no-print { display: none !important; }
          .cotizador-contenedor-padre { background: white !important; padding: 0 !important; margin: 0 !important; }
          body { background: white; color: black; }
          
          .page { 
            box-shadow: none !important; 
            width: 7.5in !important; 
            max-width: 7.5in !important;
            min-height: 10in !important;
            padding: 0 !important; 
            margin: 0 !important; 
          }
          
          .app-controls-cot, .btn-add-cot, .btn-delete-cot { display: none !important; }
          
          .input-group-cot { 
            margin-bottom: 6pt !important; 
            border: none !important;
            background: transparent !important;
          }
          .input-group-cot label {
            font-size: 8pt !important;
            color: #475569 !important;
            display: inline-block !important;
            width: 140pt !important;
          }
          .input-group-cot input, .input-group-cot textarea { 
            display: inline-block !important;
            width: calc(100% - 145pt) !important;
            border: none !important; 
            background: transparent !important; 
            padding: 0 !important; 
            font-size: 10pt !important;
            font-weight: 600 !important;
            color: black !important;
          }
          
          .header-right-cell-cot .input-group-cot label { width: auto !important; margin-right: 5pt; }
          .header-right-cell-cot .input-group-cot input { width: 90pt !important; text-align: right !important; }

          .obs-textarea-cot { height: auto !important; max-height: 52pt; border: none !important; }
          .tabla-items-cot input { border: none !important; background: transparent !important; color: black !important; }
          
          .tabla-items-cot {
            border-top: 2px solid black !important;
            border-bottom: 2px solid black !important;
          }
          .tabla-items-cot th { 
            background: transparent !important; 
            color: black !important; 
            border: none !important;
            border-bottom: 1px solid black !important;
            font-weight: bold !important;
            padding: 6pt 4pt !important;
          }
          .tabla-items-cot td { 
            border: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 6pt 4pt !important;
          }
          
          .summary-cot { 
            border: none !important;
            border-top: 1.5px solid black !important; 
            background: transparent !important;
            border-radius: 0 !important;
            padding: 6pt 0 !important;
          }
          .total-row-cot { 
            border-top: 1.5px solid black !important; 
            color: black !important; 
            font-size: 13pt !important;
          }
          .condiciones-stack-cot { 
            border-top: 1.5px solid black !important; 
            margin-top: 20pt !important;
            padding-top: 10pt !important;
          }
          .condiciones-stack-cot .input-group-cot label {
            width: 150pt !important;
          }
          .condiciones-stack-cot .input-group-cot input, 
          .condiciones-stack-cot .input-group-cot textarea {
            width: calc(100% - 155pt) !important;
          }

          .header-table-cot, .info-table-cot { display: table !important; width: 100% !important; }
          .header-row-cot, .info-row-cot { display: table-row !important; }
          .header-left-cell-cot { display: table-cell !important; width: 60% !important; }
          .header-right-cell-cot { display: table-cell !important; width: 40% !important; text-align: right !important; }
          .info-cell-cot { display: table-cell !important; width: 50% !important; }
          
          .tabla-items-cot tr { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <div className="page">
        {/* ENCABEZADO */}
        <div className="header-table-cot">
          <div className="header-row-cot">
            <div className="header-left-cell-cot">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10pt' }}>
                <img src={logoImg} alt="Logo" style={{ height: '55pt', width: 'auto', display: 'block' }} />
                <div>
                  <h1 style={{ color: '#A61F1F', margin: 0, fontSize: '20pt', fontWeight: 900 }}>EPYSUR</h1>
                  <p style={{ margin: 0, fontSize: '8pt', letterSpacing: '1px', color: '#64748b', fontWeight: 'bold' }}>SOLUCIONES PARA TU HOGAR</p>
                </div>
              </div>
            </div>
            <div className="header-right-cell-cot">
              <div className="input-group-cot" style={{ display: 'inline-block', textAlign: 'right' }}>
                <label style={{ color: '#A61F1F', fontWeight: '900' }}>ORDEN DE PEDIDO N°</label>
                <input 
                  type="text" 
                  placeholder="Generando..." 
                  style={{ textAlign: 'right', width: '140px', fontWeight: 'bold', color: '#A61F1F' }}
                  value={numCotizacion}
                  readOnly // Campo automático no modificable para evitar errores humanos
                />
              </div>
            </div>
          </div>
        </div>

        {/* UBICACIÓN 1: TELÉFONO Y FECHA */}
        <div className="info-table-cot">
          <div className="info-row-cot">
            <div className="info-cell-cot">
              <div className="input-group-cot">
                <label>Teléfono de Contacto:</label>
                <input type="text" placeholder="+56 9 1234 5678" value={telefono} onChange={handleTelefono} />
              </div>
            </div>
            <div className="info-cell-cot">
              <div className="input-group-cot">
                <label>Fecha de Emisión:</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* UBICACIÓN 2: DATOS DEL CLIENTE */}
        <div className="info-table-cot">
          <div className="info-row-cot">
            <div className="info-cell-cot">
              <div className="input-group-cot">
                <label>Nombre / Razón Social:</label>
                <input type="text" placeholder="Nombre del cliente" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div className="input-group-cot">
                <label>RUT Cliente:</label>
                <input type="text" placeholder="12.345.678-9" value={rut} onChange={handleRut} />
              </div>
              <div className="input-group-cot">
                <label>Atención a:</label>
                <input type="text" placeholder="Sr(a). Juan Pérez" value={atencion} onChange={e => setAtencion(e.target.value)} />
              </div>
            </div>
            
            <div className="info-cell-cot">
              <div className="input-group-cot">
                <label>Dirección de Servicio:</label>
                <input type="text" placeholder="Calle, número, depto" value={direccion} onChange={e => setDireccion(e.target.value)} />
              </div>
              <div className="input-group-cot">
                <label>Comuna:</label>
                <input type="text" placeholder="Ej: Temuco" value={comuna} onChange={e => setComuna(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="table-responsive-cot">
          <table className="tabla-items-cot">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Descripción del Producto / Servicio</th>
                <th style={{ textAlign: 'center', width: '10%' }}>Cant.</th>
                <th style={{ textAlign: 'right', width: '15%' }}>Neto Unit.</th>
                <th style={{ textAlign: 'right', width: '15%' }}>Total</th>
                <th className="no-print" style={{ textAlign: 'center', width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <input 
                      type="text" 
                      placeholder="Descripción..." 
                      style={{ border: 'none', width: '100%', background: 'transparent' }}
                      value={item.descripcion}
                      onChange={e => handleItemChange(item.id, 'descripcion', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      style={{ textAlign: 'center', width: '100%', background: 'transparent', border: 'none' }}
                      value={item.cantidad}
                      onChange={e => handleItemChange(item.id, 'cantidad', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      style={{ textAlign: 'right', width: '100%', background: 'transparent', border: 'none' }}
                      value={item.precio}
                      onChange={e => handleItemChange(item.id, 'precio', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ${Math.round((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio) || 0)).toLocaleString('es-CL')}
                  </td>
                  <td className="no-print" style={{ textAlign: 'center' }}>
                    <button type="button" className="btn-delete-cot" onClick={() => eliminarFila(item.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button 
          type="button" 
          className="btn-add-cot" 
          onClick={agregarFila}
          style={{ width: '100%', marginTop: '10pt', background: '#f1f5f9', border: '1px dashed #cbd5e1', padding: '10pt', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}
        >
          + AGREGAR ITEM
        </button>

        {/* TOTALES */}
        <div className="summary-cot">
          <div className="summary-row-cot"><span>Subtotal Neto:</span><span>${totales.neto.toLocaleString('es-CL')}</span></div>
          <div className="summary-row-cot"><span>IVA (19%):</span><span>${totales.iva.toLocaleString('es-CL')}</span></div>
          <div className="summary-row-cot total-row-cot"><span>TOTAL COMPRA:</span><span>${totales.total.toLocaleString('es-CL')}</span></div>
        </div>

        {/* CONDICIONES COMERCIALES */}
        <div className="condiciones-stack-cot">
          <div className="input-group-cot">
            <label>Condición de Pago:</label>
            <input type="text" placeholder="Transferencia Bancaria" value={formaPago} onChange={e => setFormaPago(e.target.value)} />
          </div>
          <div className="input-group-cot">
            <label>Observaciones de Despacho:</label>
            <textarea 
              className="obs-textarea-cot" 
              maxLength={200} 
              placeholder="Detalles adicionales (máximo 200 caracteres)"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            ></textarea>
          </div>
          <div className="input-group-cot">
            <label>Validez del Presupuesto:</label>
            <input type="text" placeholder="15 días" style={{ fontWeight: 'bold' }} value={validez} onChange={e => setValidez(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="app-controls-cot">
        <button type="button" className="btn-print-cot" onClick={ejecutarImpresion}>DESCARGAR PDF / IMPRIMIR</button>
      </div>
    </div>
  );
}

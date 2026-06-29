import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, Box } from 'lucide-react';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario para nuevo producto (Código automático y Descripción pura)
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    obtenerInventario();
  }, []);

  const obtenerInventario = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventario')
        .select('id, codigo, descripcion')
        .order('codigo', { ascending: true });

      if (error) throw error;
      
      const listaProductos = data || [];
      setProductos(listaProductos);

      // GENERACIÓN AUTOMÁTICA DEL SIGUIENTE CÓDIGO CORRELATIVO
      let maxNumero = 0;
      listaProductos.forEach(p => {
        if (p.codigo && p.codigo.startsWith('EPY-')) {
          const numParte = p.codigo.replace('EPY-', '');
          const numero = parseInt(numParte, 10);
          if (!isNaN(numero) && numero > maxNumero) {
            maxNumero = numero;
          }
        }
      });
      
      const siguienteNumero = String(maxNumero + 1).padStart(3, '0');
      setCodigo(`EPY-${siguienteNumero}`);

    } catch (error) {
      alert('Error cargando inventario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !descripcion) {
      alert('Por favor rellena la descripción del producto o servicio');
      return;
    }

    try {
      const { error } = await supabase
        .from('inventario')
        .insert([{
          codigo: codigo.toUpperCase().trim(),
          descripcion: descripcion.trim()
        }]);

      if (error) throw error;

      setDescripcion('');
      obtenerInventario();
      alert('Ítem agregado al catálogo con código automático');
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este servicio del catálogo?')) return;

    try {
      const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id', id);

      if (error) throw error;
      obtenerInventario();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#1e40af', borderBottom: '2px solid #1e40af', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box size={24} /> CATÁLOGO DE PRODUCTOS Y SERVICIOS
      </h2>

      {/* FORMULARIO DE INGRESO SIMPLIFICADO */}
      <form onSubmit={handlesubmit} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={lS}>CÓDIGO AUTOMÁTICO</label>
          <input 
            type="text" 
            style={{ ...iS, backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e40af' }} 
            value={codigo} 
            readOnly 
            placeholder="Generando..."
          />
        </div>
        <div style={{ flex: '3', minWidth: '350px' }}>
          <label style={lS}>DESCRIPCIÓN DEL PRODUCTO O SERVICIO</label>
          <input type="text" placeholder="Nombre descriptivo oficial" style={iS} value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        </div>
        <button type="submit" style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', height: '42px' }}>
          <Plus size={18} /> AGREGAR ÍTEM
        </button>
      </form>

      {/* TABLA DE VISUALIZACIÓN LIMPIA */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando catálogo...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ ...tH, width: '20%' }}>CÓDIGO</th>
                <th style={{ ...tH, width: '70%' }}>DESCRIPCIÓN</th>
                <th style={{ ...tH, width: '10%', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay elementos registrados.</td>
                </tr>
              ) : (
                productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ ...tD, fontWeight: 'bold', color: '#1e40af' }}>{p.codigo}</td>
                    <td style={tD}>{p.descripcion}</td>
                    <td style={{ ...tD, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={() => eliminarProducto(p.id)} style={actionBtnS} title="Eliminar del catálogo">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const lS = { fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' };
const iS = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', fontSize: '10pt' };
const tH = { padding: '12px 15px', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' };
const tD = { padding: '12px 15px', fontSize: '10pt', color: '#334155' };
const actionBtnS = { border: 'none', backgroundColor: '#ef4444', color: 'white', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

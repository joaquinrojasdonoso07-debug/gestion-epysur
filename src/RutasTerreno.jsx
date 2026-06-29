import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Car, MapPin, Search, Navigation } from 'lucide-react';

export default function RutasTerreno() {
  const [clientes, setClientes] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [comunaSeleccionada, setComunaSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarClientesTerreno();
  }, []);

  const cargarClientesTerreno = async () => {
    try {
      setLoading(true);
      // Traemos los clientes que tengan asignada una dirección y comuna
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre_fantasia, direccion, comuna, telefono, responsable')
        .not('direccion', 'is', null)
        .not('comuna', 'is', null);

      if (error) throw error;

      setClientes(data || []);

      // Extraer una lista única de comunas existentes en tu base de datos para el filtro
      const listaComunas = data ? [...new Set(data.map(c => c.comuna.trim()))].sort() : [];
      setComunas(listaComunas);
    } catch (error) {
      alert('Error cargando datos de terreno: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar los clientes basándose estrictamente en la comuna seleccionada
  const clientesEnRuta = clientes.filter(c => 
    c.comuna.toLowerCase().trim() === comunaSeleccionada.toLowerCase().trim()
  );

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12pt' }}>
        <Navigation size={20} /> PLANIFICADOR DE RUTAS EN TERRENO (VISITAS Y DESPACHOS)
      </h3>

      {/* FILTRO SELECTOR POR COMUNA */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
          1. SELECCIONAR COMUNA PARA ARMAR LA RUTA
        </label>
        <select 
          style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'white', fontSize: '10pt', fontWeight: '500' }}
          value={comunaSeleccionada}
          onChange={e => setComunaSeleccionada(e.target.value)}
        >
          <option value="">-- Elige una comuna para ver su hoja de ruta --</option>
          {comunas.map((com, idx) => (
            <option key={idx} value={com}>{com.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '10pt' }}>Cargando ubicaciones...</p>
      ) : (
        <div>
          {!comunaSeleccionada ? (
            <p style={{ color: '#94a3b8', fontSize: '10pt', margin: 0, fontStyle: 'italic' }}>
              Por favor, selecciona una comuna arriba para filtrar los clientes y trazar las rutas en Waze.
            </p>
          ) : clientesEnRuta.length === 0 ? (
            <p style={{ color: '#ef4444', fontSize: '10pt', margin: 0 }}>
              No hay clientes registrados con direcciones en la comuna seleccionada.
            </p>
          ) : (
            <div>
              <p style={{ color: '#1e40af', fontSize: '9.5pt', fontWeight: 'bold', marginBottom: '12px' }}>
                🚙 Se encontraron {clientesEnRuta.length} puntos de visita en la comuna de {comunaSeleccionada.toUpperCase()}:
              </p>
              
              {/* GRID DE TARJETAS EXCLUSIVAS DE TERRENO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {clientesEnRuta.map(c => {
                  const direccionDestino = `${c.direccion} ${c.comuna} Chile`.trim();
                  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(direccionDestino)}&navigate=yes`;

                  return (
                    <div key={c.id} style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '11pt', color: '#1e293b', fontWeight: 'bold' }}>
                          {c.nombre_fantasia}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '9.5pt', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                          <MapPin size={14} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                          <span>{c.direccion}</span>
                        </p>
                        {c.responsable && (
                          <span style={{ fontSize: '8pt', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                            Vendedor: {c.responsable}
                          </span>
                        )}
                      </div>

                      {/* ACCIÓN DE NAVEGACIÓN DIRECTA */}
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                        <a 
                          href={wazeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            backgroundColor: '#33ccff', color: 'black', textDecoration: 'none',
                            padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '9.5pt',
                            boxShadow: '0 2px 4px rgba(51,204,255,0.2)'
                          }}
                        >
                          <Car size={16} /> INICIAR RUTA EN WAZE
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

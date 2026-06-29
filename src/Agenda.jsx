import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Phone, Calendar, Clock, AlertCircle, CheckCircle, Search, MessageSquare } from 'lucide-react';

export default function Agenda() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fechas clave para los filtros de tiempo
  const hoyString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchLlamadas();
  }, []);

  const fetchData = async () => {
    // Helper para recargar datos de forma limpia
    await fetchLlamadas();
  };

  const fetchLlamadas = async () => {
    try {
      setLoading(true);
      // Traemos los clientes que tengan agendada una próxima llamada
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre_fantasia, responsable, telefono, proximo_contacto, ultimo_contacto, observaciones')
        .not('proximo_contacto', 'is', null)
        .order('proximo_contacto', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      alert('Error cargando la agenda: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Marcar una llamada como realizada (mueve la fecha actual al último contacto y despeja la próxima llamada)
  const marcarComoHecho = async (cliente) => {
    if (!window.confirm(`¿Confirmas que realizaste el contacto con ${cliente.nombre_fantasia}?`)) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          ultimo_contacto: hoyString,
          proximo_contacto: null // Queda libre hasta que se agende otra en la cartera
        })
        .eq('id', cliente.id);

      if (error) throw error;
      alert('Contacto registrado con éxito.');
      fetchLlamadas();
    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    }
  };

  // Filtrado por buscador general (Nombre o Responsable)
  const filtrados = clientes.filter(c => 
    (c.nombre_fantasia || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.responsable || '').toLowerCase().includes(search.toLowerCase())
  );

  // Clasificación de llamadas basadas en la fecha actual
  const atrasadas = filtrados.filter(c => c.proximo_contacto < hoyString);
  const paraHoy = filtrados.filter(c => c.proximo_contacto === hoyString);
  const futuras = filtrados.filter(c => c.proximo_contacto > hoyString);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [year, month, day] = f.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      <h2 style={{ color: '#1e40af', borderBottom: '2px solid #1e40af', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Calendar size={24} /> AGENDA Y SEGUIMIENTO DE LLAMADAS
      </h2>

      {/* FILTRO DE BÚSQUEDA */}
      <div style={{ marginBottom: '20px', position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '400px' }}>
        <input 
          type="text" 
          placeholder="Buscar por cliente o vendedor..." 
          style={iS} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <Search size={18} style={{ position: 'absolute', right: '12px', color: '#94a3b8' }} />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '4px' }}>Cargando agenda de contactos...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* 1. SECCIÓN: CONTACTOS ATRASADOS */}
          {atrasadas.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '15px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11pt' }}>
                <AlertCircle size={18} /> LLAMADAS PENDIENTES (ATRASADAS)
              </h3>
              <div style={gridS}>
                {atrasadas.map(c => <TarjetaCliente key={c.id} c={c} colorHeader="#ef4444" onCheck={() => marcarComoHecho(c)} formatFecha={formatFechaChile} />)}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN: PARA HOY */}
          <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', padding: '15px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11pt' }}>
              <Clock size={18} /> HOY — CONTACTOS PROGRAMADOS
            </h3>
            {paraHoy.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '10pt', margin: 0 }}>No tienes llamadas programadas para el día de hoy.</p>
            ) : (
              <div style={gridS}>
                {paraHoy.map(c => <TarjetaCliente key={c.id} c={c} colorHeader="#3b82f6" onCheck={() => marcarComoHecho(c)} formatFecha={formatFechaChile} />)}
              </div>
            )}
          </div>

          {/* 3. SECCIÓN: PRÓXIMAS LLAMADAS */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11pt' }}>
              <Calendar size={18} /> PRÓXIMOS DÍAS
            </h3>
            {futuras.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '10pt', margin: 0 }}>No hay llamadas agendadas para las siguientes fechas.</p>
            ) : (
              <div style={gridS}>
                {futuras.map(c => <TarjetaCliente key={c.id} c={c} colorHeader="#64748b" onCheck={() => marcarComoHecho(c)} formatFecha={formatFechaChile} />)}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Sub-componente de Tarjeta para ordenar visualmente cada cliente
function TarjetaCliente({ c, colorHeader, onCheck, formatFecha }) {
  // Limpieza del número para enlace de WhatsApp
  const numLimpio = c.telefono ? c.telefono.replace(/\s+/g, '').replace('+', '') : '';

  return (
    <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ backgroundColor: colorHeader, padding: '8px 12px', color: 'white', fontWeight: 'bold', fontSize: '9.5pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formatFecha(c.proximo_contacto)}</span>
        <span style={{ fontSize: '8pt', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{c.responsable || 'Sin asignación'}</span>
      </div>
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '11pt', color: '#1e293b' }}>{c.nombre_fantasia}</h4>
        
        {c.telefono ? (
          <p style={{ margin: 0, fontSize: '9.5pt', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Phone size={14} style={{ color: '#1e40af' }} /> {c.telefono}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '9.5pt', color: '#94a3b8', fontStyle: 'italic' }}>Sin teléfono registrado</p>
        )}

        {c.observaciones && (
          <div style={{ backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '4px', fontSize: '9pt', color: '#334155', fontStyle: 'italic', marginTop: '4px' }}>
            "{c.observaciones}"
          </div>
        )}

        {/* ACCIONES DIRECTAS EN LA TARJETA */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          {numLimpio && (
            <a 
              href={`https://wa.me/${numLimpio}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ ...actionCardS, backgroundColor: '#25d366', color: 'white' }}
              title="Escribir al WhatsApp"
            >
              <MessageSquare size={15} /> WhatsApp
            </a>
          )}
          <button 
            type="button" 
            onClick={onCheck} 
            style={{ ...actionCardS, backgroundColor: '#16a34a', color: 'white', flex: 1 }}
          >
            <CheckCircle size={15} /> Contactado
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos de objetos para la interfaz
const iS = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', fontSize: '10pt' };
const lS = { fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' };
const gridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' };
const actionCardS = { border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '9pt', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' };

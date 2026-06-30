import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Edit3, ArrowRight, Plus, Car, Navigation, Trash2 } from 'lucide-react';

const regionesDeChile = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llay-Llay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes", "San Bernardo", "Colina", "Lampa", "Tiltil", "Melipilla", "Talagante", "Paine", "Buin"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Navidad", "Alhué", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "Treguaco", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Yungay"],
  "Bío Bío": ["Concepción", "Talcahuano", "San Pedro de la Paz", "Los Ángeles", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "Santa Juana", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

export default function PreCartera() {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre_fantasia: '', direccion: '', region: '', comuna: '', telefono: '' });
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [comunaSeleccionada, setComunaSeleccionada] = useState('');

  const fetchData = async () => {
    const { data: res } = await supabase.from('pre_cartera').select('*').order('id', { ascending: false });
    setData(res || []);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const comms = regionesDeChile[formData.region] || [];
    setComunasDisponibles(comms);
  }, [formData.region]);

  const save = async (e) => {
    e.preventDefault();
    if (editingId) await supabase.from('pre_cartera').update(formData).eq('id', editingId);
    else await supabase.from('pre_cartera').insert([formData]);
    setShowForm(false); setFormData({ nombre_fantasia: '', direccion: '', region: '', comuna: '', telefono: '' }); fetchData();
  };

  const eliminarProspecto = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este prospecto?")) {
        await supabase.from('pre_cartera').delete().eq('id', id);
        fetchData();
    }
  };

  const promoverACartera = async (p) => {
    if (window.confirm(`¿Traspasar a "${p.nombre_fantasia}" a Cartera Real?`)) {
      const { error } = await supabase.from('clientes').insert([{
        nombre_fantasia: p.nombre_fantasia,
        direccion: p.direccion,
        region: p.region,
        comuna: p.comuna,
        telefono: p.telefono
      }]);
      if (!error) {
        await supabase.from('pre_cartera').delete().eq('id', p.id);
        fetchData();
      } else alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#065f46', borderBottom: '2px solid #059669', paddingBottom: '10px' }}>🌿 PRE-CARTERA</h2>
      
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #059669', marginBottom: '30px' }}>
        <h3 style={{ color: '#065f46', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Navigation size={20} /> PLANIFICADOR DE RUTAS
        </h3>
        <select style={inputS} onChange={e => setComunaSeleccionada(e.target.value)} value={comunaSeleccionada}>
          <option value="">-- Elige una comuna para ver ruta --</option>
          {[...new Set(data.map(c => c.comuna))].filter(Boolean).map(com => <option key={com} value={com}>{com}</option>)}
        </select>
        <div style={gridEstilo}>
          {data.filter(c => c.comuna === comunaSeleccionada).map(c => {
            const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(`${c.direccion}, ${c.comuna}, Chile`)}&navigate=yes`;
            return (
              <div key={c.id} style={{...tarjetaEstilo, border:'2px solid #33ccff'}}>
                <div style={{ padding: '15px' }}>
                  <h4>{c.nombre_fantasia}</h4>
                  <p style={{fontSize:'9pt'}}>📍 {c.direccion}</p>
                  <a href={wazeUrl} target="_blank" rel="noreferrer" style={btnWaze}><Car size={16}/> WAZE</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => { setShowForm(true); setEditingId(null); }} style={btnPrincipal}>
        <Plus size={18} /> NUEVO PROSPECTO
      </button>

      <div style={gridEstilo}>
        {data.map(p => (
          <div key={p.id} style={tarjetaEstilo}>
            <div style={{ background: '#059669', color: 'white', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>{p.nombre_fantasia}</div>
            <div style={{ padding: '15px' }}>
              <p style={{ margin: '2px 0', fontSize: '9pt', color: '#475569' }}>📍 {p.direccion}, {p.comuna}</p>
              <p style={{ margin: '2px 0', fontSize: '9pt' }}>📞 {p.telefono}</p>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => promoverACartera(p)} style={botonAccion}><ArrowRight size={16}/></button>
              <button onClick={() => {setEditingId(p.id); setFormData(p); setShowForm(true)}} style={botonAccion}><Edit3 size={16}/></button>
              <button onClick={() => eliminarProspecto(p.id)} style={{...botonAccion, color:'#ef4444'}}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3>{editingId ? 'Editar Prospecto' : 'Nuevo Prospecto'}</h3>
            <input placeholder="Nombre Fantasía" style={inputS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia:e.target.value})} required />
            <input placeholder="Dirección" style={inputS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion:e.target.value})} />
            <select style={inputS} onChange={e=>setFormData({...formData, region:e.target.value})} value={formData.region}>
               <option>Seleccione Región</option>
               {Object.keys(regionesDeChile).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select style={inputS} onChange={e=>setFormData({...formData, comuna:e.target.value})} value={formData.comuna}>
               <option>Seleccione Comuna</option>
               {comunasDisponibles.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Teléfono" style={inputS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono:e.target.value})} />
            <button type="submit" style={btnPrincipal}>GUARDAR</button>
            <button type="button" onClick={()=>setShowForm(false)} style={btnSecundario}>CERRAR</button>
          </form>
        </div>
      )}
    </div>
  );
}

const gridEstilo = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'15px', marginTop:'20px' };
const tarjetaEstilo = { background:'white', borderRadius:'8px', border:'1px solid #e2e8f0', boxShadow:'0 2px 4px rgba(0,0,0,0.1)', overflow:'hidden' };
const botonAccion = { flex:1, padding:'10px', background:'white', border:'none', borderRight:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontSize:'8pt' };
const btnPrincipal = { padding:'10px 15px', background:'#059669', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' };
const btnSecundario = { padding:'10px', background:'#64748b', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', marginTop:'10px' };
const btnWaze = { display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', background:'#33ccff', color:'black', textDecoration:'none', padding:'10px', borderRadius:'6px', fontWeight:'bold', fontSize:'9pt' };
const inputS = { width:'100%', padding:'10px', margin:'5px 0', border:'1px solid #ccc', borderRadius:'5px', boxSizing:'border-box' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center' };
const modalContent = { background:'white', padding:'20px', borderRadius:'10px', width:'350px', display:'flex', flexDirection:'column' };

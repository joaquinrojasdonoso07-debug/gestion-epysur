import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle } from 'lucide-react';

const REGIONES_CHILE = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "Santiago", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", " Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacaví", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

const validarRut = (rut) => {
  if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
  let [num, dv] = rut.split('-');
  if (dv.toUpperCase() === 'K') dv = 'k';
  let t = parseInt(num), m = 2, s = 0;
  for (; t; t = Math.floor(t / 10)) {
    s = (s + (t % 10) * m) % 11;
    m = m < 7 ? m + 1 : 2;
  }
  const res = 11 - s;
  const dvr = res === 11 ? '0' : res === 10 ? 'k' : String(res);
  return dvr === dv.toLowerCase();
};

export default function Cartera() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempProducts, setTempProducts] = useState([{ nombre: '', precio: '' }]);

  const initialForm = {
    nombre_fantasia: '', nombre_cliente: '', rut: '', telefono: '', correo: '', 
    direccion: '', comuna: '', region: '', responsable: '', ultimo_contacto: '', 
    proximo_contacto: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: true });
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData(c);
    if (c.productos_ofrecidos) {
      const prods = c.productos_ofrecidos.split(' | ').map(p => {
        const [n, v] = p.split(' ($');
        return { nombre: n.replace('• ', ''), precio: v ? parseInt(v.replace(')', '').replace(/\./g, '')) : '' };
      });
      setTempProducts(prods);
    } else setTempProducts([{ nombre: '', precio: '' }]);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (formData.rut && !validarRut(formData.rut)) return alert("RUT Inválido.");
    const hoy = new Date().toISOString().split('T')[0];
    if (formData.proximo_contacto && formData.proximo_contacto < hoy) return alert("La fecha de próximo contacto no puede ser anterior a hoy.");

    const pStr = tempProducts.filter(p => p.nombre).map(p => `${p.nombre} ($${Number(p.precio || 0).toLocaleString('es-CL')})`).join(' | ');
    const cleanData = { ...formData, productos_ofrecidos: pStr || null };
    
    if (editingId) await supabase.from('clientes').update(cleanData).eq('id', editingId);
    else await supabase.from('clientes').insert([cleanData]);
    
    setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
  };

  const filtrados = data.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .only-print { display: none !important; }
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; border: 1px solid black; }
        .app-table th, .app-table td { border: 1px solid black; padding: 10px; vertical-align: top; }
        .app-table th { background: #1e40af; color: white; text-align: left; }
        .app-table td.col-acc { width: 80px !important; text-align: center; }

        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          .no-print { display: none !important; }
          .only-print { display: table-cell !important; }
          .hide-on-print { display: none !important; }
          body { background: white !important; font-family: 'Arial', sans-serif !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; border-collapse: collapse !important; }
          th { border: 2pt solid black !important; padding: 5px !important; font-size: 11pt !important; background: #e5e5e5 !important; color: black !important; text-transform: uppercase; text-align: center !important; }
          td { border: 2pt solid black !important; padding: 8px 5px !important; font-size: 12pt !important; height: 2.85cm !important; vertical-align: top !important; word-wrap: break-word !important; white-space: normal !important; color: black !important; line-height: 1.1; }
          .prod-item { border-bottom: 1.5pt solid black; padding: 2px 0; }
          .prod-item:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{nombre:'', precio:''}]); setShowForm(true);}} style={btnG}>NUEVO CLIENTE</button>
          <button onClick={() => window.print()} style={btnS}><Printer size={20}/></button>
        </div>
        <input type="text" placeholder="Buscar..." style={iS} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#1e40af', marginBottom: '20px'}}>FICHA TÉCNICA CLIENTE</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <label style={lS}>Fantasía</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required />
              <label style={lS}>Razón Social</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required />
              <label style={lS}>RUT (Ej: 12345678-9)</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} />
              <label style={lS}>Cliente (Nombre Contacto)</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} />
              <label style={lS}>Teléfono</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
              <label style={lS}>Correo</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />
              <label style={lS}>Dirección</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
              
              <label style={lS}>Región</label>
              <select style={iS} value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value, comuna: ''})}>
                <option value="">-- Seleccionar Región --</option>
                {Object.keys(REGIONES_CHILE).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label style={lS}>Comuna</label>
              <select style={iS} value={formData.comuna} onChange={e=>setFormData({...formData, comuna: e.target.value})} disabled={!formData.region}>
                <option value="">-- Seleccionar Comuna --</option>
                {formData.region && REGIONES_CHILE[formData.region].map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <label style={lS}>Último Contacto</label><input type="date" style={iS} value={formData.ultimo_contacto} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} />
              <label style={lS}>Próximo Contacto</label><input type="date" style={iS} value={formData.proximo_contacto} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} />
              
              <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                <label style={lS}>Listado de Productos</label>
                {tempProducts.map((p, idx) => (
                  <div key={idx} style={{display:'flex', gap:'8px', marginBottom:'8px', alignItems:'center'}}>
                    <input type="text" placeholder="Producto" style={iS} value={p.nombre} onChange={e=>{let n=[...tempProducts]; n[idx].nombre=e.target.value; setTempProducts(n);}} />
                    <input type="number" placeholder="$" style={{...iS, width:'120px'}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                    <button type="button" onClick={() => setTempProducts(tempProducts.filter((_,i)=>i!==idx))} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><XCircle size={24} /></button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTempProducts([...tempProducts, {nombre:'', precio:''}])} style={{fontSize:'0.8rem', color:'#1e40af', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>+ Agregar Item</button>
              </div>

              <label style={lS}>Observaciones Generales</label><textarea style={{...iS, height:'80px'}} value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'25px'}}>
              <button type="submit" style={btnP}>GUARDAR</button>
              <button type="button" onClick={()=>setShowForm(false)} style={btnS}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-area">
        <table className="app-table">
          <thead>
            <tr>
              <th className="no-print col-acc">ACC.</th>
              <th style={{width:'60px'}}>ID</th>
              <th style={{width:'180px'}}>FANTASÍA</th>
              <th style={{width:'200px'}}>RAZÓN SOCIAL</th>
              <th style={{width:'150px'}}>CLIENTE</th>
              <th className="only-print" style={{width:'250px'}}>UBICACIÓN</th>
              <th className="only-print" style={{width:'200px'}}>CONTACTO</th>
              <th className="hide-on-print">RUT</th>
              <th className="hide-on-print">DIRECCIÓN</th>
              <th className="hide-on-print">COMUNA</th>
              <th className="hide-on-print">REGIÓN</th>
              <th className="hide-on-print">TELÉFONO</th>
              <th className="hide-on-print">CORREO</th>
              <th style={{width:'220px'}}>PRODUCTOS</th>
              <th style={{width:'110px'}}>ÚLT. CONT.</th>
              <th style={{width:'110px'}}>PRÓX. CONT.</th>
              <th style={{width:'200px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td className="no-print col-acc">
                   <div style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                      <button onClick={()=>handleEdit(c)} style={smEdit}><Edit3 size={14}/></button>
                      <button onClick={async ()=>{if(window.confirm('¿Eliminar?')){await supabase.from('clientes').delete().eq('id',c.id); fetchData();}}} style={smDel}><Trash2 size={14}/></button>
                   </div>
                </td>
                <td>{c.id}</td>
                <td style={{fontWeight:'bold'}}>{c.nombre_fantasia}</td>
                <td>{c.nombre_cliente}</td>
                <td>{c.responsable}</td>
                <td className="only-print">{c.direccion}<br/>{c.comuna}, {c.region}</td>
                <td className="only-print">{c.telefono}<br/>{c.correo}</td>
                <td className="hide-on-print">{c.rut}</td>
                <td className="hide-on-print">{c.direccion}</td>
                <td className="hide-on-print">{c.comuna}</td>
                <td className="hide-on-print">{c.region}</td>
                <td className="hide-on-print">{c.telefono}</td>
                <td className="hide-on-print">{c.correo}</td>
                <td style={{padding:0}}>
                  {c.productos_ofrecidos?.split(' | ').map((p,i) => (
                    <div key={i} className="prod-item" style={{padding:'4px 8px'}}>{p}</div>
                  ))}
                </td>
                <td>{formatFechaChile(c.ultimo_contacto)}</td>
                <td style={{fontWeight:'bold'}}>{formatFechaChile(c.proximo_contacto)}</td>
                <td>{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #cbd5e1', borderRadius:'8px' };
const btnG = { padding:'12px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
const btnP = { padding:'15px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', flex:1 };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'650px', alignSelf:'flex-start' };

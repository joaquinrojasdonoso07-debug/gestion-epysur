import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Printer, Edit3, Trash2, XCircle, Search } from 'lucide-react';

const regionesChile = [
  { regiones: "Región de Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"] },
  { regiones: "Región de Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"] },
  { regiones: "Región de Antofagasta", comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"] },
  { regiones: "Región de Atacama", comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"] },
  { regiones: "Región de Coquimbo", comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"] },
  { regiones: "Región de Valparaíso", comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"] },
  { regiones: "Región del Libertador Gral. Bernardo O'Higgins", comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Navidad", "Alhué", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"] },
  { regiones: "Región del Maule", comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"] },
  { regiones: "Región de Ñuble", comunas: ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"] },
  { regiones: "Región del Bío Bío", comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"] },
  { regiones: "Región de la Araucanía", comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"] },
  { regiones: "Región de Los Ríos", comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"] },
  { regiones: "Región de Los Lagos", comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"] },
  { regiones: "Región Aisén del Gral. Carlos Ibáñez del Campo", comunas: ["Coyhaique", "Lago Verde", "Aisén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"] },
  { regiones: "Región de Magallanes y de la Antártica Chilena", comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"] },
  { regiones: "Región Metropolitana de Santiago", comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"] }
];

export default function Cartera() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [catalogo, setCatalogo] = useState([]); // Almacena el catálogo de inventario
  const [search, setSearch] = useState('');
  const [searchComuna, setSearchComuna] = useState('');
  const [searchRegion, setSearchRegion] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempProducts, setTempProducts] = useState([{ nombre: '', precio: '' }]);

  // Control indexado de sugerencias de inventario en el formulario dinámico
  const [sugInvIndex, setSugInvIndex] = useState(null);

  const initialForm = {
    nombre_fantasia: '', nombre_cliente: '', rut: '', telefono: '', correo: '', 
    direccion: '', comuna: '', region: '', responsable: '', ultimo_contacto: '', 
    proximo_contacto: '', observaciones: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const [comunasDisponibles, setComunasDisponibles] = useState([]);

  const fetchData = async () => {
    const { data: res } = await supabase.from('clientes').select('*').order('id', { ascending: true });
    const { data: inv } = await supabase.from('inventario').select('codigo, descripcion').order('descripcion', { ascending: true });
    
    setData(res || []);
    setCatalogo(inv || []);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (formData.region) {
      const regEncontrada = regionesChile.find(r => 
        r.regiones.toLowerCase().includes(formData.region.toLowerCase()) || 
        formData.region.toLowerCase().includes(r.regiones.toLowerCase())
      );
      if (regEncontrada) {
        setComunasDisponibles(regEncontrada.comunas);
      } else {
        setComunasDisponibles([]);
      }
    } else {
      setComunasDisponibles([]);
    }
  }, [formData.region]);

  const formatFechaChile = (f) => {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({ ...initialForm, ...c });
    if (c.productos_ofrecidos) {
      const prods = c.productos_ofrecidos.split(' | ').map(p => {
        const parts = p.split(' ($');
        return { nombre: parts[0] || '', precio: parts[1] ? parts[1].replace(')', '').replace(/\./g, '') : '' };
      });
      setTempProducts(prods);
    } else setTempProducts([{ nombre: '', precio: '' }]);
    setSugInvIndex(null);
    setShowForm(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres eliminar a "${nombre}"? Esto no se puede deshacer.`)) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      else fetchData();
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const pStr = tempProducts.filter(p => p.nombre.trim() !== '').map(p => `${p.nombre} ($${Number(p.precio || 0).toLocaleString('es-CL')})`).join(' | ');
    const cleanData = { 
      ...formData, 
      productos_ofrecidos: pStr || null,
      ultimo_contacto: formData.ultimo_contacto || null,
      proximo_contacto: formData.proximo_contacto || null
    };
    if (editingId) await supabase.from('clientes').update(cleanData).eq('id', editingId);
    else await supabase.from('clientes').insert([cleanData]);
    setShowForm(false); setEditingId(null); setFormData(initialForm); fetchData();
  };

  const filtrados = data.filter(c => {
    const term = search.toLowerCase().trim();
    
    if (!term) {
      const cumpleComuna = (c.comuna || '').toLowerCase().includes(searchComuna.toLowerCase().trim());
      const cumpleRegion = (c.region || '').toLowerCase().includes(searchRegion.toLowerCase().trim());
      return cumpleComuna && cumpleRegion;
    }

    const ultContCh = formatFechaChile(c.ultimo_contacto).toLowerCase();
    const proxContCh = formatFechaChile(c.proximo_contacto).toLowerCase();

    const cumpleGeneral = 
      String(c.nombre_fantasia || '').toLowerCase().includes(term) ||
      String(c.nombre_cliente || '').toLowerCase().includes(term) ||
      String(c.rut || '').toLowerCase().includes(term) ||
      String(c.responsable || '').toLowerCase().includes(term) ||
      String(c.telefono || '').toLowerCase().includes(term) ||
      String(c.correo || '').toLowerCase().includes(term) ||
      String(c.direccion || '').toLowerCase().includes(term) ||
      String(c.observaciones || '').toLowerCase().includes(term) ||
      String(c.productos_ofrecidos || '').toLowerCase().includes(term) ||
      ultContCh.includes(term) || 
      proxContCh.includes(term);

    const cumpleComuna = (c.comuna || '').toLowerCase().includes(searchComuna.toLowerCase().trim());
    const cumpleRegion = (c.region || '').toLowerCase().includes(searchRegion.toLowerCase().trim());
    
    return cumpleGeneral && cumpleComuna && cumpleRegion;
  });

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .table-area { width: 100%; overflow-x: auto; background: white; }
        .app-table { width: 100%; min-width: 3200px; border-collapse: collapse; border: 1px solid black; table-layout: fixed; }
        .app-table th, .app-table td { border: 1.5pt solid black; padding: 10px; vertical-align: top; word-wrap: break-word; }
        .app-table th { background: #1e40af; color: white; text-align: left; }
        
        .sugerencias-container { position: relative; width: 100%; }
        .sugerencias-lista { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; max-height: 150px; overflow-y: auto; z-index: 250; list-style: none; padding: 0; margin: 0; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .sugerencia-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 0.9rem; text-align: left; color: #334155; }
        .sugerencia-item:hover { background: #f1f5f9; }

        @media print {
          @page { size: letter landscape; margin: 0.4cm; }
          html, body { width: 279mm; height: 216mm; background: white; }
          .no-print { display: none !important; }
          
          .table-area { overflow: visible !important; width: 100% !important; }
          .app-table { width: 100% !important; min-width: 100% !important; table-layout: fixed !important; border: 2pt solid black !important; page-break-inside: auto; }
          
          tr { page-break-inside: avoid; page-break-after: auto; }
          th { border: 1.5pt solid black !important; background: #e5e5e5 !important; color: black !important; font-size: 10pt !important; text-align: center !important; }
          td { height: 2.85cm !important; border: 1.5pt solid black !important; font-size: 10.5pt !important; white-space: normal !important; word-wrap: break-word !important; padding: 6px !important; }
          
          .col-print-id { width: 22% !important; }
          .col-print-ub { width: 22% !important; }
          .col-print-tel { width: 11% !important; }
          .col-print-prod { width: 18% !important; }
          .col-print-f1 { width: 8% !important; }
          .col-print-f2 { width: 8% !important; }
          .col-print-obs { width: 11% !important; }
        }
      `}</style>

      <div className="no-print" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => {setEditingId(null); setFormData(initialForm); setTempProducts([{nombre:'', precio:''}]); setSugInvIndex(null); setShowForm(true);}} style={btnG}>NUEVO CLIENTE</button>
          <button onClick={() => window.print()} style={btnS}>IMPRIMIR</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <input type="text" placeholder="Buscar por Nombre, RUT o Datos generales..." style={iS} value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Comuna" style={iS} value={searchComuna} onChange={e => setSearchComuna(e.target.value)} />
            <input type="text" placeholder="Región" style={iS} value={searchRegion} onChange={e => setSearchRegion(e.target.value)} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="no-print" style={modalOverlay}>
          <form onSubmit={save} style={modalContent}>
            <h3 style={{textAlign:'center', color:'#1e40af', marginBottom:'15px'}}>FICHA CLIENTE</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div><label style={lS}>Fantasía</label><input type="text" style={iS} value={formData.nombre_fantasia} onChange={e=>setFormData({...formData, nombre_fantasia: e.target.value})} required /></div>
              <div><label style={lS}>Razón Social</label><input type="text" style={iS} value={formData.nombre_cliente} onChange={e=>setFormData({...formData, nombre_cliente: e.target.value})} required /></div>
              <div><label style={lS}>RUT</label><input type="text" style={iS} value={formData.rut} onChange={e=>setFormData({...formData, rut: e.target.value})} /></div>
              <div><label style={lS}>Cliente</label><input type="text" style={iS} value={formData.responsable} onChange={e=>setFormData({...formData, responsable: e.target.value})} /></div>
              <div><label style={lS}>Teléfono</label><input type="text" style={iS} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} /></div>
              <div><label style={lS}>Correo</label><input type="email" style={iS} value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} /></div>
              <div><label style={lS}>Dirección</label><input type="text" style={iS} value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} /></div>
              
              <div>
                <label style={lS}>Región</label>
                <select 
                  style={iS} 
                  value={regionesChile.some(r => r.regiones === formData.region) ? formData.region : ""} 
                  onChange={e => setFormData({...formData, region: e.target.value, comuna: ''})}
                >
                  <option value="">-- Selecciona Región --</option>
                  {regionesChile.map((r, idx) => (
                    <option key={idx} value={r.regiones}>{r.regiones}</option>
                  ))}
                </select>
                {formData.region && !regionesChile.some(r => r.regiones === formData.region) && (
                  <span style={{fontSize:'0.7rem', color:'#ef4444'}}>Valor actual no estandarizado: "{formData.region}"</span>
                )}
              </div>

              <div>
                <label style={lS}>Comuna</label>
                <select 
                  style={iS} 
                  value={comunasDisponibles.includes(formData.comuna) ? formData.comuna : ""} 
                  onChange={e => setFormData({...formData, comuna: e.target.value})}
                  disabled={comunasDisponibles.length === 0}
                >
                  <option value="">-- Selecciona Comuna --</option>
                  {comunasDisponibles.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
                {formData.comuna && !comunasDisponibles.includes(formData.comuna) && (
                  <span style={{fontSize:'0.7rem', color:'#ef4444'}}>Valor actual no estandarizado: "{formData.comuna}"</span>
                )}
              </div>

              <div><label style={lS}>Último Contacto</label><input type="date" style={iS} value={formData.ultimo_contacto || ''} onChange={e=>setFormData({...formData, ultimo_contacto: e.target.value})} /></div>
              <div><label style={lS}>Próximo Contacto</label><input type="date" style={iS} value={formData.proximo_contacto || ''} onChange={e=>setFormData({...formData, proximo_contacto: e.target.value})} /></div>
              
              <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}>
                <label style={lS}>Productos</label>
                {tempProducts.map((p, idx) => {
                  const filtradosInv = catalogo.filter(item => 
                    item.descripcion.toLowerCase().includes(p.nombre.toLowerCase()) ||
                    item.codigo.toLowerCase().includes(p.nombre.toLowerCase())
                  );

                  return (
                    <div key={idx} className="sugerencias-container" style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                      <div style={{flex: 1, position: 'relative'}}>
                        <input 
                          type="text" 
                          placeholder="Nombre o código..." 
                          style={iS} 
                          value={p.nombre} 
                          onChange={e=>{
                            let n=[...tempProducts]; 
                            n[idx].nombre=e.target.value; 
                            setTempProducts(n);
                            setSugInvIndex(e.target.value.length > 0 ? idx : null);
                          }} 
                          onFocus={() => { if (p.nombre) setSugInvIndex(idx); }}
                          onBlur={() => setTimeout(() => setSugInvIndex(null), 250)}
                        />
                        {sugInvIndex === idx && filtradosInv.length > 0 && (
                          <ul className="sugerencias-lista">
                            {filtradosInv.map((prod, i) => (
                              <li 
                                key={i} 
                                className="sugerencia-item"
                                // Guarda únicamente la descripción, omitiendo el código
                                onMouseDown={() => {
                                  let n=[...tempProducts];
                                  n[idx].nombre = `${prod.descripcion}`;
                                  setTempProducts(n);
                                  setSugInvIndex(null);
                                }}
                              >
                                <strong>[{prod.codigo}]</strong> {prod.descripcion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <input type="number" placeholder="$" style={{...iS, width:'100px'}} value={p.precio} onChange={e=>{let n=[...tempProducts]; n[idx].precio=e.target.value; setTempProducts(n);}} />
                      <button type="button" onClick={()=>setTempProducts(tempProducts.filter((_,i)=>i!==idx))} style={{background:'none', border:'none'}}><XCircle color="red" size={20}/></button>
                    </div>
                  );
                })}
                <button type="button" onClick={()=>setTempProducts([...tempProducts, {nombre:'', precio:''}])} style={{fontSize:'0.8rem', color:'#1e40af', background:'none', border:'none', cursor:'pointer'}}>+ Agregar Producto</button>
              </div>
              <div><label style={lS}>Observaciones</label><textarea style={{...iS, height:'60px'}} value={formData.observaciones || ''} onChange={e=>setFormData({...formData, observaciones: e.target.value})} /></div>
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
              <th className="col-print-id" style={{width:'180px'}}>FANTASÍA / CLIENTE</th>
              <th className="no-print" style={{width:'200px'}}>RAZÓN SOCIAL</th>
              <th className="no-print" style={{width:'140px'}}>RUT</th>
              <th className="no-print" style={{width:'150px'}}>CLIENTE (WEB)</th>
              <th className="col-print-ub" style={{width:'250px'}}>DIRECCIÓN / UBICACIÓN</th>
              <th className="no-print" style={{width:'150px'}}>COMUNA (WEB)</th>
              <th className="no-print" style={{width:'150px'}}>REGIÓN (WEB)</th>
              <th className="col-print-tel" style={{width:'150px'}}>TELÉFONO</th>
              <th className="no-print" style={{width:'200px'}}>CORREO</th>
              <th className="col-print-prod" style={{width:'300px'}}>PRODUCTOS</th>
              <th className="col-print-f1" style={{width:'110px'}}>ÚLT. CONT</th>
              <th className="col-print-f2" style={{width:'110px'}}>PRÓX. CONT</th>
              <th className="col-print-obs" style={{width:'300px'}}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td className="no-print">
                   <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={()=>handleEdit(c)} style={smEdit}><Edit3 size={14}/></button>
                      <button onClick={()=>handleDelete(c.id, c.nombre_fantasia)} style={smDel}><Trash2 size={14}/></button>
                   </div>
                </td>
                
                <td className="col-print-id">
                  <div style={{fontWeight:'bold'}}>{c.nombre_fantasia}</div>
                  <div className="only-print" style={{fontSize:'0.85rem', color:'#444', marginTop:'2px'}}>{c.nombre_cliente}</div>
                  <div className="only-print" style={{fontSize:'0.85rem', fontStyle:'italic', marginTop:'2px'}}>{c.responsable}</div>
                </td>
                
                <td className="no-print">{c.nombre_cliente}</td>
                <td className="no-print">{c.rut}</td>
                <td className="no-print">{c.responsable}</td>
                
                <td className="col-print-ub">
                  <div>{c.direccion}</div>
                  <div className="only-print" style={{fontSize:'0.85rem', fontWeight:'bold', marginTop:'2px'}}>{c.comuna} - {c.region}</div>
                </td>
                
                <td className="no-print">{c.comuna}</td>
                <td className="no-print">{c.region}</td>
                
                <td className="col-print-tel">{c.telefono}</td>
                <td className="no-print">{c.correo}</td>
                <td style={{padding:0}} className="col-print-prod">
                  {c.productos_ofrecidos?.split(' | ').map((p,i)=><div key={i} style={{borderBottom:'1px solid black', padding:'4px'}}>{p}</div>)}
                </td>
                <td className="col-print-f1">{formatFechaChile(c.ultimo_contacto)}</td>
                <td style={{fontWeight:'bold'}} className="col-print-f2">{formatFechaChile(c.proximo_contacto)}</td>
                <td className="col-print-obs">{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iS = { width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'8px', backgroundColor:'white', boxSizing:'border-box' };
const btnG = { padding:'12px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' };
const btnP = { padding:'15px', background:'#1e40af', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', flex:1, cursor:'pointer' };
const btnS = { padding:'15px', background:'#64748b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' };
const smEdit = { background:'#3b82f6', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const smDel = { background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' };
const lS = { fontSize:'0.75rem', fontWeight:'bold', color:'#475569', display:'block', marginBottom:'4px', textTransform:'uppercase' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', padding:'20px', zIndex:100, overflowY:'auto' };
const modalContent = { background:'white', padding:'30px', borderRadius:'15px', width:'100%', maxWidth:'600px', alignSelf:'flex-start' };

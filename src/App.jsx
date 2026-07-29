import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import FormularioComercio from './FormularioComercio'
import AdminPanel from './AdminPanel'
import FichaDetalle from './FichaDetalle'

function HomePage() {
  const [busqueda, setBusqueda] = useState('')
  const [negocios, setNegocios] = useState([])
  const [negociosFiltrados, setNegociosFiltrados] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [mostrarMenuMovil, setMostrarMenuMovil] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarNegocios()
  }, [])

  const cargarNegocios = async () => {
    try {
      setCargando(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('activo', true)
        .eq('suspendido', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setNegocios(data)
        setNegociosFiltrados(data)
      } else {
        setError('No hay registros aún.')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  const ordenarPorPlan = (lista) => {
    const orden = { 'Patrocinado': 1, 'Destacado': 2, 'Estándar': 3, 'Estandar': 3, 'Gratuito': 4 }
    return [...lista].sort((a, b) => {
      const planA = orden[a.plan] || 4
      const planB = orden[b.plan] || 4
      if (planA !== planB) return planA - planB
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }

  useEffect(() => {
    let resultados = negocios

    if (busqueda) {
      resultados = resultados.filter(n =>
        n.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (n.tipo && n.tipo.toLowerCase().includes(busqueda.toLowerCase()))
      )
    }

    if (categoriaSeleccionada) {
      resultados = resultados.filter(n => n.categoria === categoriaSeleccionada)
    }

    setNegociosFiltrados(ordenarPorPlan(resultados))
  }, [busqueda, categoriaSeleccionada, negocios])

  const categorias = [...new Set(negocios.map(n => n.categoria))]
  const negociosPatrocinados = negocios.filter(n => n.plan === 'Patrocinado').slice(0, 6)
  const negociosDestacados = negocios.filter(n => n.plan === 'Destacado')

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria)
    setTimeout(() => {
      const element = document.getElementById('resultados-negocios')
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const volverAlInicio = () => {
    setCategoriaSeleccionada(null)
    setBusqueda('')
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  const handleVerFicha = (id) => {
    navigate(`/ficha/${id}`)
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* HEADER */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div onClick={volverAlInicio} className="cursor-pointer flex items-center">
                <img src="/logo.png" alt="Realicó PyMEs" className="h-10 md:h-12 w-auto" />
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 font-body font-semibold">
              <a href="#" onClick={volverAlInicio} className="text-navy hover:text-dorado transition cursor-pointer">Inicio</a>
              <a href="#categorias" className="text-navy hover:text-dorado transition">Categorías</a>
              <a href="#planes" className="text-navy hover:text-dorado transition">Planes</a>
              <button onClick={() => setMostrarFormulario(true)} className="bg-navy text-crema px-6 py-2 rounded-lg font-bold hover:bg-navy-dark transition">Publicar</button>
            </div>

            <button onClick={() => setMostrarMenuMovil(!mostrarMenuMovil)} className="md:hidden text-navy p-2 hover:bg-navy/10 rounded-lg transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mostrarMenuMovil ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mostrarMenuMovil && (
            <div className="md:hidden mt-4 pb-4 border-t border-navy/10 pt-4">
              <div className="flex flex-col space-y-3 font-body font-semibold">
                <a href="#" onClick={() => {volverAlInicio(); setMostrarMenuMovil(false)}} className="text-navy hover:text-dorado transition py-2">Inicio</a>
                <a href="#categorias" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2">Categorías</a>
                <a href="#planes" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2">Planes</a>
                <button onClick={() => {setMostrarFormulario(true); setMostrarMenuMovil(false)}} className="bg-navy text-crema px-6 py-3 rounded-lg font-bold hover:bg-navy-dark transition text-center">Publicar</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="bg-gradient-to-b from-navy to-navy-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl mb-4 tracking-wide">El directorio de Realicó</h1>
          <p className="font-body text-xl md:text-2xl mb-10 text-dorado-claro max-w-2xl mx-auto font-medium">
            Comercios, servicios, profesiones, productores locales y emprendimientos de La Pampa.
          </p>
          
          <div className="max-w-3xl mx-auto bg-crema p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué buscás? Ejemplo: Panadería, Abogado, Miel, Diseño..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 p-4 rounded-md text-navy text-lg focus:outline-none focus:ring-2 focus:ring-dorado font-body"
            />
            <button className="bg-dorado text-navy font-body font-bold py-4 px-10 rounded-md hover:bg-dorado-claro transition text-lg">Buscar</button>
          </div>
        </div>
      </header>

      {/* PATROCINADORES */}
      {negociosPatrocinados.length > 0 && (
        <section className="bg-dorado/10 py-16 border-b border-dorado/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="font-label bg-navy text-crema px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Patrocinadores</span>
              <h2 className="font-display text-4xl md:text-5xl text-navy mt-4 mb-4 tracking-wide">Empresas Destacadas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {negociosPatrocinados.map((n) => (
                <div key={n.id} onClick={() => handleVerFicha(n.id)} className="bg-white p-8 rounded-xl shadow-lg border-2 border-navy hover:shadow-2xl transition duration-300 relative overflow-hidden cursor-pointer">
                  <div className="absolute top-0 right-0 bg-navy text-crema font-label font-bold text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">Patrocinador</div>
                  {n.foto_portada && <img src={n.foto_portada} alt={n.nombre} className="w-full h-48 object-cover rounded-lg mb-4" />}
                  <h3 className="font-display text-navy text-3xl mb-2 tracking-wide">{n.nombre}</h3>
                  <p className="font-label text-dorado font-semibold text-sm mb-4 uppercase tracking-wide">{n.categoria}</p>
                  <p className="font-body text-navy/70 text-base mb-6 line-clamp-2">{n.descripcion}</p>
                  <button className="w-full text-center bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition">Ver ficha completa →</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORÍAS */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="categorias" className="container mx-auto px-4 py-16">
          <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 text-center tracking-wide">Explora por Categoría</h2>
          <p className="font-body text-navy/70 text-center mb-12 max-w-2xl mx-auto text-lg">
            Encontrá comercios, servicios, profesionales, productores y emprendimientos en Realicó y la región.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((categoria, index) => (
              <div key={index} onClick={() => handleCategoriaClick(categoria)} className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center border-2 border-transparent hover:border-dorado cursor-pointer group">
                <h3 className="font-label font-bold text-navy text-xl mb-3 group-hover:text-dorado transition uppercase tracking-wide">{categoria}</h3>
                <p className="font-body text-dorado font-medium text-sm">Ver más →</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DESTACADOS */}
      {!categoriaSeleccionada && !busqueda && negociosDestacados.length > 0 && (
        <section className="bg-papel py-16 border-t border-dorado/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="font-label bg-dorado text-navy px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Destacados</span>
              <h2 className="font-display text-4xl md:text-5xl text-navy mt-4 mb-4 tracking-wide">Negocios y Servicios Destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {negociosDestacados.map((n) => (
                <div key={n.id} onClick={() => handleVerFicha(n.id)} className="bg-white p-8 rounded-xl shadow-lg border-2 border-dorado hover:shadow-2xl transition duration-300 relative overflow-hidden cursor-pointer">
                  <div className="absolute top-0 right-0 bg-dorado text-navy font-label font-bold text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">Destacado</div>
                  {n.foto_portada && <img src={n.foto_portada} alt={n.nombre} className="w-full h-48 object-cover rounded-lg mb-4" />}
                  <h3 className="font-display text-navy text-3xl mb-2 tracking-wide">{n.nombre}</h3>
                  <p className="font-label text-dorado font-semibold text-sm mb-4 uppercase tracking-wide">{n.categoria}</p>
                  <p className="font-body text-navy/70 text-base mb-6 line-clamp-2">{n.descripcion}</p>
                  <button className="w-full text-center bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition">Ver ficha completa →</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RESULTADOS */}
      {(categoriaSeleccionada || busqueda) && (
        <section id="resultados-negocios" className="container mx-auto px-4 py-16 flex-grow">
          <div className="mb-8">
            <button onClick={volverAlInicio} className="font-body text-navy hover:text-dorado font-medium mb-4 flex items-center">← Volver al inicio</button>
            <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 tracking-wide">
              {categoriaSeleccionada ? `Resultados en "${categoriaSeleccionada}"` : `Resultados para "${busqueda}"`}
            </h2>
            <p className="font-body text-navy/70 text-lg">{negociosFiltrados.length} resultado{negociosFiltrados.length !== 1 ? 's' : ''}</p>
          </div>
          
          {negociosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-navy/70 text-lg mb-4">No se encontraron resultados.</p>
              <button onClick={volverAlInicio} className="bg-navy text-white px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-light transition">Ver todas las categorías</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {negociosFiltrados.map((n) => (
                <div key={n.id} onClick={() => handleVerFicha(n.id)} className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-2 cursor-pointer ${
                  n.plan === 'Patrocinado' ? 'border-navy' :
                  n.plan === 'Destacado' ? 'border-dorado' :
                  'border-navy/10'
                }`}>
                  {n.plan && n.plan !== 'Gratuito' && (
                    <span className={`font-label inline-block text-xs px-2 py-1 rounded uppercase tracking-wider mb-3 ${
                      n.plan === 'Patrocinado' ? 'bg-navy text-crema' :
                      n.plan === 'Destacado' ? 'bg-dorado text-navy' :
                      'bg-crema text-navy'
                    }`}>{n.plan}</span>
                  )}
                  {n.foto_portada && <img src={n.foto_portada} alt={n.nombre} className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <h3 className="font-display text-navy text-3xl mb-2 tracking-wide">{n.nombre}</h3>
                  <p className="font-label text-dorado font-semibold text-sm mb-3 uppercase tracking-wide">{n.categoria}</p>
                  {n.tipo && <p className="font-body text-navy/60 text-xs mb-3">{n.tipo}</p>}
                  <p className="font-body text-navy/70 text-base mb-4 line-clamp-2">{n.descripcion}</p>
                  <button className="w-full text-center bg-navy text-crema py-2 rounded-lg font-body font-medium text-sm hover:bg-navy-dark transition">Ver ficha completa →</button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PLANES */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="planes" className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl md:text-5xl text-center mb-4 tracking-wide">Elegí tu Plan</h2>
            <p className="font-body text-center text-dorado-claro mb-12 max-w-2xl mx-auto text-lg">
              Para comercios, profesionales, productores y emprendedores.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <div className="bg-crema text-navy p-6 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl mb-2 tracking-wide">Gratuito</h3>
                <p className="font-body text-navy/70 mb-4 font-semibold">$0/mes</p>
                <ul className="space-y-2 mb-6 font-body text-sm">
                  <li>✓ Nombre y categoría</li>
                  <li>✓ Dirección</li>
                  <li>✓ Teléfono (texto)</li>
                </ul>
                <button className="w-full bg-navy/20 text-navy py-2 rounded-lg font-body font-bold cursor-default text-sm">Actual</button>
              </div>
              <div className="bg-crema text-navy p-6 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl mb-2 tracking-wide">Estándar</h3>
                <p className="font-body text-navy/70 mb-4 font-semibold">$X.XXX/mes</p>
                <ul className="space-y-2 mb-6 font-body text-sm">
                  <li>✓ Todo lo del Gratuito</li>
                  <li>✓ Botón WhatsApp</li>
                  <li>✓ 1 foto de portada</li>
                  <li>✓ Horario</li>
                </ul>
                <button className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm">Elegir Plan</button>
              </div>
              <div className="bg-dorado text-navy p-6 rounded-xl shadow-2xl transform scale-105 border-4 border-dorado-claro">
                <div className="font-label bg-navy text-crema text-center py-1 rounded mb-3 font-bold uppercase tracking-wider text-xs">Más Popular</div>
                <h3 className="font-display text-2xl mb-2 tracking-wide">Destacado</h3>
                <p className="font-body text-navy/80 mb-4 font-semibold">$X.XXX/mes</p>
                <ul className="space-y-2 mb-6 font-body text-sm">
                  <li>✓ Todo lo del Estándar</li>
                  <li>✓ Galería (5 fotos)</li>
                  <li>✓ Redes sociales</li>
                  <li>✓ Google Maps</li>
                  <li>✓ Badge "Destacado"</li>
                </ul>
                <button className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm">Elegir Plan</button>
              </div>
              <div className="bg-crema text-navy p-6 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl mb-2 tracking-wide">Patrocinado</h3>
                <p className="font-body text-navy/70 mb-4 font-semibold">Consultar</p>
                <ul className="space-y-2 mb-6 font-body text-sm">
                  <li>✓ Todo lo del Destacado</li>
                  <li>✓ Galería + video</li>
                  <li>✓ Banner en home</li>
                  <li>✓ Logo en header</li>
                  <li>✓ Botón "Cómo llegar"</li>
                </ul>
                <button className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm">Contactar</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!categoriaSeleccionada && !busqueda && (
        <section className="bg-dorado py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 tracking-wide">¿Tenés algo que ofrecer?</h2>
            <p className="font-body text-navy/80 text-xl mb-8 max-w-2xl mx-auto">
              Sumá tu comercio, servicio, profesión, producto local o emprendimiento al directorio más importante de Realicó.
            </p>
            <button onClick={() => setMostrarFormulario(true)} className="bg-navy text-crema px-10 py-4 rounded-lg font-body font-bold text-xl hover:bg-navy-dark transition shadow-lg">
              ¡Quiero Publicar!
            </button>
            <p className="font-body text-navy/60 text-sm mt-4">Es gratis y toma menos de 2 minutos</p>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-navy-dark text-crema/80 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Realicó PyMEs</h3>
              <p className="font-body text-crema/60 text-sm">El directorio de comercios, servicios, profesiones, productores y emprendimientos de Realicó, La Pampa.</p>
            </div>
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" onClick={volverAlInicio} className="hover:text-dorado-claro transition cursor-pointer">Inicio</a></li>
                <li><a href="#categorias" className="hover:text-dorado-claro transition">Categorías</a></li>
                <li><button onClick={() => setMostrarFormulario(true)} className="hover:text-dorado-claro transition">Publicar</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Contacto</h3>
              <p className="font-body text-crema/60 text-sm">¿Tenés algo que ofrecer?<br />Sumate al directorio y llegá a más clientes.</p>
            </div>
          </div>
          <div className="border-t border-crema/20 pt-8 text-center text-sm font-body text-crema/60">
            <p>© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
            <button onClick={() => setMostrarAdmin(true)} className="mt-2 text-crema/40 hover:text-crema/70 text-xs">Acceso Admin</button>
          </div>
        </div>
      </footer>

      {mostrarFormulario && <FormularioComercio onClose={() => setMostrarFormulario(false)} />}
      {mostrarAdmin && <AdminPanel onClose={() => setMostrarAdmin(false)} />}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ficha/:id" element={<FichaDetalle />} />
    </Routes>
  )
}

export default App
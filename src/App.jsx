import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import FormularioComercio from './FormularioComercio'
import AdminPanel from './AdminPanel'

function App() {
  const [busqueda, setBusqueda] = useState('')
  const [negocios, setNegocios] = useState([])
  const [negociosFiltrados, setNegociosFiltrados] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [mostrarMenuMovil, setMostrarMenuMovil] = useState(false)

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
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error de Supabase:', error)
        setError('Error al cargar los negocios: ' + error.message)
        setCargando(false)
        return
      }
      
      if (data && data.length > 0) {
        setNegocios(data)
        setNegociosFiltrados(data)
      } else {
        setError('No hay negocios cargados aún.')
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError('Error de conexión: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let resultados = negocios

    if (busqueda) {
      resultados = resultados.filter(negocio =>
        negocio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        negocio.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        negocio.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    if (categoriaSeleccionada) {
      resultados = resultados.filter(negocio =>
        negocio.categoria === categoriaSeleccionada
      )
    }

    setNegociosFiltrados(resultados)
  }, [busqueda, categoriaSeleccionada, negocios])

  const categorias = [...new Set(negocios.map(n => n.categoria))]

  const negociosDestacados = negociosFiltrados.filter(n => n.destacado === true)
  const negociosGratuitos = negociosFiltrados.filter(n => n.destacado !== true)

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria)
    setTimeout(() => {
      const element = document.getElementById('resultados-negocios')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const volverAlInicio = () => {
    setCategoriaSeleccionada(null)
    setBusqueda('')
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* Barra de Navegación */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <div onClick={volverAlInicio} className="cursor-pointer flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Realicó PyMEs Logo" 
                  className="h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            
            {/* Menú Desktop */}
            <div className="hidden md:flex items-center space-x-8 font-body font-semibold">
              <a href="#" onClick={volverAlInicio} className="text-navy hover:text-dorado transition cursor-pointer">Inicio</a>
              <a href="#categorias" className="text-navy hover:text-dorado transition">Categorías</a>
              <a href="#planes" className="text-navy hover:text-dorado transition">Cómo Funciona</a>
              <button 
                onClick={() => setMostrarFormulario(true)}
                className="bg-navy text-crema px-6 py-2 rounded-lg font-bold hover:bg-navy-dark transition"
              >
                Soy Comercio
              </button>
            </div>

            {/* Botón Menú Móvil */}
            <button 
              onClick={() => setMostrarMenuMovil(!mostrarMenuMovil)}
              className="md:hidden text-navy p-2 hover:bg-navy/10 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mostrarMenuMovil ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú Móvil Desplegable */}
          {mostrarMenuMovil && (
            <div className="md:hidden mt-4 pb-4 border-t border-navy/10 pt-4">
              <div className="flex flex-col space-y-3 font-body font-semibold">
                <a 
                  href="#" 
                  onClick={() => {volverAlInicio(); setMostrarMenuMovil(false)}} 
                  className="text-navy hover:text-dorado transition py-2"
                >
                  Inicio
                </a>
                <a 
                  href="#categorias" 
                  onClick={() => setMostrarMenuMovil(false)} 
                  className="text-navy hover:text-dorado transition py-2"
                >
                  Categorías
                </a>
                <a 
                  href="#planes" 
                  onClick={() => setMostrarMenuMovil(false)} 
                  className="text-navy hover:text-dorado transition py-2"
                >
                  Cómo Funciona
                </a>
                <button 
                  onClick={() => {setMostrarFormulario(true); setMostrarMenuMovil(false)}}
                  className="bg-navy text-crema px-6 py-3 rounded-lg font-bold hover:bg-navy-dark transition text-center"
                >
                  Soy Comercio
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sección Principal (Hero) */}
      <header className="bg-gradient-to-b from-navy to-navy-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl mb-4 tracking-wide">
            El directorio de negocios de Realicó
          </h1>
          <p className="font-body text-xl md:text-2xl mb-10 text-dorado-claro max-w-2xl mx-auto font-medium">
            Conectamos a la comunidad con los mejores servicios y profesionales locales de La Pampa.
          </p>
          
          <div className="max-w-3xl mx-auto bg-crema p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué buscás? Ejemplo: Panadería, Cerrajero, Farmacia..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 p-4 rounded-md text-navy text-lg focus:outline-none focus:ring-2 focus:ring-dorado font-body"
            />
            <button className="bg-dorado text-navy font-body font-bold py-4 px-10 rounded-md hover:bg-dorado-claro transition text-lg">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN 1: TARJETAS DE CATEGORÍAS */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="categorias" className="container mx-auto px-4 py-16">
          <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 text-center tracking-wide">Explora por Categoría</h2>
          <p className="font-body text-navy/70 text-center mb-12 max-w-2xl mx-auto text-lg">
            Encontrá rápidamente los servicios que necesitás en Realicó y la región.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((categoria, index) => (
              <div 
                key={index}
                onClick={() => handleCategoriaClick(categoria)}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center border-2 border-transparent hover:border-dorado cursor-pointer group"
              >
                <h3 className="font-label font-bold text-navy text-xl mb-3 group-hover:text-dorado transition uppercase tracking-wide">{categoria}</h3>
                <p className="font-body text-dorado font-medium text-sm">Ver comercios →</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: COMERCIOS DESTACADOS */}
      {!categoriaSeleccionada && !busqueda && negociosDestacados.length > 0 && (
        <section className="bg-papel py-16 border-t border-dorado/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="font-label bg-dorado text-navy px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Destacados</span>
              <h2 className="font-display text-4xl md:text-5xl text-navy mt-4 mb-4 tracking-wide">Comercios Destacados</h2>
              <p className="font-body text-navy/70 max-w-2xl mx-auto text-lg">
                Estos comercios invierten en su visibilidad. ¡Apoyá el comercio local!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {negociosDestacados.map((negocio) => (
                <div key={negocio.id} className="bg-white p-8 rounded-xl shadow-lg border-2 border-dorado hover:shadow-2xl transition duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-dorado text-navy font-label font-bold text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                    Destacado
                  </div>

                  <h3 className="font-display text-navy text-3xl mb-2 mt-2 tracking-wide">{negocio.nombre}</h3>
                  <p className="font-label text-dorado font-semibold text-sm mb-4 uppercase tracking-wide">{negocio.categoria}</p>
                  <p className="font-body text-navy/70 text-base mb-6">{negocio.descripcion}</p>
                  
                  <div className="space-y-3 text-sm font-body">
                    {negocio.direccion && (
                      <p className="text-navy/80 flex items-start">
                        <span className="mr-2">📍</span> {negocio.direccion}
                      </p>
                    )}
                    {negocio.telefono && (
                      <p className="text-navy/80 flex items-start">
                        <span className="mr-2"></span> {negocio.telefono}
                      </p>
                    )}
                    {negocio.horario && (
                      <p className="text-navy/80 flex items-start">
                        <span className="mr-2">🕐</span> {negocio.horario}
                      </p>
                    )}
                  </div>

                  {negocio.whatsapp && (
                    <a 
                      href={`https://wa.me/${negocio.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 block text-center bg-oliva text-white py-3 rounded-lg hover:bg-oliva-dark transition font-body font-bold"
                    >
                      Contactar por WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 3: RESULTADOS DE BÚSQUEDA O CATEGORÍA */}
      {(categoriaSeleccionada || busqueda) && (
        <section id="resultados-negocios" className="container mx-auto px-4 py-16 flex-grow">
          <div className="mb-8">
            <button 
              onClick={volverAlInicio}
              className="font-body text-navy hover:text-dorado font-medium mb-4 flex items-center"
            >
              ← Volver al inicio
            </button>
            
            <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 tracking-wide">
              {categoriaSeleccionada 
                ? `Comercios en "${categoriaSeleccionada}"` 
                : `Resultados para "${busqueda}"`}
            </h2>
          </div>
          
          {negociosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-navy/70 text-lg mb-4">No se encontraron negocios con esos criterios.</p>
              <button 
                onClick={volverAlInicio}
                className="bg-navy text-white px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-light transition"
              >
                Ver todas las categorías
              </button>
            </div>
          ) : (
            <div>
              {negociosDestacados.length > 0 && (
                <div className="mb-12">
                  <h3 className="font-display text-2xl text-navy mb-6 flex items-center tracking-wide">
                    <span className="font-label bg-dorado text-navy px-3 py-1 rounded text-sm mr-3 uppercase tracking-wider">Destacados</span>
                    Comercios Destacados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negociosDestacados.map((negocio) => (
                      <div key={negocio.id} className="bg-white p-6 rounded-lg shadow-lg border-2 border-dorado hover:shadow-xl transition duration-300 relative">
                        <div className="absolute top-0 right-0 bg-dorado text-navy font-label font-bold text-xs px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                          Destacado
                        </div>
                        
                        <h3 className="font-display text-navy text-3xl mb-2 mt-2 tracking-wide">{negocio.nombre}</h3>
                        <p className="font-label text-dorado font-semibold text-sm mb-3 uppercase tracking-wide">{negocio.categoria}</p>
                        <p className="font-body text-navy/70 text-base mb-4">{negocio.descripcion}</p>
                        
                        <div className="space-y-2 text-sm font-body text-navy/80">
                          {negocio.direccion && <p>📍 {negocio.direccion}</p>}
                          {negocio.telefono && <p> {negocio.telefono}</p>}
                          {negocio.horario && <p>🕐 {negocio.horario}</p>}
                        </div>

                        {negocio.whatsapp && (
                          <a 
                            href={`https://wa.me/${negocio.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block text-center bg-oliva text-white py-2 rounded-lg hover:bg-oliva-dark transition font-body font-medium text-sm"
                          >
                            Contactar por WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {negociosGratuitos.length > 0 && (
                <div>
                  <h3 className="font-display text-2xl text-navy mb-6 tracking-wide">
                    {negociosDestacados.length > 0 ? 'Otros Comercios' : 'Todos los Comercios'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negociosGratuitos.map((negocio) => (
                      <div key={negocio.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border border-navy/10">
                        <h3 className="font-display text-navy text-3xl mb-2 tracking-wide">{negocio.nombre}</h3>
                        <p className="font-label text-dorado font-semibold text-sm mb-3 uppercase tracking-wide">{negocio.categoria}</p>
                        <p className="font-body text-navy/70 text-base mb-4 line-clamp-2">{negocio.descripcion}</p>
                        
                        <div className="space-y-2 text-sm font-body text-navy/80">
                          {negocio.direccion && <p>📍 {negocio.direccion}</p>}
                          {negocio.telefono && <p>📞 {negocio.telefono}</p>}
                          {negocio.horario && <p> {negocio.horario}</p>}
                        </div>

                        {negocio.whatsapp && (
                          <a 
                            href={`https://wa.me/${negocio.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block text-center bg-oliva text-white py-2 rounded-lg hover:bg-oliva-dark transition font-body font-medium text-sm"
                          >
                            Contactar por WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* SECCIÓN 4: PLANES DE PATROCINIO */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="planes" className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl md:text-5xl text-center mb-4 tracking-wide">Destacá tu Comercio</h2>
            <p className="font-body text-center text-dorado-claro mb-12 max-w-2xl mx-auto text-lg">
              Elegí el plan que mejor se adapte a tus necesidades y llegá a más clientes en Realicó.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plan Gratuito */}
              <div className="bg-crema text-navy p-8 rounded-xl shadow-lg">
                <h3 className="font-display text-3xl mb-2 tracking-wide">Gratuito</h3>
                <p className="font-body text-navy/70 mb-6">Básico</p>
                <ul className="space-y-3 mb-8 font-body">
                  <li className="flex items-center">✓ Ficha básica</li>
                  <li className="flex items-center">✓ Datos de contacto</li>
                  <li className="flex items-center">✓ Búsqueda en directorio</li>
                  <li className="flex items-center text-navy/40">✗ Destacado en categoría</li>
                  <li className="flex items-center text-navy/40">✗ Badge "Destacado"</li>
                </ul>
                <button className="w-full bg-navy/20 text-navy py-3 rounded-lg font-body font-bold cursor-default">
                  Actual
                </button>
              </div>

              {/* Plan Destacado */}
              <div className="bg-dorado text-navy p-8 rounded-xl shadow-2xl transform scale-105 border-4 border-dorado-claro">
                <div className="font-label bg-navy text-dorado-claro text-center py-1 rounded mb-4 font-bold uppercase tracking-wider text-sm">
                  Más Popular
                </div>
                <h3 className="font-display text-3xl mb-2 tracking-wide">Destacado</h3>
                <p className="font-body text-navy/80 mb-6">$X.XXX/mes</p>
                <ul className="space-y-3 mb-8 font-body">
                  <li className="flex items-center">✓ Todo lo del plan Gratuito</li>
                  <li className="flex items-center">✓ Aparecer primero en búsquedas</li>
                  <li className="flex items-center">✓ Badge "Destacado" visible</li>
                  <li className="flex items-center">✓ Sección especial en home</li>
                  <li className="flex items-center text-navy/50">✗ Patrocinio exclusivo</li>
                </ul>
                <button className="w-full bg-navy text-dorado-claro py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">
                  Elegir Plan
                </button>
              </div>

              {/* Plan Patrocinado */}
              <div className="bg-crema text-navy p-8 rounded-xl shadow-lg">
                <h3 className="font-display text-3xl mb-2 tracking-wide">Patrocinado</h3>
                <p className="font-body text-navy/70 mb-6">Premium</p>
                <ul className="space-y-3 mb-8 font-body">
                  <li className="flex items-center">✓ Todo lo del plan Destacado</li>
                  <li className="flex items-center">✓ Banner en home</li>
                  <li className="flex items-center">✓ Logo en header</li>
                  <li className="flex items-center">✓ Redes sociales</li>
                  <li className="flex items-center">✓ Soporte prioritario</li>
                </ul>
                <button className="w-full bg-navy text-white py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pie de página */}
      <footer className="bg-navy-dark text-crema/80 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Realicó PyMEs</h3>
              <p className="font-body text-crema/60 text-sm">
                El directorio oficial de negocios y servicios de Realicó, La Pampa.
              </p>
            </div>
            
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" onClick={volverAlInicio} className="hover:text-dorado-claro transition cursor-pointer">Inicio</a></li>
                <li><a href="#categorias" className="hover:text-dorado-claro transition">Categorías</a></li>
                <li><button onClick={() => setMostrarFormulario(true)} className="hover:text-dorado-claro transition">Soy Comercio</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">Contacto</h3>
              <p className="font-body text-crema/60 text-sm">
                ¿Tenés un comercio?<br />
                Sumate al directorio y llegá a más clientes.
              </p>
            </div>
          </div>
          
          <div className="border-t border-crema/20 pt-8 text-center text-sm font-body text-crema/60">
            <p>© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
            <button 
              onClick={() => setMostrarAdmin(true)}
              className="mt-2 text-crema/40 hover:text-crema/70 text-xs"
            >
              Acceso Admin
            </button>
          </div>
        </div>
      </footer>

      {mostrarFormulario && (
        <FormularioComercio onClose={() => setMostrarFormulario(false)} />
      )}

      {mostrarAdmin && <AdminPanel onClose={() => setMostrarAdmin(false)} />}
    </div>
  )
}

export default App
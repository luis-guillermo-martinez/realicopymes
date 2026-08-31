import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import FormularioComercio from './FormularioComercio'
import AdminPanel from './AdminPanel'
import FichaDetalle from './FichaDetalle'
import Mapa from './Mapa'
import DashboardComercio from './DashboardComercio'
import Promociones from './Promociones'

// 🆕 FÓRMULA DE HAVERSINE PARA CALCULAR DISTANCIA EN KM
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

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
  const [planSeleccionado, setPlanSeleccionado] = useState('Gratuito')
  
  // 🆕 Estados para "Cerca de mí"
  const [cercaDeMi, setCercaDeMi] = useState(false)
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null)
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
  
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

  // 🆕 FUNCIÓN PARA ACTIVAR GEOLOCALIZACIÓN
  const activarCercaDeMi = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.')
      return
    }
    setCargandoUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacionUsuario({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setCercaDeMi(true)
        setCategoriaSeleccionada(null) // Limpiar filtros al activar
        setBusqueda('')
        setCargandoUbicacion(false)
      },
      (error) => {
        alert('No se pudo obtener tu ubicación. Asegúrate de dar permisos de ubicación en tu navegador/celular.')
        setCargandoUbicacion(false)
      }
    )
  }

  const desactivarCercaDeMi = () => {
    setCercaDeMi(false)
    setUbicacionUsuario(null)
  }

  useEffect(() => {
    let resultados = negocios

    // 1. Filtro por búsqueda
    if (busqueda) {
      resultados = resultados.filter(n =>
        n.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (n.tipo && n.tipo.toLowerCase().includes(busqueda.toLowerCase()))
      )
    }
    
    // 2. Filtro por categoría
    if (categoriaSeleccionada) {
      resultados = resultados.filter(n => {
        const cats = n.categoria ? n.categoria.split(',').map(c => c.trim()) : []
        return cats.includes(categoriaSeleccionada)
      })
    }

    // 3. 🆕 ORDENAMIENTO POR DISTANCIA (si está activo)
    let resultadosFinales = [...resultados]
    if (cercaDeMi && ubicacionUsuario) {
      resultadosFinales = resultadosFinales.map(n => {
        if (n.latitud && n.longitud) {
          const dist = calcularDistancia(ubicacionUsuario.lat, ubicacionUsuario.lng, n.latitud, n.longitud)
          return { ...n, distancia: dist }
        }
        return { ...n, distancia: 9999 } // Sin coordenadas, va al final
      }).sort((a, b) => a.distancia - b.distancia)
    } else {
      // Orden normal por plan si no está "Cerca de mí"
      resultadosFinales = ordenarPorPlan(resultadosFinales)
    }

    setNegociosFiltrados(resultadosFinales)
  }, [busqueda, categoriaSeleccionada, negocios, cercaDeMi, ubicacionUsuario])

  const todasLasCategorias = negocios.flatMap(n => n.categoria ? n.categoria.split(',').map(c => c.trim()) : [])
  const categorias = [...new Set(todasLasCategorias)].filter(c => c !== '')

  const negociosPatrocinados = negocios.filter(n => n.plan === 'Patrocinado').slice(0, 6)
  const negociosDestacados = negocios.filter(n => n.plan === 'Destacado')

  const bordeFoto = (n) =>
    n.plan === 'Patrocinado' ? 'border-navy' :
    n.plan === 'Destacado' ? 'border-dorado' :
    'border-navy/20'

  const handleCategoriaClick = (categoria) => {
    desactivarCercaDeMi() // Desactivar cerca de mí si elige categoría
    setCategoriaSeleccionada(categoria)
    setTimeout(() => {
      const element = document.getElementById('resultados-negocios')
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const volverAlInicio = () => {
    desactivarCercaDeMi()
    setCategoriaSeleccionada(null)
    setBusqueda('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleVerFicha = (slug) => {
    navigate(`/ficha/${slug}`)
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* HEADER */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center flex-shrink-0">
              <div onClick={volverAlInicio} className="cursor-pointer flex items-center">
                <img src="/logo.png" alt="MiPin" className="h-10 md:h-12 w-auto" />
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 font-body font-semibold">
              <a href="#" onClick={volverAlInicio} className="text-navy hover:text-dorado transition cursor-pointer">Inicio</a>
              <a href="#categorias" className="text-navy hover:text-dorado transition">Categorías</a>
              <a href="/promociones" className="text-navy hover:text-dorado transition">Promociones</a>
              <a href="#planes" className="text-navy hover:text-dorado transition">Planes</a>
              <a href="/mapa" className="text-navy hover:text-dorado transition">Mapa</a>
              <button onClick={() => setMostrarFormulario(true)} className="bg-navy text-crema px-6 py-2 rounded-lg font-bold hover:bg-navy-dark transition">Publicar</button>
            </div>

            <button onClick={() => setMostrarMenuMovil(!mostrarMenuMovil)} className="md:hidden flex items-center justify-center p-2 text-navy bg-crema border border-navy/10 rounded-lg hover:bg-navy/5 transition" aria-label="Abrir menú">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mostrarMenuMovil ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mostrarMenuMovil && (
            <div className="md:hidden mt-4 pb-4 border-t border-navy/10 pt-4 animate-fade-in">
              <div className="flex flex-col space-y-3 font-body font-semibold">
                <a href="#" onClick={() => { volverAlInicio(); setMostrarMenuMovil(false); }} className="text-navy hover:text-dorado transition py-2 px-2 rounded hover:bg-navy/5">Inicio</a>
                <a href="#categorias" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2 px-2 rounded hover:bg-navy/5">Categorías</a>
                <a href="/promociones" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2 px-2 rounded hover:bg-navy/5">Promociones</a>
                <a href="#planes" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2 px-2 rounded hover:bg-navy/5">Planes</a>
                <a href="/mapa" onClick={() => setMostrarMenuMovil(false)} className="text-navy hover:text-dorado transition py-2 px-2 rounded hover:bg-navy/5">Mapa</a>
                <button onClick={() => { setMostrarFormulario(true); setMostrarMenuMovil(false); }} className="bg-navy text-crema px-6 py-3 rounded-lg font-bold hover:bg-navy-dark transition text-center mt-2">Publicar</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="bg-gradient-to-b from-navy to-navy-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl mb-4 tracking-wide">A un pin de distancia</h1>
          <p className="font-body text-xl md:text-2xl mb-8 text-dorado-claro max-w-2xl mx-auto font-medium">
            Conectamos a la comunidad con los mejores servicios y profesionales locales.
          </p>
          
          <div className="max-w-3xl mx-auto bg-crema p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="¿Qué buscás? Ejemplo: Panadería, Abogado, Miel..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); desactivarCercaDeMi(); }}
              className="flex-1 p-4 rounded-md text-navy text-lg focus:outline-none focus:ring-2 focus:ring-dorado font-body"
            />
            
            {/* 🆕 BOTÓN CERCA DE MÍ */}
            <button 
              onClick={cercaDeMi ? desactivarCercaDeMi : activarCercaDeMi}
              disabled={cargandoUbicacion}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-md font-body font-bold text-lg transition whitespace-nowrap ${
                cercaDeMi 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-dorado text-navy hover:bg-dorado-claro'
              }`}
            >
              {cargandoUbicacion ? (
                'Ubicando...'
              ) : cercaDeMi ? (
                <>📍 Mostrando cercanos</>
              ) : (
                <>📍 Cerca de mí</>
              )}
            </button>
          </div>
          {cercaDeMi && (
            <p className="text-crema/80 text-sm mt-3 animate-pulse">
              Ordenado por distancia desde tu ubicación actual.
            </p>
          )}
        </div>
      </header>

      {/* AVISO SI NO HAY RESULTADOS POR CERCANÍA */}
      {cercaDeMi && negociosFiltrados.length > 0 && negociosFiltrados[0].distancia === 9999 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 container mx-auto mt-4 rounded">
          <p className="font-bold">Nota:</p>
          <p>Algunos negocios no tienen coordenadas registradas y aparecen al final de la lista.</p>
        </div>
      )}

      {/* RESULTADOS (Se muestra siempre si hay búsqueda, categoría o "cerca de mí" activo) */}
      {(busqueda || categoriaSeleccionada || cercaDeMi) && (
        <section id="resultados-negocios" className="container mx-auto px-4 py-16 flex-grow">
          <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <button onClick={volverAlInicio} className="font-body text-navy hover:text-dorado font-medium mb-2 flex items-center">← Volver al inicio</button>
              <h2 className="font-display text-3xl md:text-4xl text-navy tracking-wide">
                {cercaDeMi ? '📍 Negocios cerca de ti' : categoriaSeleccionada ? `Resultados en "${categoriaSeleccionada}"` : `Resultados para "${busqueda}"`}
              </h2>
              <p className="font-body text-navy/70 text-lg">{negociosFiltrados.length} resultado{negociosFiltrados.length !== 1 ? 's' : ''}</p>
            </div>
            {cercaDeMi && (
              <button onClick={desactivarCercaDeMi} className="text-sm text-navy/60 hover:text-navy underline">
                Ver todos los negocios
              </button>
            )}
          </div>

          {negociosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-navy/70 text-lg mb-4">No se encontraron resultados.</p>
              <button onClick={volverAlInicio} className="bg-navy text-white px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-light transition">Ver todas las categorías</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {negociosFiltrados.map((n) => {
                const esGratuito = n.plan === 'Gratuito';
                return (
                  <div 
                    key={n.id} 
                    onClick={() => !esGratuito && handleVerFicha(n.slug)} 
                    className={`bg-white p-6 rounded-lg shadow-md transition duration-300 border-2 relative ${
                      esGratuito 
                        ? 'border-gray-200' 
                        : n.plan === 'Patrocinado' 
                          ? 'border-navy cursor-pointer hover:shadow-xl' 
                          : n.plan === 'Destacado' 
                            ? 'border-dorado cursor-pointer hover:shadow-xl' 
                            : 'border-navy/10 cursor-pointer hover:shadow-xl'
                    }`}
                  >
                    {/* 🆕 BADGE DE DISTANCIA */}
                    {cercaDeMi && n.distancia !== undefined && n.distancia < 9999 && (
                      <div className="absolute -top-3 right-4 bg-navy text-crema text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                        📍 a {n.distancia.toFixed(1)} km
                      </div>
                    )}

                    {!esGratuito && n.plan && (
                      <span className={`font-label inline-block text-xs px-2 py-1 rounded uppercase tracking-wider mb-3 ${
                        n.plan === 'Patrocinado' ? 'bg-navy text-crema' :
                        n.plan === 'Destacado' ? 'bg-dorado text-navy' :
                        'bg-crema text-navy'
                      }`}>
                        {n.plan}
                      </span>
                    )}

                    {!esGratuito && n.foto_portada && (
                      <div className="flex justify-center mb-4">
                        <img src={n.foto_portada} alt={n.nombre} className={`w-24 h-24 object-cover rounded-full border-4 shadow-md ${bordeFoto(n)}`} />
                      </div>
                    )}

                    <h3 className="font-display text-navy text-3xl mb-2 tracking-wide">{n.nombre}</h3>
                    <p className="font-label text-dorado font-semibold text-sm mb-3 uppercase tracking-wide">{n.categoria}</p>

                    {esGratuito ? (
                      <div className="space-y-2">
                        {n.direccion && (
                          <p className="font-body text-navy/70 text-base flex items-center gap-2">
                            <span>📍</span> {n.direccion}
                          </p>
                        )}
                        <p className="font-body text-navy/40 text-xs flex items-center gap-1">
                          <span>👁</span> {n.vistas || 0} vistas
                        </p>
                      </div>
                    ) : (
                      <>
                        {n.tipo && <p className="font-body text-navy/60 text-xs mb-3">{n.tipo}</p>}
                        <p className="font-body text-navy/70 text-base mb-4 line-clamp-2">{n.descripcion}</p>
                        <button className="w-full text-center bg-navy text-crema py-2 rounded-lg font-body font-medium text-sm hover:bg-navy-dark transition">
                          Ver ficha completa →
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECCIONES POR DEFECTO (Solo si NO hay búsqueda, categoría ni "cerca de mí") */}
      {!busqueda && !categoriaSeleccionada && !cercaDeMi && (
        <>
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
                    <div key={n.id} onClick={() => handleVerFicha(n.slug)} className="bg-white p-8 rounded-xl shadow-lg border-2 border-navy hover:shadow-2xl transition duration-300 relative overflow-hidden cursor-pointer">
                      <div className="absolute top-0 right-0 bg-navy text-crema font-label font-bold text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">Patrocinador</div>
                      {n.foto_portada && (
                        <div className="flex justify-center mb-4">
                          <img src={n.foto_portada} alt={n.nombre} className={`w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-4 shadow-md ${bordeFoto(n)}`} />
                        </div>
                      )}
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
          <section id="categorias" className="container mx-auto px-4 py-16">
            <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 text-center tracking-wide">Explora por Categoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categorias.map((categoria, index) => (
                <div key={index} onClick={() => handleCategoriaClick(categoria)} className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center border-2 border-transparent hover:border-dorado cursor-pointer group">
                  <h3 className="font-label font-bold text-navy text-xl mb-3 group-hover:text-dorado transition uppercase tracking-wide">{categoria}</h3>
                  <p className="font-body text-dorado font-medium text-sm">Ver más →</p>
                </div>
              ))}
            </div>
          </section>

          {/* DESTACADOS */}
          {negociosDestacados.length > 0 && (
            <section className="bg-papel py-16 border-t border-dorado/30">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <span className="font-label bg-dorado text-navy px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Destacados</span>
                  <h2 className="font-display text-4xl md:text-5xl text-navy mt-4 mb-4 tracking-wide">Negocios y Servicios Destacados</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {negociosDestacados.map((n) => (
                    <div key={n.id} onClick={() => handleVerFicha(n.slug)} className="bg-white p-8 rounded-xl shadow-lg border-2 border-dorado hover:shadow-2xl transition duration-300 relative overflow-hidden cursor-pointer">
                      <div className="absolute top-0 right-0 bg-dorado text-navy font-label font-bold text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">Destacado</div>
                      {n.foto_portada && (
                        <div className="flex justify-center mb-4">
                          <img src={n.foto_portada} alt={n.nombre} className={`w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-4 shadow-md ${bordeFoto(n)}`} />
                        </div>
                      )}
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

          {/* PLANES */}
          <section id="planes" className="bg-navy text-white py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-4xl md:text-5xl text-center mb-4 tracking-wide">Elegí tu Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                <div className="bg-crema text-navy p-6 rounded-xl shadow-lg flex flex-col">
                  <h3 className="font-display text-2xl mb-2 tracking-wide">Gratuito</h3>
                  <p className="font-body text-navy/70 mb-4 font-semibold">$0/mes</p>
                  <button onClick={() => { setMostrarFormulario(true); setPlanSeleccionado('Gratuito'); }} className="w-full bg-navy/20 text-navy py-2 rounded-lg font-body font-bold cursor-pointer text-sm hover:bg-navy/30 transition mt-auto">Seleccionar</button>
                </div>
                <div className="bg-crema text-navy p-6 rounded-xl shadow-lg flex flex-col">
                  <h3 className="font-display text-2xl mb-2 tracking-wide">Estándar</h3>
                  <p className="font-body text-navy/70 mb-4 font-semibold">$10.000/mes</p>
                  <button onClick={() => { setMostrarFormulario(true); setPlanSeleccionado('Estándar'); }} className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm mt-auto">Seleccionar</button>
                </div>
                <div className="bg-dorado text-navy p-6 rounded-xl shadow-2xl transform scale-105 border-4 border-dorado-claro flex flex-col">
                  <div className="font-label bg-navy text-crema text-center py-1 rounded mb-3 font-bold uppercase tracking-wider text-xs">Más Popular</div>
                  <h3 className="font-display text-2xl mb-2 tracking-wide">Destacado</h3>
                  <p className="font-body text-navy/80 mb-4 font-semibold">$25.000/mes</p>
                  <button onClick={() => { setMostrarFormulario(true); setPlanSeleccionado('Destacado'); }} className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm mt-auto">Seleccionar</button>
                </div>
                <div className="bg-crema text-navy p-6 rounded-xl shadow-lg flex flex-col">
                  <h3 className="font-display text-2xl mb-2 tracking-wide">Patrocinado</h3>
                  <p className="font-body text-navy/70 mb-4 font-semibold">$75.000/mes</p>
                  <button onClick={() => { setMostrarFormulario(true); setPlanSeleccionado('Patrocinado'); }} className="w-full bg-navy text-crema py-2 rounded-lg font-body font-bold hover:bg-navy-dark transition text-sm mt-auto">Seleccionar</button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-dorado py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="font-display text-4xl md:text-5xl text-navy mb-4 tracking-wide">¿Tenés algo que ofrecer?</h2>
              <button onClick={() => setMostrarFormulario(true)} className="bg-navy text-crema px-10 py-4 rounded-lg font-body font-bold text-xl hover:bg-navy-dark transition shadow-lg">¡Quiero Publicar!</button>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="bg-navy-dark text-crema/80 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div className="md:col-span-2">
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">MiPin</h3>
              <p className="font-body text-crema/60 text-sm">El directorio de comercios, servicios, profesiones, productores y emprendimientos.</p>
            </div>
            <div>
              <h3 className="font-display text-dorado text-xl mb-4 tracking-wide">Enlaces</h3>
              <ul className="space-y-2 text-sm font-body">
                <li><button onClick={volverAlInicio} className="hover:text-dorado-claro transition">Inicio</button></li>
                <li><a href="#categorias" className="hover:text-dorado-claro transition">Categorías</a></li>
                <li><a href="/promociones" className="hover:text-dorado-claro transition">Promociones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-dorado text-xl mb-4 tracking-wide">Comercios</h3>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="/dashboard" className="text-crema/80 hover:text-dorado-claro transition flex items-center justify-center md:justify-start gap-2"><span>🔒</span> Accedé a tu Panel</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-crema/20 pt-8 text-center text-sm font-body text-crema/60">
            <p>© 2026 MiPin. A un pin de distancia.</p>
            <button onClick={() => setMostrarAdmin(true)} className="mt-2 text-crema/40 hover:text-crema/70 text-xs">Acceso Admin</button>
          </div>
        </div>
      </footer>

      {mostrarFormulario && <FormularioComercio onClose={() => setMostrarFormulario(false)} planInicial={planSeleccionado} />}
      {mostrarAdmin && <AdminPanel onClose={() => setMostrarAdmin(false)} />}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ficha/:slug" element={<FichaDetalle />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/dashboard" element={<DashboardComercio />} />
      <Route path="/promociones" element={<Promociones />} />
    </Routes>
  )
}

export default App
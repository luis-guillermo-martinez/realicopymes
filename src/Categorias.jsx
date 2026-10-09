import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import FormularioComercio from './FormularioComercio'
import AdminPanel from './AdminPanel'

// FÓRMULA DE HAVERSINE
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const ABECEDARIO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

function Categorias() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [letraFiltro, setLetraFiltro] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [cercaDeMi, setCercaDeMi] = useState(false)
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null)
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
  const [negocios, setNegocios] = useState([])
  const [negociosFiltrados, setNegociosFiltrados] = useState([])

  useEffect(() => {
    cargarCategorias()
    cargarNegocios()
  }, [])

  const cargarNegocios = async () => {
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('activo', true)
        .eq('suspendido', false)
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) setNegocios(data)
    } catch (err) {
      console.error('Error cargando negocios:', err)
    }
  }

  const cargarCategorias = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('negocios')
        .select('categoria, activo, suspendido')
        .eq('activo', true)
        .eq('suspendido', false)

      if (error) throw error

      const conteo = {}
      data.forEach(n => {
        if (n.categoria) {
          const cats = n.categoria.split(',').map(c => c.trim()).filter(c => c !== '')
          cats.forEach(cat => {
            conteo[cat] = (conteo[cat] || 0) + 1
          })
        }
      })

      const categoriasArray = Object.keys(conteo).map(nombre => ({
        nombre,
        cantidad: conteo[nombre]
      })).sort((a, b) => a.nombre.localeCompare(b.nombre))

      setCategorias(categoriasArray)
    } catch (err) {
      console.error('Error cargando categorías:', err)
    } finally {
      setCargando(false)
    }
  }

  const handleVerCategoria = (categoria) => {
    navigate(`/?categoria=${encodeURIComponent(categoria)}`)
  }

  const volverAlInicio = () => {
    navigate('/')
  }

  const activarCercaDeMi = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.')
      return
    }
    setCargandoUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacionUsuario({ lat: position.coords.latitude, lng: position.coords.longitude })
        setCercaDeMi(true)
        setBusqueda('')
        setCargandoUbicacion(false)
      },
      () => {
        alert('No se pudo obtener tu ubicación.')
        setCargandoUbicacion(false)
      }
    )
  }

  const desactivarCercaDeMi = () => {
    setCercaDeMi(false)
    setUbicacionUsuario(null)
  }

  useEffect(() => {
    if (cercaDeMi && ubicacionUsuario) {
      const conDistancia = negocios.map(n => {
        if (n.latitud && n.longitud) {
          const dist = calcularDistancia(ubicacionUsuario.lat, ubicacionUsuario.lng, n.latitud, n.longitud)
          return { ...n, distancia: dist }
        }
        return { ...n, distancia: 9999 }
      }).sort((a, b) => a.distancia - b.distancia)
      setNegociosFiltrados(conDistancia)
    } else {
      setNegociosFiltrados([])
    }
  }, [cercaDeMi, ubicacionUsuario, negocios])

  const categoriasFiltradas = categorias.filter(c => {
    const coincideBusqueda = !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideLetra = !letraFiltro || c.nombre.toUpperCase().startsWith(letraFiltro)
    return coincideBusqueda && coincideLetra
  })

  const letrasDisponibles = new Set(categorias.map(c => {
    const primera = c.nombre.charAt(0).toUpperCase()
    if (primera === 'Ñ') return 'Ñ'
    return primera.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }))

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
              <a href="/categorias" className="text-dorado transition">Categorías</a>
              <a href="/promociones" className="text-navy hover:text-dorado transition">Promociones</a>
              <a href="/#planes" className="text-navy hover:text-dorado transition">Planes</a>
              <a href="/mapa" className="text-navy hover:text-dorado transition">Mapa</a>
              <button onClick={() => setMostrarFormulario(true)} className="bg-navy text-crema px-6 py-2 rounded-lg font-bold hover:bg-navy-dark transition">Publicar</button>
            </div>

            <button onClick={volverAlInicio} className="md:hidden flex items-center justify-center p-2 text-navy bg-crema border border-navy/10 rounded-lg hover:bg-navy/5 transition" aria-label="Volver">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 🆕 HERO COMPACTO (sin subtítulo, menos padding) */}
      <header className="bg-gradient-to-b from-navy to-navy-dark text-white py-8 md:py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl mb-4 tracking-wide">Todas las Categorías</h1>
          
          <div className="max-w-3xl mx-auto bg-crema p-2.5 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Buscar categoría... Ej: Panadería, Abogado, Miel..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setLetraFiltro(null) }}
              className="flex-1 p-3 rounded-md text-navy text-base focus:outline-none focus:ring-2 focus:ring-dorado font-body"
            />
            <button 
              onClick={cercaDeMi ? desactivarCercaDeMi : activarCercaDeMi}
              disabled={cargandoUbicacion}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md font-body font-bold text-base transition whitespace-nowrap ${
                cercaDeMi ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-dorado text-navy hover:bg-dorado-claro'
              }`}
            >
              {cargandoUbicacion ? 'Ubicando...' : cercaDeMi ? '📍 Cercanos' : '📍 Cerca de mí'}
            </button>
          </div>
          {cercaDeMi && (
            <p className="text-crema/80 text-xs mt-2 animate-pulse">
              Ordenado por distancia desde tu ubicación actual.
            </p>
          )}
        </div>
      </header>

      {/* RESULTADOS DE "CERCA DE MÍ" */}
      {cercaDeMi && negociosFiltrados.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <h2 className="font-display text-2xl md:text-3xl text-navy tracking-wide mb-1">📍 Negocios cerca de ti</h2>
            <p className="font-body text-navy/70 text-sm">{negociosFiltrados.length} resultado{negociosFiltrados.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {negociosFiltrados.slice(0, 9).map((n) => {
              const esGratuito = n.plan === 'Gratuito'
              return (
                <div 
                  key={n.id} 
                  onClick={() => !esGratuito && navigate(`/ficha/${n.slug}`)}
                  className={`bg-white p-4 rounded-lg shadow-md transition duration-300 border-2 relative ${
                    esGratuito ? 'border-gray-200' : n.plan === 'Patrocinado' ? 'border-navy cursor-pointer hover:shadow-xl' : n.plan === 'Destacado' ? 'border-dorado cursor-pointer hover:shadow-xl' : 'border-navy/10 cursor-pointer hover:shadow-xl'
                  }`}
                >
                  {n.distancia < 9999 && (
                    <div className="absolute -top-3 right-4 bg-navy text-crema text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                      📍 a {n.distancia.toFixed(1)} km
                    </div>
                  )}
                  {!esGratuito && n.foto_portada && (
                    <div className="flex justify-center mb-2">
                      <img src={n.foto_portada} alt={n.nombre} className="w-16 h-16 object-cover rounded-full border-4 border-dorado shadow-md" />
                    </div>
                  )}
                  <h3 className="font-display text-navy text-xl mb-1 tracking-wide text-center">{n.nombre}</h3>
                  <p className="font-label text-dorado font-semibold text-xs mb-2 uppercase tracking-wide text-center">{n.categoria}</p>
                  {!esGratuito && n.descripcion && (
                    <p className="font-body text-navy/70 text-xs mb-2 line-clamp-2 text-center">{n.descripcion}</p>
                  )}
                  {!esGratuito && (
                    <button className="w-full text-center bg-navy text-crema py-1.5 rounded-lg font-body font-medium text-xs hover:bg-navy-dark transition">
                      Ver ficha →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center mt-6">
            <button onClick={volverAlInicio} className="bg-navy text-crema px-5 py-2 rounded-lg font-body font-bold text-sm hover:bg-navy-dark transition">
              Ver todos los negocios en el inicio →
            </button>
          </div>
        </section>
      )}

      {/* CONTENIDO PRINCIPAL (solo si NO está "cerca de mí") */}
      {!cercaDeMi && (
        <main className="container mx-auto px-4 py-6 flex-grow">
          
          {/* ABECEDARIO */}
          <div className="mb-4 bg-white p-3 rounded-xl shadow-md">
            <p className="font-label text-navy/60 text-[10px] uppercase tracking-wide font-bold mb-2 text-center">Filtrar por letra inicial</p>
            <div className="flex flex-wrap gap-1 justify-center">
              <button
                onClick={() => setLetraFiltro(null)}
                className={`px-2.5 py-1 rounded-lg font-body font-bold text-xs transition ${
                  !letraFiltro ? 'bg-navy text-crema shadow-md' : 'bg-crema text-navy hover:bg-dorado/20'
                }`}
              >
                Todas
              </button>
              {ABECEDARIO.map(letra => {
                const disponible = letrasDisponibles.has(letra)
                return (
                  <button
                    key={letra}
                    onClick={() => disponible && setLetraFiltro(letraFiltro === letra ? null : letra)}
                    disabled={!disponible}
                    className={`px-2.5 py-1 rounded-lg font-body font-bold text-xs transition ${
                      letraFiltro === letra 
                        ? 'bg-dorado text-navy shadow-md' 
                        : disponible 
                          ? 'bg-crema text-navy hover:bg-dorado/20 cursor-pointer'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {letra}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4 text-center">
            <p className="font-body text-navy/70 text-sm">
              {categoriasFiltradas.length} {categoriasFiltradas.length === 1 ? 'categoría encontrada' : 'categorías encontradas'}
              {letraFiltro && <span className="font-bold text-dorado"> · Letra "{letraFiltro}"</span>}
            </p>
          </div>

          {cargando ? (
            <div className="text-center py-12">
              <p className="font-body text-navy text-xl animate-pulse">Cargando categorías...</p>
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-navy/70 text-lg mb-4">
                {busqueda || letraFiltro ? 'No se encontraron categorías con ese filtro.' : 'Aún no hay categorías registradas.'}
              </p>
              {(busqueda || letraFiltro) && (
                <button 
                  onClick={() => { setBusqueda(''); setLetraFiltro(null) }} 
                  className="bg-navy text-white px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-light transition"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {categoriasFiltradas.map((cat, index) => (
                <div 
                  key={index} 
                  onClick={() => handleVerCategoria(cat.nombre)}
                  className="bg-white p-2.5 md:p-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center border-2 border-transparent hover:border-dorado cursor-pointer group"
                >
                  <h3 className="font-label font-bold text-navy text-xs md:text-sm mb-1.5 group-hover:text-dorado transition uppercase tracking-wide leading-tight min-h-[2rem] flex items-center justify-center">
                    {cat.nombre}
                  </h3>
                  <div className="inline-block bg-dorado/10 text-dorado font-bold text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mb-1.5">
                    {cat.cantidad} {cat.cantidad === 1 ? 'negocio' : 'negocios'}
                  </div>
                  <div className="text-dorado font-body font-medium text-[10px] md:text-xs group-hover:underline">
                    Ver más →
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
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
                <li><a href="/categorias" className="hover:text-dorado-claro transition">Categorías</a></li>
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

      {mostrarFormulario && <FormularioComercio onClose={() => setMostrarFormulario(false)} planInicial="Gratuito" />}
      {mostrarAdmin && <AdminPanel onClose={() => setMostrarAdmin(false)} />}
    </div>
  )
}

export default Categorias
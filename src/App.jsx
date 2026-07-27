import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import FormularioComercio from './FormularioComercio'
function App() {
  const [busqueda, setBusqueda] = useState('')
  const [negocios, setNegocios] = useState([])
  const [negociosFiltrados, setNegociosFiltrados] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
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

  // Separar destacados y gratuitos
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación */}
      <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              className="bg-yellow-500 text-blue-900 font-bold text-xl px-4 py-2 rounded cursor-pointer" 
              onClick={volverAlInicio}
            >
              REALICÓ PyMEs
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#" onClick={volverAlInicio} className="hover:text-yellow-400 transition font-medium cursor-pointer">Inicio</a>
            <a href="#categorias" className="hover:text-yellow-400 transition font-medium">Categorías</a>
            <a href="#planes" className="hover:text-yellow-400 transition font-medium">Cómo Funciona</a>
            <button 
  onClick={() => setMostrarFormulario(true)}
  className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
>
  Soy Comercio
</button>
          </div>
        </div>
      </nav>

      {/* Sección Principal (Hero) */}
      <header className="bg-gradient-to-b from-blue-800 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            El directorio de negocios de Realicó
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Conectamos a la comunidad con los mejores servicios y profesionales locales de La Pampa.
          </p>
          
          <div className="max-w-3xl mx-auto bg-white p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué buscás? Ejemplo: Panadería, Cerrajero, Farmacia..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 p-4 rounded-md text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-yellow-500 text-blue-900 font-bold py-4 px-10 rounded-md hover:bg-yellow-400 transition text-lg">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN 1: TARJETAS DE CATEGORÍAS (Solo en home) */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="categorias" className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Explora por Categoría</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Encontrá rápidamente los servicios que necesitás en Realicó y la región.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((categoria, index) => (
              <div 
                key={index}
                onClick={() => handleCategoriaClick(categoria)}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center border-2 border-transparent hover:border-blue-800 cursor-pointer group"
              >
                <h3 className="font-bold text-gray-800 text-xl mb-3 group-hover:text-blue-800 transition">{categoria}</h3>
                <p className="text-blue-600 font-medium text-sm">Ver comercios →</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: COMERCIOS DESTACADOS (Solo en home) */}
      {!categoriaSeleccionada && !busqueda && negociosDestacados.length > 0 && (
        <section className="bg-yellow-50 py-16 border-t border-yellow-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="bg-yellow-500 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">DESTACADOS</span>
              <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-4">Comercios Destacados</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Estos comercios invierten en su visibilidad. ¡Apoyá el comercio local!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {negociosDestacados.map((negocio) => (
                <div key={negocio.id} className="bg-white p-8 rounded-xl shadow-lg border-2 border-yellow-400 hover:shadow-2xl transition duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-yellow-500 text-blue-900 px-4 py-1 font-bold text-sm rounded-bl-lg">
                    DESTACADO
                  </div>

                  <h3 className="font-bold text-gray-800 text-2xl mb-2 mt-2">{negocio.nombre}</h3>
                  <p className="text-blue-800 font-medium text-sm mb-4">{negocio.categoria}</p>
                  <p className="text-gray-600 text-sm mb-6">{negocio.descripcion}</p>
                  
                  <div className="space-y-3 text-sm">
                    {negocio.direccion && (
                      <p className="text-gray-700 flex items-start">
                        <span className="mr-2"></span> {negocio.direccion}
                      </p>
                    )}
                    {negocio.telefono && (
                      <p className="text-gray-700 flex items-start">
                        <span className="mr-2">📞</span> {negocio.telefono}
                      </p>
                    )}
                    {negocio.horario && (
                      <p className="text-gray-700 flex items-start">
                        <span className="mr-2">🕐</span> {negocio.horario}
                      </p>
                    )}
                  </div>

                  {negocio.whatsapp && (
                    <a 
                      href={`https://wa.me/${negocio.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 block text-center bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-bold"
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

      {/* SECCIÓN 3: RESULTADOS DE BÚSQUEDA O CATEGORÍA (Solo cuando hay búsqueda o categoría) */}
      {(categoriaSeleccionada || busqueda) && (
        <section id="resultados-negocios" className="container mx-auto px-4 py-16 flex-grow">
          <div className="mb-8">
            <button 
              onClick={volverAlInicio}
              className="text-blue-800 hover:text-blue-600 font-medium mb-4 flex items-center"
            >
              ← Volver al inicio
            </button>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {categoriaSeleccionada 
                ? `Comercios en "${categoriaSeleccionada}"` 
                : `Resultados para "${busqueda}"`}
            </h2>
          </div>
          
          {negociosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No se encontraron negocios con esos criterios.</p>
              <button 
                onClick={volverAlInicio}
                className="bg-blue-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Ver todas las categorías
              </button>
            </div>
          ) : (
            <div>
              {/* Mostrar destacados primero si hay */}
              {negociosDestacados.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded text-sm mr-3">DESTACADOS</span>
                    Comercios Destacados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negociosDestacados.map((negocio) => (
                      <div key={negocio.id} className="bg-white p-6 rounded-lg shadow-lg border-2 border-yellow-400 hover:shadow-xl transition duration-300 relative">
                        <div className="absolute top-0 right-0 bg-yellow-500 text-blue-900 px-3 py-1 font-bold text-xs rounded-bl-lg">
                          DESTACADO
                        </div>
                        
                        <h3 className="font-bold text-gray-800 text-xl mb-2 mt-2">{negocio.nombre}</h3>
                        <p className="text-blue-800 font-medium text-sm mb-3">{negocio.categoria}</p>
                        <p className="text-gray-600 text-sm mb-4">{negocio.descripcion}</p>
                        
                        <div className="space-y-2 text-sm text-gray-700">
                          {negocio.direccion && <p>📍 {negocio.direccion}</p>}
                          {negocio.telefono && <p>📞 {negocio.telefono}</p>}
                          {negocio.horario && <p>🕐 {negocio.horario}</p>}
                        </div>

                        {negocio.whatsapp && (
                          <a 
                            href={`https://wa.me/${negocio.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium text-sm"
                          >
                            Contactar por WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mostrar gratuitos */}
              {negociosGratuitos.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {negociosDestacados.length > 0 ? 'Otros Comercios' : 'Todos los Comercios'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negociosGratuitos.map((negocio) => (
                      <div key={negocio.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border border-gray-200">
                        <h3 className="font-bold text-gray-800 text-xl mb-2">{negocio.nombre}</h3>
                        <p className="text-blue-800 font-medium text-sm mb-3">{negocio.categoria}</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{negocio.descripcion}</p>
                        
                        <div className="space-y-2 text-sm text-gray-700">
                          {negocio.direccion && <p>📍 {negocio.direccion}</p>}
                          {negocio.telefono && <p>📞 {negocio.telefono}</p>}
                          {negocio.horario && <p>🕐 {negocio.horario}</p>}
                        </div>

                        {negocio.whatsapp && (
                          <a 
                            href={`https://wa.me/${negocio.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium text-sm"
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

      {/* SECCIÓN 4: PLANES DE PATROCINIO (Solo en home) */}
      {!categoriaSeleccionada && !busqueda && (
        <section id="planes" className="bg-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Destacá tu Comercio</h2>
            <p className="text-center text-blue-100 mb-12 max-w-2xl mx-auto">
              Elegí el plan que mejor se adapte a tus necesidades y llegá a más clientes en Realicó.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plan Gratuito */}
              <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Gratuito</h3>
                <p className="text-gray-600 mb-6">Básico</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">✓ Ficha básica</li>
                  <li className="flex items-center">✓ Datos de contacto</li>
                  <li className="flex items-center">✓ Búsqueda en directorio</li>
                  <li className="flex items-center text-gray-400">✗ Destacado en categoría</li>
                  <li className="flex items-center text-gray-400">✗ Badge "Destacado"</li>
                </ul>
                <button className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-bold cursor-default">
                  Actual
                </button>
              </div>

              {/* Plan Destacado */}
              <div className="bg-yellow-500 text-blue-900 p-8 rounded-xl shadow-2xl transform scale-105 border-4 border-yellow-300">
                <div className="bg-blue-900 text-yellow-400 text-center py-1 rounded mb-4 font-bold">
                  MÁS POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2">Destacado</h3>
                <p className="text-blue-800 mb-6">$X.XXX/mes</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">✓ Todo lo del plan Gratuito</li>
                  <li className="flex items-center">✓ Aparecer primero en búsquedas</li>
                  <li className="flex items-center">✓ Badge "Destacado" visible</li>
                  <li className="flex items-center">✓ Sección especial en home</li>
                  <li className="flex items-center">✗ Patrocinio exclusivo</li>
                </ul>
                <button className="w-full bg-blue-900 text-yellow-400 py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                  Elegir Plan
                </button>
              </div>

              {/* Plan Patrocinado */}
              <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Patrocinado</h3>
                <p className="text-gray-600 mb-6">Premium</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">✓ Todo lo del plan Destacado</li>
                  <li className="flex items-center">✓ Banner en home</li>
                  <li className="flex items-center">✓ Logo en header</li>
                  <li className="flex items-center">✓ Redes sociales</li>
                  <li className="flex items-center">✓ Soporte prioritario</li>
                </ul>
                <button className="w-full bg-blue-800 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pie de página */}
      <footer className="bg-gray-800 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Realicó PyMEs</h3>
              <p className="text-gray-400 text-sm">
                El directorio oficial de negocios y servicios de Realicó, La Pampa.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" onClick={volverAlInicio} className="hover:text-yellow-400 transition cursor-pointer">Inicio</a></li>
                <li><a href="#categorias" className="hover:text-yellow-400 transition">Categorías</a></li>
                <button 
  onClick={() => setMostrarFormulario(true)}
  className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
>
  Soy Comercio
</button>
              </ul>
              {mostrarFormulario && (
  <FormularioComercio onClose={() => setMostrarFormulario(false)} />
)}
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
              <p className="text-gray-400 text-sm">
                ¿Tenés un comercio?<br />
                Sumate al directorio y llegá a más clientes.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
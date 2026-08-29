import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function FichaDetalle() {
  const { slug } = useParams() 
  const navigate = useNavigate()
  
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [fotoLightbox, setFotoLightbox] = useState(null)
  
  // Estados para reseñas
  const [resenas, setResenas] = useState([])
  const [promedio, setPromedio] = useState(0)
  const [nuevaResena, setNuevaResena] = useState({ nombre: '', comentario: '', estrellas: 5 })
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [mensajeResena, setMensajeResena] = useState('')

  useEffect(() => {
    cargarFicha()
  }, [slug]) 

  const cargarFicha = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('slug', slug)
        .single()
        
      if (error) throw error
      
      setNegocio(data)
      
      // Actualizar vistas
      await supabase
        .from('negocios')
        .update({ vistas: (data.vistas || 0) + 1 })
        .eq('id', data.id)

      // Cargar reseñas aprobadas para este negocio
      const { data: dataResenas } = await supabase
        .from('resenas')
        .select('*')
        .eq('negocio_id', data.id)
        .eq('aprobado', true)
        .order('created_at', { ascending: false })
        
      setResenas(dataResenas || [])
      if (dataResenas && dataResenas.length > 0) {
        const suma = dataResenas.reduce((acc, r) => acc + r.estrellas, 0)
        setPromedio(suma / dataResenas.length)
      } else {
        setPromedio(0)
      }

    } catch (err) {
      console.error('Error cargando ficha:', err)
      setError('No se encontró esta ficha.')
    } finally {
      setCargando(false)
    }
  }

  const getRedes = () => {
    if (!negocio.redes_sociales) return {}
    if (typeof negocio.redes_sociales === 'string') {
      try { return JSON.parse(negocio.redes_sociales) } catch { return {} }
    }
    return negocio.redes_sociales
  }

  const getGaleria = () => {
    if (!negocio.galeria) return []
    if (typeof negocio.galeria === 'string') {
      try { return JSON.parse(negocio.galeria) } catch { return [] }
    }
    return Array.isArray(negocio.galeria) ? negocio.galeria : []
  }

  const enviarResena = async (e) => {
    e.preventDefault()
    if (!nuevaResena.nombre.trim() || !nuevaResena.comentario.trim()) {
      setMensajeResena('❌ Completá nombre y comentario.')
      return
    }
    setEnviandoResena(true)
    setMensajeResena('')
    try {
      const { error } = await supabase.from('resenas').insert([{
        negocio_id: negocio.id,
        nombre: nuevaResena.nombre,
        comentario: nuevaResena.comentario,
        estrellas: nuevaResena.estrellas,
        aprobado: false
      }])
      if (error) throw error
      setMensajeResena('✅ ¡Gracias! Tu reseña será publicada tras revisión.')
      setNuevaResena({ nombre: '', comentario: '', estrellas: 5 })
    } catch (err) {
      setMensajeResena('❌ Error: ' + err.message)
    } finally {
      setEnviandoResena(false)
    }
  }

  const renderEstrellas = (cantidad, tamano = 'text-lg') => {
    return (
      <span className={`${tamano} text-dorado`}>
        {'★'.repeat(Math.round(cantidad))}
        {'☆'.repeat(5 - Math.round(cantidad))}
      </span>
    )
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <p className="font-body text-navy text-xl">Cargando ficha...</p>
      </div>
    )
  }

  if (error || !negocio) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Ficha no encontrada</h2>
          <p className="font-body text-navy/70 mb-6">{error || 'El negocio no existe o fue eliminado.'}</p>
          <button onClick={() => navigate('/')} className="bg-navy text-crema px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const redes = getRedes()
  const galeria = getGaleria()
  const plan = negocio.plan || 'Gratuito'
  const esGratuito = plan === 'Gratuito'
  const esEstándar = plan === 'Estándar'
  const esDestacado = plan === 'Destacado'
  const esPatrocinado = plan === 'Patrocinado'
  
  const fotosGaleria = galeria.slice(0, esPatrocinado ? 5 : 3)
  
  const tieneFoto = esEstándar || esDestacado || esPatrocinado
  const tieneWhatsApp = esEstándar || esDestacado || esPatrocinado
  const tieneHorario = esEstándar || esDestacado || esPatrocinado
  const tieneRedes = esDestacado || esPatrocinado
  const tieneMapa = esDestacado || esPatrocinado
  const tieneGalería = esDestacado || esPatrocinado
  const tieneVideo = esPatrocinado
  const tieneComoLlegar = esPatrocinado
  const bannerDeFondo = esPatrocinado && negocio.banner_url

  const planColors = {
    'Gratuito': { badge: 'bg-gray-300 text-gray-700' },
    'Estándar': { badge: 'bg-crema text-navy border border-navy/20' },
    'Destacado': { badge: 'bg-dorado text-navy' },
    'Patrocinado': { badge: 'bg-navy text-crema' }
  }
  const colors = planColors[plan] || planColors['Gratuito']

  const getMapsUrl = () => {
    if (negocio.google_maps_url) return negocio.google_maps_url
    if (negocio.direccion) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion + ', Realicó, La Pampa, Argentina')}`
    return null
  }

  const getMapsEmbedUrl = () => {
    if (negocio.direccion) return `https://www.google.com/maps?q=${encodeURIComponent(negocio.direccion + ', Realicó, La Pampa, Argentina')}&output=embed`
    return null
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* VISOR PANTALLA COMPLETA (EFECTO LUPA) */}
      {fotoLightbox && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setFotoLightbox(null)}>
          <style>{`@keyframes zoomLupa { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
          <button className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl font-bold transition" aria-label="Cerrar">×</button>
          <img src={fotoLightbox} alt={negocio.nombre} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" style={{ animation: 'zoomLupa 0.25s ease-out' }} onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-4 left-0 right-0 text-center text-crema/60 text-sm font-body">Tocá afuera o presioná Esc para cerrar</p>
        </div>
      )}

      {/* HEADER */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img src="/logo.png" alt="MiPin" className="h-10 md:h-12 w-auto" />
          </button>
          <button onClick={() => navigate('/')} className="font-body text-navy hover:text-dorado font-semibold flex items-center gap-2">← Volver al directorio</button>
        </div>
      </nav>

      {/* HERO: banner de fondo en Patrocinado */}
      <header className={`relative overflow-hidden text-white py-12 ${bannerDeFondo ? '' : 'bg-gradient-to-b from-navy to-navy-dark'}`}>
        {bannerDeFondo && (
          <>
            <img src={negocio.banner_url} alt={`Banner ${negocio.nombre}`} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy-dark/90" />
          </>
        )}
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* FOTO DE PERFIL REDONDA Y ESTÁTICA (ampliable con lupa) */}
            {tieneFoto && (
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {negocio.foto_portada ? (
                  <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 bg-white cursor-zoom-in ${esPatrocinado ? 'border-crema shadow-2xl' : esDestacado ? 'border-dorado shadow-xl' : 'border-white/30 shadow-lg'}`} onClick={() => setFotoLightbox(negocio.foto_portada)}>
                    <img src={negocio.foto_portada} alt={negocio.nombre} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center border-4 ${esPatrocinado ? 'border-crema bg-navy-light' : esDestacado ? 'border-dorado bg-navy-light' : 'border-white/30 bg-navy-light'}`}>
                    <span className="font-display text-6xl text-crema/50">{negocio.nombre.charAt(0)}</span>
                  </div>
                )}
              </div>
            )}
            <div className={`flex-1 ${!tieneFoto ? 'w-full' : ''} text-center md:text-left`}>
              <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                {(esDestacado || esPatrocinado) && (
                  <span className={`font-label px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>{plan}</span>
                )}
                <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.tipo}</span>
                {!esGratuito && negocio.categoria && (
                  <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.categoria}</span>
                )}
                {negocio.vistas > 0 && <span className="font-body text-crema/60 text-xs">👁 {negocio.vistas} vistas</span>}
              </div>
              <h1 className="font-display text-4xl md:text-6xl tracking-wide mb-3">{negocio.nombre}</h1>
              {esGratuito && <p className="font-label text-dorado-claro text-lg uppercase tracking-wide mb-4">{negocio.categoria}</p>}
              <p className="font-body text-crema/90 text-lg leading-relaxed">{negocio.descripcion}</p>
              {esGratuito && negocio.direccion && (
                <p className="font-body text-crema/80 mt-4 flex items-center gap-2 justify-center md:justify-start"><span>📍</span> {negocio.direccion}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* GALERÍA */}
            {tieneGalería && fotosGaleria.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {fotosGaleria.map((foto, idx) => (
                    <img key={idx} src={foto} alt={`${negocio.nombre} ${idx + 1}`} className="w-full h-48 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition" onClick={() => setFotoLightbox(foto)} />
                  ))}
                </div>
              </section>
            )}

            {/* VIDEO */}
            {tieneVideo && negocio.video_url && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Video</h2>
                <div className="aspect-video bg-navy/5 rounded-lg overflow-hidden">
                  <iframe src={negocio.video_url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={`Video de ${negocio.nombre}`} />
                </div>
              </section>
            )}

            {/* HORARIO */}
            {tieneHorario && negocio.horario && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Horario de atención</h2>
                <p className="font-body text-navy text-lg">{negocio.horario}</p>
              </section>
            )}

            {/* CONTACTO */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Contacto</h2>
              <div className="space-y-6">
                {negocio.telefono && (
                  <div className="border-b border-navy/10 pb-4">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="font-body text-navy text-lg font-semibold mb-3">{negocio.telefono}</p>
                    {tieneWhatsApp && negocio.whatsapp && (
                      <a href={`https://wa.me/${negocio.whatsapp}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition">Contactar por WhatsApp</a>
                    )}
                  </div>
                )}
                {negocio.email && (
                  <div>
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Email</p>
                    <p className="font-body text-navy text-lg font-semibold break-all mb-3">{negocio.email}</p>
                    <a href={`mailto:${negocio.email}?subject=Consulta desde MiPin - ${negocio.nombre}`} className="block w-full text-center bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">✉️ Enviar Email</a>
                  </div>
                )}
                
                {/* 🆕 SECCIÓN COMPARTIR FICHA */}
                <div className="border-t border-navy/10 pt-6 mt-6">
                  <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-3">Compartir esta ficha</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const texto = `Mirá ${negocio.nombre} en MiPin: ${window.location.href}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
                      }}
                      className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg font-body font-bold text-sm hover:bg-green-600 transition"
                    >
                      <span>📱</span> Compartir por WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        alert('¡Enlace copiado al portapapeles!')
                      }}
                      className="flex items-center justify-center gap-2 bg-navy/10 text-navy py-2 rounded-lg font-body font-bold text-sm hover:bg-navy/20 transition"
                    >
                      <span>🔗</span> Copiar enlace
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* SECCIÓN RESEÑAS */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Reseñas</h2>
              {resenas.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-navy/10">
                    <div className="text-4xl font-display text-navy">{promedio.toFixed(1)}</div>
                    <div>
                      {renderEstrellas(promedio)}
                      <p className="font-body text-navy/60 text-sm">{resenas.length} reseña{resenas.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {resenas.map((r) => {
                      const inicial = r.nombre ? r.nombre.charAt(0).toUpperCase() : '?'
                      return (
                        <div key={r.id} className="bg-crema/30 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-dorado/20 flex items-center justify-center text-dorado font-bold text-lg flex-shrink-0 mt-1">
                              {inicial}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-body font-bold text-navy">{r.nombre}</p>
                                <div className="flex items-center gap-2">
                                  {renderEstrellas(r.estrellas, 'text-sm')}
                                  <span className="font-body text-navy/40 text-xs">
                                    {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              <p className="font-body text-navy/80 text-sm">{r.comentario}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="font-body text-navy/60 text-center py-6 mb-4">Aún no hay reseñas. ¡Sé el primero!</p>
              )}

              {/* FORMULARIO NUEVA RESEÑA */}
              <div className="border-t border-navy/10 pt-6 mt-6">
                <h3 className="font-display text-xl text-navy mb-4">Dejá tu reseña</h3>
                {mensajeResena && (
                  <div className={`p-3 rounded-lg mb-4 font-body text-sm font-bold ${mensajeResena.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensajeResena}
                  </div>
                )}
                <form onSubmit={enviarResena} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nuevaResena.nombre}
                    onChange={(e) => setNuevaResena({ ...nuevaResena, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm focus:ring-2 focus:ring-dorado focus:outline-none"
                    required
                  />
                  <div>
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-2">Calificación</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNuevaResena({ ...nuevaResena, estrellas: n })}
                          className={`text-3xl transition ${n <= nuevaResena.estrellas ? 'text-dorado' : 'text-gray-300'} hover:scale-110`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Contá tu experiencia..."
                    value={nuevaResena.comentario}
                    onChange={(e) => setNuevaResena({ ...nuevaResena, comentario: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm focus:ring-2 focus:ring-dorado focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={enviandoResena}
                    className="w-full bg-dorado text-navy py-2 rounded-lg font-body font-bold hover:bg-dorado-claro transition disabled:opacity-50"
                  >
                    {enviandoResena ? 'Enviando...' : 'Enviar reseña'}
                  </button>
                </form>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA: UBICACIÓN */}
          <aside className="space-y-6">
            {tieneMapa && (
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                <h2 className="font-display text-2xl text-navy mb-4 tracking-wide">Ubicación</h2>
                {negocio.direccion && (
                  <div className="mb-4 p-4 bg-crema/50 rounded-lg border-l-4 border-dorado">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Dirección</p>
                    <p className="font-body text-navy text-base font-semibold flex items-start gap-2">
                      <span className="text-dorado">📍</span> {negocio.direccion}
                    </p>
                  </div>
                )}
                {getMapsEmbedUrl() && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-navy/10">
                    <iframe src={getMapsEmbedUrl()} className="w-full h-64 border-0" allowFullScreen loading="lazy" title={`Ubicación de ${negocio.nombre}`} />
                  </div>
                )}
                {getMapsUrl() && (
                  <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer" className="block bg-dorado text-navy py-3 rounded-lg font-body font-bold text-center hover:bg-dorado-claro transition">
                    📍 Ver ubicación en Google Maps
                  </a>
                )}
                {tieneComoLlegar && getMapsUrl() && (
                  <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition mt-3">
                    🧭 Cómo llegar
                  </a>
                )}
                {tieneRedes && (redes.instagram || redes.facebook) && (
                  <div className="border-t border-navy/10 pt-4 mt-6">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-3">Seguinos en</p>
                    <div className="flex gap-3">
                      {redes.instagram && (
                        <a href={`https://instagram.com/${redes.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-body font-bold text-sm text-center hover:opacity-90 transition">Instagram</a>
                      )}
                      {redes.facebook && (
                        <a href={redes.facebook.startsWith('http') ? redes.facebook : `https://facebook.com/${redes.facebook}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-body font-bold text-sm text-center hover:bg-blue-700 transition">Facebook</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {esGratuito && (
              <div className="bg-dorado/10 p-6 rounded-xl border-2 border-dorado/30">
                <p className="font-label text-navy font-bold text-base mb-2">¿Querés más visibilidad?</p>
                <p className="font-body text-navy/70 text-sm mb-4">Actualizá tu plan para tener WhatsApp, fotos, horario, mapa y más.</p>
                <button onClick={() => navigate('/')} className="w-full bg-dorado text-navy py-3 rounded-lg font-body font-bold hover:bg-dorado-claro transition">
                  Ver planes disponibles
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* 🆕 FOOTER ACTUALIZADO CON ENLACE A DASHBOARD */}
      <footer className="bg-navy-dark text-crema/80 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div className="md:col-span-2">
              <h3 className="font-display text-dorado text-2xl mb-4 tracking-wide">MiPin</h3>
              <p className="font-body text-crema/60 text-sm">El directorio de comercios, servicios, profesiones, productores y emprendimientos de Realicó, La Pampa.</p>
            </div>
            <div>
              <h3 className="font-display text-dorado text-xl mb-4 tracking-wide">Enlaces</h3>
              <ul className="space-y-2 text-sm font-body">
                <li><button onClick={() => navigate('/')} className="hover:text-dorado-claro transition">Inicio</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-dorado-claro transition">Categorías</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-dorado text-xl mb-4 tracking-wide">Comercios</h3>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a href="/dashboard" className="text-crema/80 hover:text-dorado-claro transition flex items-center justify-center md:justify-start gap-2">
                    <span>🔒</span> Accedé a tu Panel
                  </a>
                </li>
                <li className="text-crema/40 text-xs mt-2">
                  Usá tu email y código de acceso para editar tus fotos, ver estadísticas y cargar promos.
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-crema/20 pt-8 text-center text-sm font-body text-crema/60">
            <p>© 2026 MiPin. A un pin de distancia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FichaDetalle
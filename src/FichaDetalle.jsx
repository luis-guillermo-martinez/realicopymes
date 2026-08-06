import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function FichaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [fotoPrincipal, setFotoPrincipal] = useState(null)
  const [fotoLightbox, setFotoLightbox] = useState(null) // 🆕 Visor a pantalla completa

  useEffect(() => {
    cargarFicha()
  }, [id])

  // 🆕 Cerrar el visor con la tecla Esc
  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === 'Escape') setFotoLightbox(null)
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [])

  const cargarFicha = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setNegocio(data)
      setFotoPrincipal(data.foto_portada)
      await supabase
        .from('negocios')
        .update({ vistas: (data.vistas || 0) + 1 })
        .eq('id', id)
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
      try { return JSON.parse(negocio.redes_sociales) }
      catch { return {} }
    }
    return negocio.redes_sociales
  }

  const getGaleria = () => {
    if (!negocio.galeria) return []
    if (typeof negocio.galeria === 'string') {
      try { return JSON.parse(negocio.galeria) }
      catch { return [] }
    }
    return Array.isArray(negocio.galeria) ? negocio.galeria : []
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
          <p className="font-body text-navy/70 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-navy text-crema px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const redes = getRedes()
  const galeria = getGaleria()
  const todasLasFotos = [negocio.foto_portada, ...galeria].filter(Boolean)
  const plan = negocio.plan || 'Gratuito'
  const esGratuito = plan === 'Gratuito'
  const esEstándar = plan === 'Estándar'
  const esDestacado = plan === 'Destacado'
  const esPatrocinado = plan === 'Patrocinado'
  const tieneFoto = esEstándar || esDestacado || esPatrocinado
  const tieneWhatsApp = esEstándar || esDestacado || esPatrocinado
  const tieneHorario = esEstándar || esDestacado || esPatrocinado
  const tieneRedes = esDestacado || esPatrocinado
  const tieneMapa = esDestacado || esPatrocinado
  const tieneGalería = esDestacado || esPatrocinado
  const tieneVideo = esPatrocinado

  const planColors = {
    'Gratuito': { badge: 'bg-gray-300 text-gray-700' },
    'Estándar': { badge: 'bg-crema text-navy border border-navy/20' },
    'Destacado': { badge: 'bg-dorado text-navy' },
    'Patrocinado': { badge: 'bg-navy text-crema' }
  }
  const colors = planColors[plan] || planColors['Gratuito']

  const getMapsUrl = () => {
    if (negocio.google_maps_url) return negocio.google_maps_url
    if (negocio.direccion) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion + ', Realicó, La Pampa, Argentina')}`
    }
    return null
  }

  const getMapsEmbedUrl = () => {
    if (negocio.direccion) {
      return `https://www.google.com/maps?q=${encodeURIComponent(negocio.direccion + ', Realicó, La Pampa, Argentina')}&output=embed`
    }
    return null
  }

  // ¿El patrocinado tiene banner para usar de fondo?
  const bannerDeFondo = esPatrocinado && negocio.banner_url

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* 🆕 VISOR A PANTALLA COMPLETA CON EFECTO LUPA */}
      {fotoLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFotoLightbox(null)}
        >
          <style>{`@keyframes zoomLupa { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
          <button
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl font-bold transition"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={fotoLightbox}
            alt={negocio.nombre}
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            style={{ animation: 'zoomLupa 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-0 right-0 text-center text-crema/60 text-sm font-body">
            Tocá afuera o presioná Esc para cerrar
          </p>
        </div>
      )}

      {/* HEADER */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img src="/logo.png" alt="MiPin" className="h-10 md:h-12 w-auto" />
          </button>
          <button onClick={() => navigate('/')} className="font-body text-navy hover:text-dorado font-semibold flex items-center gap-2">
            ← Volver al directorio
          </button>
        </div>
      </nav>

      {/* ========== HERO (NUEVO ENCABEZADO) ========== */}
      <header className={`relative overflow-hidden text-white py-12 ${bannerDeFondo ? '' : 'bg-gradient-to-b from-navy to-navy-dark'}`}>
        {/* FONDO: banner propio detrás (solo Patrocinado) */}
        {bannerDeFondo && (
          <>
            <img
              src={negocio.banner_url}
              alt={`Banner ${negocio.nombre}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Capa oscura para que el texto se lea bien */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy-dark/90" />
          </>
        )}

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* IMAGEN REDONDA TIPO AVATAR (estática, con lupa al click) */}
            {tieneFoto && (
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {negocio.foto_portada ? (
                  <div
                    className={`w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 bg-white cursor-zoom-in ${
                      esPatrocinado ? 'border-crema shadow-2xl' :
                      esDestacado ? 'border-dorado shadow-xl' :
                      'border-white/30 shadow-lg'
                    }`}
                    onClick={() => setFotoLightbox(negocio.foto_portada)}
                  >
                    <img src={negocio.foto_portada} alt={negocio.nombre} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center border-4 ${
                    esPatrocinado ? 'border-crema bg-navy-light' :
                    esDestacado ? 'border-dorado bg-navy-light' :
                    'border-white/30 bg-navy-light'
                  }`}>
                    <span className="font-display text-6xl text-crema/50">{negocio.nombre.charAt(0)}</span>
                  </div>
                )}
              </div>
            )}

            <div className={`flex-1 ${!tieneFoto ? 'w-full' : ''} text-center md:text-left`}>
              {/* LÍNEA SUPERIOR: Badge + Tipo + Rubro + Vistas */}
              <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                {(esDestacado || esPatrocinado) && (
                  <span className={`font-label px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
                    {plan}
                  </span>
                )}
                <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.tipo}</span>
                {/* ✅ RUBRO SUBE ARRIBA (todos los planes excepto Gratuito) */}
                {!esGratuito && negocio.categoria && (
                  <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.categoria}</span>
                )}
                {negocio.vistas > 0 && (
                  <span className="font-body text-crema/60 text-xs">👁 {negocio.vistas} vistas</span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-6xl tracking-wide mb-3">{negocio.nombre}</h1>

              {/* Solo Gratuito mantiene el rubro abajo (los pagos lo tienen arriba) */}
              {esGratuito && (
                <p className="font-label text-dorado-claro text-lg uppercase tracking-wide mb-4">{negocio.categoria}</p>
              )}

              <p className="font-body text-crema/90 text-lg leading-relaxed">{negocio.descripcion}</p>

              {/* ✅ La dirección YA NO va acá en planes pagos (está abajo en Ubicación) */}
              {esGratuito && negocio.direccion && (
                <p className="font-body text-crema/80 mt-4 flex items-center gap-2 justify-center md:justify-start">
                  <span>📍</span> {negocio.direccion}
                </p>
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
            {tieneGalería && todasLasFotos.length > 1 && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {todasLasFotos.map((foto, idx) => (
                    <img
                      key={idx}
                      src={foto}
                      alt={`${negocio.nombre} ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition"
                      onClick={() => setFotoLightbox(foto)}
                    />
                  ))}
                </div>
              </section>
            )}
            {tieneVideo && negocio.video_url && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Video</h2>
                <div className="aspect-video bg-navy/5 rounded-lg overflow-hidden">
                  <iframe
                    src={negocio.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={`Video de ${negocio.nombre}`}
                  />
                </div>
              </section>
            )}
            {tieneHorario && negocio.horario && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Horario de atención</h2>
                <p className="font-body text-navy text-lg">{negocio.horario}</p>
              </section>
            )}
            {/* SECCIÓN CONTACTO */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Contacto</h2>
              <div className="space-y-6">
                {negocio.telefono && (
                  <div className="border-b border-navy/10 pb-4">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Teléfono</p>
                    <a href={`tel:${negocio.telefono}`} className="font-body text-navy text-lg font-semibold hover:text-dorado transition block mb-3">
                      {negocio.telefono}
                    </a>
                    {tieneWhatsApp && negocio.whatsapp && (
                      <a
                        href={`https://wa.me/${negocio.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition"
                      >
                        Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                )}
                {negocio.email && (
                  <div>
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Email</p>
                    <a href={`mailto:${negocio.email}`} className="font-body text-navy text-lg font-semibold hover:text-dorado transition break-all block mb-3">
                      {negocio.email}
                    </a>
                    <a
                      href={`mailto:${negocio.email}?subject=Consulta desde MiPin - ${negocio.nombre}`}
                      className="block w-full text-center bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition"
                    >
                      ✉️ Enviar Email
                    </a>
                  </div>
                )}
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
                    <iframe
                      src={getMapsEmbedUrl()}
                      className="w-full h-64 border-0"
                      allowFullScreen
                      loading="lazy"
                      title={`Ubicación de ${negocio.nombre}`}
                    />
                  </div>
                )}
                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-dorado text-navy py-3 rounded-lg font-body font-bold text-center hover:bg-dorado-claro transition"
                >
                  📍 Ver ubicación en Google Maps
                </a>
                {tieneRedes && (redes.instagram || redes.facebook) && (
                  <div className="border-t border-navy/10 pt-4 mt-6">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-3">Seguinos en</p>
                    <div className="flex gap-3">
                      {redes.instagram && (
                        <a
                          href={`https://instagram.com/${redes.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-body font-bold text-sm text-center hover:opacity-90 transition"
                        >
                          Instagram
                        </a>
                      )}
                      {redes.facebook && (
                        <a
                          href={redes.facebook.startsWith('http') ? redes.facebook : `https://facebook.com/${redes.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-body font-bold text-sm text-center hover:bg-blue-700 transition"
                        >
                          Facebook
                        </a>
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

      <footer className="bg-navy-dark text-crema/80 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-sm text-crema/60">© 2026 MiPin. A un pin de distancia.</p>
        </div>
      </footer>
    </div>
  )
}

export default FichaDetalle
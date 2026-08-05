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

  useEffect(() => {
    cargarFicha()
  }, [id])

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
  const galeria = getGaleria().slice(0, 3)
  const plan = negocio.plan || 'Gratuito'
  const esEstándar = plan === 'Estándar'
  const esDestacado = plan === 'Destacado'
  const esPatrocinado = plan === 'Patrocinado'
  const tieneFoto = esEstándar || esDestacado || esPatrocinado
  const tieneWhatsApp = esEstándar || esDestacado || esPatrocinado
  const tieneHorario = esEstándar || esDestacado || esPatrocinado
  const tieneRedes = esDestacado || esPatrocinado
  const tieneMapa = esDestacado || esPatrocinado
  const tieneGaleria = esDestacado || esPatrocinado
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

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
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

      {/* BANNER PATROCINADO */}
      {esPatrocinado && negocio.banner_url && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img src={negocio.banner_url} alt={`Banner ${negocio.nombre}`} className="w-full h-full object-cover" />
        </div>
      )}

      {/* HERO */}
      <header className={`bg-gradient-to-b from-navy to-navy-dark text-white py-12 ${esPatrocinado ? 'pt-8' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {tieneFoto && (
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {fotoPrincipal ? (
                  <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${
                    esPatrocinado ? 'border-crema shadow-2xl' :
                    esDestacado ? 'border-dorado shadow-xl' :
                    'border-white/30 shadow-lg'
                  }`}>
                    <img src={fotoPrincipal} alt={negocio.nombre} className="w-full h-full object-cover" />
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
            <div className={`flex-1 text-center md:text-left ${!tieneFoto ? 'w-full' : ''}`}>
              <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                {(esDestacado || esPatrocinado) && (
                  <span className={`font-label px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
                    {plan}
                  </span>
                )}
                <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.tipo}</span>
                {negocio.vistas > 0 && (
                  <span className="font-body text-crema/60 text-xs">👁 {negocio.vistas} vistas</span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl tracking-wide mb-3">{negocio.nombre}</h1>
              <p className="font-label text-dorado-claro text-lg uppercase tracking-wide mb-4">{negocio.categoria}</p>
              <p className="font-body text-crema/90 text-lg leading-relaxed">{negocio.descripcion}</p>
              {negocio.direccion && (
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
            {/* 📷 GALERÍA ESTILO INSTAGRAM (3 cuadradas) */}
            {tieneGaleria && galeria.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Galería</h2>
                <div className="grid grid-cols-3 gap-2">
                  {galeria.map((foto, idx) => (
                    <img
                      key={idx}
                      src={foto}
                      alt={`${negocio.nombre} ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => setFotoPrincipal(foto)}
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
            {/* CONTACTO */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Contacto</h2>
              <div className="space-y-6">
                {negocio.telefono && (
                  <div className="border-b border-navy/10 pb-4">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="font-body text-navy text-lg font-semibold mb-3">{negocio.telefono}</p>
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
                    <p className="font-body text-navy text-lg font-semibold break-all mb-3">{negocio.email}</p>
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
                {getMapsUrl() && (
                  <a
                    href={getMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-dorado text-navy py-3 rounded-lg font-body font-bold text-center hover:bg-dorado-claro transition"
                  >
                    📍 Ver ubicación en Google Maps
                  </a>
                )}
                {/* ✅ REDES SOCIALES VISIBLES CON SU USUARIO */}
                {tieneRedes && (redes.instagram || redes.facebook) && (
                  <div className="border-t border-navy/10 pt-4 mt-6">
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-3">Seguinos en</p>
                    <div className="space-y-2">
                      {redes.instagram && (
                        <a
                          href={`https://instagram.com/${redes.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg font-body font-bold text-sm hover:opacity-90 transition"
                        >
                          <span>📷 Instagram</span>
                          <span className="font-normal">@{redes.instagram.replace('@', '')}</span>
                        </a>
                      )}
                      {redes.facebook && (
                        <a
                          href={redes.facebook.startsWith('http') ? redes.facebook : `https://facebook.com/${redes.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-blue-600 text-white py-2 px-3 rounded-lg font-body font-bold text-sm hover:bg-blue-700 transition"
                        >
                          <span>📘 Facebook</span>
                          <span className="font-normal">{redes.facebook.replace('https://', '').replace('http://', '').replace('facebook.com/', '')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {plan === 'Gratuito' && (
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
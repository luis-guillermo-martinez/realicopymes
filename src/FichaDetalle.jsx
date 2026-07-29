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
      
      // 1. Obtener datos del negocio
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setNegocio(data)
      setFotoPrincipal(data.foto_portada)

      // 2. Incrementar contador de vistas
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

  // Obtener redes sociales (puede ser string o JSON)
  const getRedes = () => {
    if (!negocio.redes_sociales) return {}
    if (typeof negocio.redes_sociales === 'string') {
      try { return JSON.parse(negocio.redes_sociales) }
      catch { return {} }
    }
    return negocio.redes_sociales
  }

  // Obtener galería
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

  // Plan badge
  const planBadge = {
    'Patrocinado': 'bg-navy text-crema',
    'Destacado': 'bg-dorado text-navy',
    'Estándar': 'bg-crema text-navy border border-navy/20',
    'Gratuito': 'bg-gray-200 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      {/* HEADER SIMPLE */}
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img src="/logo.png" alt="Realicó PyMEs" className="h-10 md:h-12 w-auto" />
          </button>
          <button onClick={() => navigate('/')} className="font-body text-navy hover:text-dorado font-semibold flex items-center gap-2">
            ← Volver al directorio
          </button>
        </div>
      </nav>

      {/* HERO DE LA FICHA */}
      <header className="bg-gradient-to-b from-navy to-navy-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Foto principal */}
            <div className="w-full md:w-1/3">
              {fotoPrincipal ? (
                <img src={fotoPrincipal} alt={negocio.nombre} className="w-full h-64 object-cover rounded-xl shadow-2xl" />
              ) : (
                <div className="w-full h-64 bg-navy-light rounded-xl flex items-center justify-center">
                  <span className="font-display text-6xl text-crema/30">{negocio.nombre.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Info principal */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`font-label px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${planBadge[negocio.plan] || planBadge['Gratuito']}`}>
                  {negocio.plan || 'Gratuito'}
                </span>
                <span className="font-label text-dorado-claro text-sm uppercase tracking-wide">{negocio.tipo}</span>
                {negocio.vistas > 0 && (
                  <span className="font-body text-crema/60 text-xs">👁 {negocio.vistas} vistas</span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-6xl tracking-wide mb-3">{negocio.nombre}</h1>
              <p className="font-label text-dorado-claro text-lg uppercase tracking-wide mb-4">{negocio.categoria}</p>
              <p className="font-body text-crema/90 text-lg leading-relaxed">{negocio.descripcion}</p>

              {negocio.direccion && (
                <p className="font-body text-crema/80 mt-4 flex items-center gap-2">
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
          {/* COLUMNA IZQUIERDA: Info completa */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* GALERÍA (Estándar y superiores) */}
            {todasLasFotos.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-6 tracking-wide">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {todasLasFotos.map((foto, idx) => (
                    <img 
                      key={idx} 
                      src={foto} 
                      alt={`${negocio.nombre} ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => setFotoPrincipal(foto)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* VIDEO (solo Patrocinado) */}
            {negocio.plan === 'Patrocinado' && negocio.video_url && (
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

            {/* HORARIO (Estándar y superiores) */}
            {negocio.horario && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Horario de atención</h2>
                <p className="font-body text-navy text-lg">{negocio.horario}</p>
              </section>
            )}

            {/* MAPA (Destacado y Patrocinado) */}
            {negocio.coordenadas && (negocio.plan === 'Destacado' || negocio.plan === 'Patrocinado') && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">Ubicación</h2>
                {negocio.coordenadas.includes('google.com/maps') ? (
                  <iframe 
                    src={negocio.coordenadas.replace('place/', 'embed?pb=').split('?')[0] + '?output=embed'}
                    className="w-full h-80 rounded-lg"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.coordenadas)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-dorado text-navy py-4 rounded-lg font-body font-bold text-center hover:bg-dorado-claro transition"
                  >
                     Ver en Google Maps
                  </a>
                )}
              </section>
            )}
          </div>

          {/* COLUMNA DERECHA: Contacto */}
          <aside className="space-y-6">
            {/* Tarjeta de contacto */}
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
              <h2 className="font-display text-2xl text-navy mb-4 tracking-wide">Contacto</h2>
              
              <div className="space-y-4">
                {negocio.telefono && (
                  <div>
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Teléfono</p>
                    <a href={`tel:${negocio.telefono}`} className="font-body text-navy font-semibold hover:text-dorado transition">
                      {negocio.telefono}
                    </a>
                  </div>
                )}

                {negocio.email && (
                  <div>
                    <p className="font-label text-navy/60 text-xs uppercase tracking-wide mb-1">Email</p>
                    <a href={`mailto:${negocio.email}`} className="font-body text-navy font-semibold hover:text-dorado transition break-all">
                      {negocio.email}
                    </a>
                  </div>
                )}

                {negocio.whatsapp && (
                  <a 
                    href={`https://wa.me/${negocio.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition"
                  >
                     Contactar por WhatsApp
                  </a>
                )}

                {negocio.plan === 'Patrocinado' && negocio.coordenadas && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.coordenadas)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition"
                  >
                    📍 Cómo llegar
                  </a>
                )}
              </div>

              {/* Redes sociales (Destacado y Patrocinado) */}
              {(redes.instagram || redes.facebook) && (
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
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-navy-dark text-crema/80 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-sm text-crema/60">© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
        </div>
      </footer>
    </div>
  )
}

export default FichaDetalle
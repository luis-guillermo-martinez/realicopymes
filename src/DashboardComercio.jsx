import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function DashboardComercio() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [negocio, setNegocio] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Estados para promociones
  const [misPromos, setMisPromos] = useState([])
  const [nuevaPromo, setNuevaPromo] = useState({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    const emailLimpio = email.trim().toLowerCase()
    const codigoLimpio = codigo.trim().toLowerCase()

    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('email', emailLimpio)
        .eq('codigo_acceso', codigoLimpio)
        .single()
      
      if (error || !data) throw new Error('Email o código de acceso incorrectos.')
      
      setNegocio(data)
      cargarMisPromos(data.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const cargarMisPromos = async (negocioId) => {
    const { data } = await supabase
      .from('promociones')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
    setMisPromos(data || [])
  }

  const crearPromocion = async (e) => {
    e.preventDefault()
    if (!nuevaPromo.titulo || !nuevaPromo.descripcion || !nuevaPromo.fecha_inicio || !nuevaPromo.fecha_fin) {
      setMensaje('❌ Completá todos los campos de la promoción.')
      return
    }
    setMensaje('Enviando a moderación...')
    try {
      const { error } = await supabase.from('promociones').insert([{
        negocio_id: negocio.id,
        titulo: nuevaPromo.titulo,
        descripcion: nuevaPromo.descripcion,
        fecha_inicio: nuevaPromo.fecha_inicio,
        fecha_fin: nuevaPromo.fecha_fin,
        aprobada: false
      }])
      if (error) throw error
      setMensaje('✅ Promoción enviada. El administrador la aprobará pronto.')
      setNuevaPromo({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
      cargarMisPromos(negocio.id)
    } catch (err) {
      setMensaje('❌ Error: ' + err.message)
    }
  }

  const subirImagen = async (file, carpeta) => {
    const ext = file.name.split('.').pop()
    const nombre = `${carpeta}/${negocio.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagenes').upload(nombre, file)
    if (error) throw error
    const { data } = supabase.storage.from('imagenes').getPublicUrl(nombre)
    return data.publicUrl
  }

  const handleSubirPortada = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagen(file, 'portadas')
      await supabase.from('negocios').update({ foto_portada: url }).eq('id', negocio.id)
      setNegocio({ ...negocio, foto_portada: url })
      setMensaje('✅ Foto de portada actualizada.')
    } catch (err) {
      setMensaje('❌ Error al subir: ' + err.message)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  if (!negocio) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl text-navy tracking-wide">Acceso Comercios</h2>
            <p className="font-body text-navy/60 text-sm mt-2">Ingresá con el email y el código de acceso que te proporcionó MiPin.</p>
          </div>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-bold text-center">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-label text-navy font-bold text-xs uppercase mb-1">Email del comercio</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm focus:ring-2 focus:ring-dorado focus:outline-none" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block font-label text-navy font-bold text-xs uppercase mb-1">Código de Acceso</label>
              <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm tracking-widest uppercase focus:ring-2 focus:ring-dorado focus:outline-none" placeholder="Ej: A1B2C3D4" />
            </div>
            <button type="submit" disabled={cargando} className="w-full bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition disabled:opacity-50">
              {cargando ? 'Ingresando...' : 'Ingresar a mi Panel'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-navy/60 text-sm font-body hover:text-navy transition">← Volver al inicio</button>
          </form>
        </div>
      </div>
    )
  }

  const puedeCrearPromo = negocio.plan === 'Destacado' || negocio.plan === 'Patrocinado'

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      <nav className="bg-navy text-crema shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-display text-xl tracking-wide">Panel de {negocio.nombre}</h1>
          <button onClick={() => { setNegocio(null); setEmail(''); setCodigo(''); }} className="text-sm font-body hover:text-dorado transition">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {mensaje && (
          <div className={`p-4 rounded-lg mb-6 font-body font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-dorado text-center">
            <p className="font-label text-navy/60 text-xs uppercase font-bold">Vistas de la Ficha</p>
            <p className="font-display text-4xl text-navy mt-2">{negocio.vistas || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 text-center">
            <p className="font-label text-navy/60 text-xs uppercase font-bold">Clics en WhatsApp</p>
            <p className="font-display text-4xl text-navy mt-2">{negocio.clics_whatsapp || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 text-center">
            <p className="font-label text-navy/60 text-xs uppercase font-bold">Clics en el Mapa</p>
            <p className="font-display text-4xl text-navy mt-2">{negocio.clics_mapa || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GESTIÓN DE FOTOS */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-display text-2xl text-navy mb-4 tracking-wide">📷 Mis Fotos</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-label text-navy font-bold text-xs uppercase mb-2">Foto de Portada</label>
                {negocio.foto_portada && <img src={negocio.foto_portada} alt="Portada" className="w-24 h-24 object-cover rounded-full border-2 border-dorado mb-3" />}
                <label className={`block w-full text-center py-2 rounded-lg font-body font-bold cursor-pointer transition text-sm ${subiendo ? 'bg-gray-300 text-gray-500' : 'bg-navy text-crema hover:bg-navy-dark'}`}>
                  {subiendo ? '⏳ Subiendo...' : 'Cambiar Foto de Portada'}
                  <input type="file" accept="image/*" onChange={handleSubirPortada} className="hidden" disabled={subiendo} />
                </label>
              </div>
            </div>
          </div>

          {/* GESTIÓN DE PROMOCIONES */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-display text-2xl text-navy mb-2 tracking-wide">🎁 Mis Promociones</h3>
            {!puedeCrearPromo ? (
              <div className="bg-dorado/10 border border-dorado/30 p-4 rounded-lg text-center">
                <p className="font-body text-navy font-bold mb-2">Plan {negocio.plan}</p>
                <p className="font-body text-sm text-navy/70 mb-4">La creación de promociones está disponible exclusivamente para los planes <strong>Destacado</strong> y <strong>Patrocinado</strong>.</p>
                <button onClick={() => navigate('/#planes')} className="bg-navy text-crema px-4 py-2 rounded-lg font-body font-bold text-sm hover:bg-navy-dark transition">Ver planes</button>
              </div>
            ) : (
              <>
                <form onSubmit={crearPromocion} className="space-y-3 mb-6 border-b border-navy/10 pb-6">
                  <input type="text" placeholder="Título de la promo (Ej: 20% OFF)" value={nuevaPromo.titulo} onChange={(e) => setNuevaPromo({...nuevaPromo, titulo: e.target.value})} className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm" required />
                  <textarea placeholder="Descripción detallada" value={nuevaPromo.descripcion} onChange={(e) => setNuevaPromo({...nuevaPromo, descripcion: e.target.value})} rows="2" className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm" required />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-navy/60 uppercase">Desde</label>
                      <input type="date" value={nuevaPromo.fecha_inicio} onChange={(e) => setNuevaPromo({...nuevaPromo, fecha_inicio: e.target.value})} className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/60 uppercase">Hasta</label>
                      <input type="date" value={nuevaPromo.fecha_fin} onChange={(e) => setNuevaPromo({...nuevaPromo, fecha_fin: e.target.value})} className="w-full px-3 py-2 border border-navy/20 rounded-lg font-body text-sm" required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-dorado text-navy py-2 rounded-lg font-body font-bold hover:bg-dorado-claro transition">Enviar a Moderación</button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-label font-bold text-navy text-sm uppercase">Historial</h4>
                  {misPromos.length === 0 ? <p className="text-sm text-navy/60">No tenés promociones creadas.</p> : 
                    misPromos.map(p => (
                      <div key={p.id} className={`p-3 rounded-lg border text-sm ${p.aprobada ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-navy">{p.titulo}</p>
                          <span className={`text-xs px-2 py-1 rounded font-bold ${p.aprobada ? 'bg-green-500 text-white' : 'bg-yellow-400 text-navy'}`}>
                            {p.aprobada ? 'Aprobada' : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-navy/70 text-xs mt-1">{p.fecha_inicio} al {p.fecha_fin}</p>
                      </div>
                    ))
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardComercio
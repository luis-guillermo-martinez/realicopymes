import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { jsPDF } from 'jspdf'
import ReporteVisual from './ReporteVisual'
import html2canvas from 'html2canvas'

function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [resenas, setResenas] = useState([])
  const [promociones, setPromociones] = useState([])
  const [filtroPlan, setFiltroPlan] = useState('Todos')
  const [pendientes, setPendientes] = useState([])
  const [publicados, setPublicados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [subiendoPortada, setSubiendoPortada] = useState(false)
  const [subiendoGaleria, setSubiendoGaleria] = useState(false)
  const [subiendoBanner, setSubiendoBanner] = useState(false)
  
  // Estado para el modal de envío de reporte
  const [reporteData, setReporteData] = useState(null)

  const ADMIN_PASSWORD = 'realico2026'
  const PLANES = ['Todos', 'Gratuito', 'Estándar', 'Destacado', 'Patrocinado']

  useEffect(() => {
    if (isAuthenticated) cargarDatos()
  }, [isAuthenticated])

  const cargarDatos = async () => {
    setCargando(true)
    const { data: dataPendientes } = await supabase.from('negocios').select('*').eq('activo', false).order('created_at', { ascending: false })
    const { data: dataPublicados } = await supabase.from('negocios').select('*').eq('activo', true).order('created_at', { ascending: false })
    setPendientes(dataPendientes || [])
    setPublicados(dataPublicados || [])
    
    const { data: dataResenas } = await supabase.from('resenas').select('*, negocios(nombre)').order('created_at', { ascending: false })
    setResenas(dataResenas || [])

    const { data: dataPromos } = await supabase.from('promociones').select('*, negocios(nombre, plan)').order('created_at', { ascending: false })
    setPromociones(dataPromos || [])

    setCargando(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const abrirEdicion = (sol) => {
    let redes = {}
    try { redes = typeof sol.redes_sociales === 'string' ? JSON.parse(sol.redes_sociales) : (sol.redes_sociales || {}) } catch { redes = {} }
    let galeria = []
    try { galeria = typeof sol.galeria === 'string' ? JSON.parse(sol.galeria) : (Array.isArray(sol.galeria) ? sol.galeria : []) } catch { galeria = [] }
    setEditando({
      ...sol,
      instagram: redes.instagram || '',
      facebook: redes.facebook || '',
      galeria: Array.isArray(galeria) ? galeria : []
    })
  }

  const handleInputChange = (e) => {
    setEditando({ ...editando, [e.target.name]: e.target.value })
  }

  const generarSlug = (nombre) => {
    return nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  }

  const maxGaleria = editando ? (editando.plan === 'Patrocinado' ? 5 : editando.plan === 'Destacado' ? 3 : 0) : 0

  const subirImagen = async (file, carpeta) => {
    const ext = file.name.split('.').pop()
    const nombre = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('imagenes').upload(nombre, file)
    if (error) throw error
    const { data } = supabase.storage.from('imagenes').getPublicUrl(nombre)
    return data.publicUrl
  }

  const manejarSubidaPortada = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoPortada(true)
    try {
      const url = await subirImagen(file, 'portadas')
      setEditando(prev => ({ ...prev, foto_portada: url }))
      setMensaje('✅ Foto de portada subida.')
    } catch (err) {
      setMensaje('❌ Error al subir la foto: ' + err.message)
    } finally {
      setSubiendoPortada(false)
      e.target.value = ''
    }
  }

  const manejarSubidaGaleria = async (e) => {
    const actuales = editando.galeria || []
    const files = Array.from(e.target.files).slice(0, maxGaleria - actuales.length)
    if (files.length === 0) {
      setMensaje(`⚠️ La galería admite ${maxGaleria} imágenes como máximo.`)
      e.target.value = ''
      return
    }
    setSubiendoGaleria(true)
    try {
      const urls = []
      for (const f of files) urls.push(await subirImagen(f, 'galerias'))
      setEditando(prev => ({ ...prev, galeria: [...(prev.galeria || []), ...urls].slice(0, maxGaleria) }))
      setMensaje('✅ Imágenes de galería subidas.')
    } catch (err) {
      setMensaje('❌ Error al subir imágenes: ' + err.message)
    } finally {
      setSubiendoGaleria(false)
      e.target.value = ''
    }
  }

  const manejarSubidaBanner = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoBanner(true)
    try {
      const url = await subirImagen(file, 'banners')
      setEditando(prev => ({ ...prev, banner_url: url }))
      setMensaje('✅ Banner subido.')
    } catch (err) {
      setMensaje('❌ Error al subir el banner: ' + err.message)
    } finally {
      setSubiendoBanner(false)
      e.target.value = ''
    }
  }

  const quitarFotoGaleria = (idx) => {
    setEditando(prev => ({ ...prev, galeria: (prev.galeria || []).filter((_, i) => i !== idx) }))
  }

  const guardarNegocio = async () => {
    if (!window.confirm(`¿Guardar cambios y ${editando.activo ? 'actualizar' : 'aprobar y publicar'} a "${editando.nombre}"?`)) return
    setMensaje('Procesando...')
    try {
      const categoriasArray = editando.categoria.split(',').map(c => c.trim()).filter(c => c !== '').slice(0, 3)
      const redes = JSON.stringify({ instagram: editando.instagram || '', facebook: editando.facebook || '' })
      const { error } = await supabase.from('negocios').update({
        nombre: editando.nombre, slug: generarSlug(editando.nombre), tipo: editando.tipo, categoria: categoriasArray.join(', '),
        descripcion: editando.descripcion, direccion: editando.direccion, telefono: editando.telefono, whatsapp: editando.whatsapp,
        email: editando.email, horario: editando.horario, plan: editando.plan, foto_portada: editando.foto_portada,
        galeria: JSON.stringify(editando.galeria || []), video_url: editando.video_url || null, banner_url: editando.banner_url || null,
        google_maps_url: editando.google_maps_url, redes_sociales: redes, activo: true, suspendido: false,
        destacado: editando.plan === 'Destacado' || editando.plan === 'Patrocinado', estado: 'Aprobado'
      }).eq('id', editando.id)
      if (error) throw error
      setMensaje(`✅ "${editando.nombre}" guardado correctamente.`)
      setEditando(null)
      setTimeout(() => { setMensaje(''); cargarDatos() }, 2500)
    } catch (error) {
      setMensaje('❌ Error: ' + error.message)
    }
  }

  const eliminarNegocio = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE a "${nombre}"?`)) return
    setMensaje('Procesando...')
    try {
      const { error } = await supabase.from('negocios').delete().eq('id', id)
      if (error) throw error
      setMensaje(`🗑️ "${nombre}" eliminado.`)
      setEditando(null)
      setTimeout(() => { setMensaje(''); cargarDatos() }, 2500)
    } catch (error) {
      setMensaje('❌ Error: ' + error.message)
    }
  }

  const aprobarResena = async (resena) => {
    const { error } = await supabase.from('resenas').update({ aprobado: true }).eq('id', resena.id)
    if (error) { setMensaje('❌ Error: ' + error.message) } else { setMensaje(`✅ Reseña de "${resena.nombre}" aprobada.`); cargarDatos() }
  }
  const eliminarResena = async (id) => {
    if (!window.confirm('¿Eliminar esta resena?')) return
    const { error } = await supabase.from('resenas').delete().eq('id', id)
    if (error) { setMensaje('❌ Error: ' + error.message) } else { setMensaje('🗑️ Resena eliminada.'); cargarDatos() }
  }
  const aprobarPromo = async (id) => {
    const { error } = await supabase.from('promociones').update({ aprobada: true }).eq('id', id)
    if (error) { setMensaje('❌ Error: ' + error.message) } else { setMensaje('✅ Promocion aprobada.'); cargarDatos() }
  }
  const rechazarPromo = async (id) => {
    if (!window.confirm('¿Rechazar y eliminar esta promocion?')) return
    const { error } = await supabase.from('promociones').delete().eq('id', id)
    if (error) { setMensaje('❌ Error: ' + error.message) } else { setMensaje('🗑️ Promocion rechazada.'); cargarDatos() }
  }
  const toggleSuspender = async (negocio) => {
    const nuevoEstado = !negocio.suspendido
    const accion = nuevoEstado ? 'SUSPENDER' : 'REACTIVAR'
    if (!window.confirm(`¿${accion} a "${negocio.nombre}"?`)) return
    setMensaje('Procesando...')
    try {
      const { error } = await supabase.from('negocios').update({ suspendido: nuevoEstado }).eq('id', negocio.id)
      if (error) throw error
      setMensaje(`✅ "${negocio.nombre}" ${nuevoEstado ? 'suspendido' : 'reactivado'}.`)
      setEditando(null)
      setTimeout(() => { setMensaje(''); cargarDatos() }, 2500)
    } catch (error) {
      setMensaje('❌ Error: ' + error.message)
    }
  }

    const generarReportePDF = async (negocio) => {
    setMensaje('📊 Generando reporte...')
    
    try {
      // 1. Crear contenedor temporal fuera de pantalla
      const contenedor = document.createElement('div')
      contenedor.style.position = 'fixed'
      contenedor.style.left = '-9999px'
      contenedor.style.top = '0'
      contenedor.style.zIndex = '-1'
      document.body.appendChild(contenedor)
      
      // 2. Renderizar el componente visual
      const { createRoot } = await import('react-dom/client')
      const root = createRoot(contenedor)
      
      await new Promise((resolve) => {
        root.render(<ReporteVisual negocio={negocio} />)
        setTimeout(resolve, 800)
      })
      
      // 3. Capturar como imagen de alta calidad
      const elemento = document.getElementById('reporte-visual')
      if (!elemento) throw new Error('No se pudo renderizar el reporte visual.')
      
      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#1e3a5f',
        useCORS: true,
        logging: false
      })
      
      const imagenData = canvas.toDataURL('image/png', 1.0)
      
      // 4. Limpiar
      root.unmount()
      document.body.removeChild(contenedor)
      
      // 5. Crear PDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      
      const anchoPDF = 210
      const altoImagen = (canvas.height * anchoPDF) / canvas.width
      
      doc.addImage(imagenData, 'PNG', 0, 0, anchoPDF, altoImagen)
      
      // 6. Agregar pagina de contacto si hay espacio o en pagina nueva
      if (altoImagen < 260) {
        const yPos = altoImagen + 15
        doc.setFontSize(14)
        doc.setTextColor(30, 58, 95)
        doc.setFont('helvetica', 'bold')
        doc.text('Listo para dar el siguiente paso?', 20, yPos)
        doc.setFontSize(11)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text('Contactanos para conocer nuestros planes:', 20, yPos + 8)
        doc.text('WhatsApp: +54 9 2302 57-6867', 20, yPos + 16)
        doc.text('Web: www.mipin.com.ar', 20, yPos + 24)
      } else {
        doc.addPage()
        doc.setFontSize(20)
        doc.setTextColor(30, 58, 95)
        doc.setFont('helvetica', 'bold')
        doc.text('Listo para dar el siguiente paso?', 20, 40)
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text('WhatsApp: +54 9 2302 57-6867', 20, 60)
        doc.text('Web: www.mipin.com.ar', 20, 70)
      }
      
      // 7. Descargar PDF
      const nombreArchivo = `Reporte_MiPin_${negocio.nombre.replace(/\s+/g, '_')}.pdf`
      doc.save(nombreArchivo)
      
      // 8. 🆕 MOSTRAR MODAL CON TEXTO PARA COPIAR (despues de descargar)
      const plan = negocio.plan || 'Gratuito'
      const ordenPlanes = ['Gratuito', 'Estandar', 'Destacado', 'Patrocinado']
      const idx = ordenPlanes.indexOf(plan)
      let textoUpsell = ''
      
      if (plan === 'Gratuito') {
        textoUpsell = '\n\n🚀 Te recomendamos subir al plan Estandar ($10.000/mes) para tener WhatsApp directo. O al Destacado ($25.000/mes) para maxima visibilidad,para tener galeria, redes, mapa y badge destacado. O al Patrocinado ($75.000/mes) para liderar tu categoria.'
      } else if (plan === 'Estándar' || plan === 'Estandar') {
        textoUpsell = '\n\n🚀 Subi al plan Destacado ($25.000/mes) para tener galeria, redes, mapa y badge destacado. O al Patrocinado ($75.000/mes) para liderar tu categoria.'
      } else if (plan === 'Destacado') {
        textoUpsell = '\n\n🚀 Subi al plan Patrocinado ($75.000/mes) para tener video, banner propio y posicion #1 garantizada.'
      } else {
        textoUpsell = '\n\n🏆 Ya estas en el plan maximo! Segui asi, tu negocio tiene la maxima visibilidad en MiPin.'
      }
      
      const total = (negocio.vistas || 0) + (negocio.clics_whatsapp || 0) + (negocio.clics_mapa || 0)
      const textoResumen = `Hola ${negocio.nombre}! 👋\n\nTe compartimos tu reporte de rendimiento en MiPin:\n\n👁️ Vistas de ficha: ${negocio.vistas || 0}\n💬 Clics en WhatsApp: ${negocio.clics_whatsapp || 0}\n📍 Clics en Mapa: ${negocio.clics_mapa || 0}\n📊 Total de interacciones: ${total}${textoUpsell}\n\nTe adjuntamos el PDF con el detalle.\n\nwww.mipin.com.ar`
      
      setReporteData({ nombre: negocio.nombre, texto: textoResumen })
      setMensaje('')
      
    } catch (err) {
      console.error('Error generando reporte:', err)
      setMensaje('❌ Error al generar el reporte: ' + err.message)
    }
  }
    // 🆕 FUNCIONES FALTANTES QUE CAUSABAN EL ERROR DE PANTALLA EN BLANCO
  const copiarAlPortapapeles = () => {
    if (!reporteData) return;
    navigator.clipboard.writeText(reporteData.texto).then(() => {
      setMensaje('✅ Texto copiado. Ahora pegalo en WhatsApp y adjunta el PDF.');
      setTimeout(() => {
        setMensaje('');
        setReporteData(null);
      }, 3000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      setMensaje('❌ No se pudo copiar el texto.');
    });
  }

  const abrirEmail = () => {
    if (!reporteData) return;
    const subject = encodeURIComponent(`Reporte de rendimiento en MiPin - ${reporteData.nombre}`);
    const body = encodeURIComponent(reporteData.texto + '\n\n(Adjunto encontrarás el PDF con el detalle)');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setReporteData(null);
  }

  
  const totalActivos = publicados.filter(n => !n.suspendido).length
  const totalSuspendidos = publicados.filter(n => n.suspendido).length
  const totalVistas = publicados.reduce((sum, n) => sum + (n.vistas || 0), 0)
  const conteoPorPlan = publicados.reduce((acc, n) => {
    const plan = n.plan || 'Gratuito'
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {})

  const aplicarFiltro = (lista) => {
    if (filtroPlan === 'Todos') return lista
    return lista.filter(n => n.plan === filtroPlan)
  }
  const pendientesFiltrados = aplicarFiltro(pendientes)
  const publicadosFiltrados = aplicarFiltro(publicados)

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="font-display text-2xl text-navy mb-6 text-center tracking-wide">Acceso Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Contraseña de administrador" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado focus:outline-none font-body" autoFocus />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">Ingresar</button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-navy py-3 rounded-lg font-body font-bold hover:bg-gray-300 transition">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (editando) {
    return (
      <div className="fixed inset-0 bg-crema z-50 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl text-navy tracking-wide">{editando.activo ? 'Editar Negocio Publicado' : 'Revisar y Aprobar Solicitud'}</h1>
            <button onClick={() => setEditando(null)} className="font-body text-navy hover:text-dorado font-bold flex items-center gap-2">← Volver</button>
          </div>
          {mensaje && (
            <div className={`p-4 rounded-lg mb-6 font-body font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensaje}</div>
          )}
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Nombre del negocio *</label>
                <input name="nombre" value={editando.nombre} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Tipo *</label>
                <select name="tipo" value={editando.tipo} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm">
                  <option value="Comercio">Comercio</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Profesion">Profesion</option>
                  <option value="Productor Local">Productor Local</option>
                  <option value="Emprendimiento">Emprendimiento</option>
                </select>
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Categorias (max 3, separadas por coma) *</label>
                <input name="categoria" value={editando.categoria} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" placeholder="Ej: Gastronomia, Delivery" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Plan *</label>
                <select name="plan" value={editando.plan} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm font-bold">
                  <option value="Gratuito">Gratuito</option>
                  <option value="Estandar">Estandar</option>
                  <option value="Destacado">Destacado</option>
                  <option value="Patrocinado">Patrocinado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Descripcion *</label>
              <textarea name="descripcion" value={editando.descripcion} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Persona de contacto</label>
                <input name="nombre_contacto" value={editando.nombre_contacto || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Telefono</label>
                <input name="telefono" value={editando.telefono} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">WhatsApp (solo numeros)</label>
                <input name="whatsapp" value={editando.whatsapp} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Email</label>
                <input name="email" value={editando.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Direccion</label>
                <input name="direccion" value={editando.direccion || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Horario</label>
                <input name="horario" value={editando.horario || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
            </div>

            <div className="border-t border-navy/10 pt-6">
              <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-4">Multimedia, Ubicacion y Redes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Foto de Portada</label>
                  {editando.foto_portada && (<img src={editando.foto_portada} alt="Portada" className="w-full h-24 object-cover rounded-lg mb-2" />)}
                  <label className={`block w-full text-center py-2 rounded-lg font-body font-bold cursor-pointer transition text-sm ${subiendoPortada ? 'bg-gray-300 text-gray-500' : 'bg-dorado text-navy hover:bg-dorado-claro'}`}>
                    {subiendoPortada ? '⏳ Subiendo...' : '📷 Subir foto de portada'}
                    <input type="file" accept="image/*" onChange={manejarSubidaPortada} className="hidden" disabled={subiendoPortada} />
                  </label>
                </div>
                <div>
                  <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Link de Google Maps</label>
                  <input name="google_maps_url" value={editando.google_maps_url || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" placeholder="https://maps.app.goo.gl/..." />
                </div>
                <div>
                  <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Instagram (sin @)</label>
                  <input name="instagram" value={editando.instagram || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
                </div>
                <div>
                  <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Facebook (URL o usuario)</label>
                  <input name="facebook" value={editando.facebook || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
                </div>
              </div>

              {maxGaleria > 0 ? (
                <div className="mt-6">
                  <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide text-xs">Galeria ({(editando.galeria || []).length}/{maxGaleria} imagenes)</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-2">
                    {(editando.galeria || []).map((foto, idx) => (
                      <div key={idx} className="relative">
                        <img src={foto} alt={`Galeria ${idx + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                        <button type="button" onClick={() => quitarFotoGaleria(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold hover:bg-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                  {(editando.galeria || []).length < maxGaleria && (
                    <label className={`block w-full text-center py-2 rounded-lg font-body font-bold cursor-pointer transition text-sm ${subiendoGaleria ? 'bg-gray-300 text-gray-500' : 'bg-navy text-crema hover:bg-navy-dark'}`}>
                      {subiendoGaleria ? '⏳ Subiendo...' : `📷 Subir imagenes (${(editando.galeria || []).length}/${maxGaleria})`}
                      <input type="file" accept="image/*" multiple onChange={manejarSubidaGaleria} className="hidden" disabled={subiendoGaleria} />
                    </label>
                  )}
                </div>
              ) : (
                <p className="mt-4 font-body text-navy/50 text-xs">📷 La galeria de fotos esta disponible en los planes Destacado (3 fotos) y Patrocinado (5 fotos).</p>
              )}

              {editando.plan === 'Patrocinado' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Video (YouTube)</label>
                    <input name="video_url" value={editando.video_url || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div>
                    <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Banner propio</label>
                    {editando.banner_url && (<img src={editando.banner_url} alt="Banner" className="w-full h-24 object-cover rounded-lg mb-2" />)}
                    <label className={`block w-full text-center py-2 rounded-lg font-body font-bold cursor-pointer transition text-sm ${subiendoBanner ? 'bg-gray-300 text-gray-500' : 'bg-navy text-crema hover:bg-navy-dark'}`}>
                      {subiendoBanner ? '⏳ Subiendo...' : '🖼️ Subir banner'}
                      <input type="file" accept="image/*" onChange={manejarSubidaBanner} className="hidden" disabled={subiendoBanner} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-navy/10">
              <button onClick={guardarNegocio} className="flex-1 bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition">💾 Guardar Cambios {editando.activo ? '' : 'y Aprobar'}</button>
              <button onClick={() => eliminarNegocio(editando.id, editando.nombre)} className="px-8 py-3 border-2 border-red-500 text-red-600 rounded-lg font-body font-bold hover:bg-red-50 transition">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-crema z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl text-navy tracking-wide">Panel de Administracion</h1>
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg font-body font-bold hover:bg-red-600 transition">Salir</button>
        </div>
        
        {mensaje && (
          <div className={`p-4 rounded-lg mb-6 font-body font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}

        {/* 🆕 MODAL DE ENVÍO DE REPORTE */}
        {reporteData && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="font-display text-xl text-navy mb-4">📊 Reporte Generado</h3>
              <p className="font-body text-sm text-navy/70 mb-6">
                El PDF se descargo en tu dispositivo. Ahora elegi como enviar el resumen al comercio (no olvides adjuntar el PDF descargado):
              </p>
              <div className="space-y-3">
                <button onClick={copiarAlPortapapeles} className="w-full bg-green-500 text-white py-3 rounded-lg font-body font-bold hover:bg-green-600 transition flex items-center justify-center gap-2">
                  📋 Copiar texto para WhatsApp
                </button>
                <button onClick={abrirEmail} className="w-full bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition flex items-center justify-center gap-2">
                  ✉️ Abrir Email
                </button>
                <button onClick={() => setReporteData(null)} className="w-full text-navy/60 py-2 text-sm hover:text-navy transition">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setVistaActual('dashboard')} className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${vistaActual === 'dashboard' ? 'bg-navy text-crema shadow-md' : 'bg-white text-navy/60 hover:bg-crema'}`}>📊 Dashboard</button>
          <button onClick={() => setVistaActual('pendientes')} className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${vistaActual === 'pendientes' ? 'bg-navy text-crema shadow-md' : 'bg-white text-navy/60 hover:bg-crema'}`}>🕒 Pendientes ({pendientes.length})</button>
          <button onClick={() => setVistaActual('publicados')} className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${vistaActual === 'publicados' ? 'bg-dorado text-navy shadow-md' : 'bg-white text-navy/60 hover:bg-crema'}`}>✅ Publicados ({publicados.length})</button>
          <button onClick={() => setVistaActual('resenas')} className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${vistaActual === 'resenas' ? 'bg-navy text-crema shadow-md' : 'bg-white text-navy/60 hover:bg-crema'}`}>⭐ Resenas ({resenas.filter(r => !r.aprobado).length})</button>
          <button onClick={() => setVistaActual('promociones')} className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${vistaActual === 'promociones' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-navy/60 hover:bg-crema'}`}>🎁 Promociones ({promociones.filter(p => !p.aprobada).length})</button>
        </div>

        {/* VISTA DASHBOARD */}
        {vistaActual === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-oliva">
                <p className="font-label text-navy/60 text-xs uppercase tracking-wider mb-1">Negocios Activos</p>
                <p className="font-display text-4xl text-navy tracking-wide">{totalActivos}</p>
                <p className="font-body text-xs text-navy/50 mt-2">De un total de {publicados.length} registrados</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-dorado">
                <p className="font-label text-navy/60 text-xs uppercase tracking-wider mb-1">Pendientes de Aprobacion</p>
                <p className="font-display text-4xl text-navy tracking-wide">{pendientes.length}</p>
                <p className="font-body text-xs text-navy/50 mt-2">Requieren tu revision</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-navy">
                <p className="font-label text-navy/60 text-xs uppercase tracking-wider mb-1">Vistas Totales</p>
                <p className="font-display text-4xl text-navy tracking-wide">{totalVistas.toLocaleString()}</p>
                <p className="font-body text-xs text-navy/50 mt-2">Impacto generado en la web</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <p className="font-label text-navy/60 text-xs uppercase tracking-wider mb-1">Suspendidos</p>
                <p className="font-display text-4xl text-navy tracking-wide">{totalSuspendidos}</p>
                <p className="font-body text-xs text-navy/50 mt-2">Por falta de pago o revision</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-display text-2xl text-navy mb-6 tracking-wide">Distribucion por Plan (Activos)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg text-center"><p className="font-label text-gray-600 text-xs uppercase font-bold">Gratuito</p><p className="font-display text-3xl text-navy mt-1">{conteoPorPlan['Gratuito'] || 0}</p></div>
                <div className="bg-crema p-4 rounded-lg text-center border border-navy/10"><p className="font-label text-navy/70 text-xs uppercase font-bold">Estandar</p><p className="font-display text-3xl text-navy mt-1">{conteoPorPlan['Estandar'] || 0}</p></div>
                <div className="bg-dorado/20 p-4 rounded-lg text-center border border-dorado"><p className="font-label text-navy text-xs uppercase font-bold">Destacado</p><p className="font-display text-3xl text-navy mt-1">{conteoPorPlan['Destacado'] || 0}</p></div>
                <div className="bg-navy p-4 rounded-lg text-center"><p className="font-label text-crema/80 text-xs uppercase font-bold">Patrocinado</p><p className="font-display text-3xl text-crema mt-1">{conteoPorPlan['Patrocinado'] || 0}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA RESENAS */}
        {vistaActual === 'resenas' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-display text-2xl text-navy mb-6 tracking-wide">⭐ Gestion de Resenas</h3>
            {resenas.length === 0 ? (
              <p className="text-navy/60 text-center py-8">No hay resenas registradas</p>
            ) : (
              <div className="space-y-4">
                {resenas.map((r) => (
                  <div key={r.id} className={`p-4 rounded-lg border-2 ${r.aprobado ? 'bg-green-50 border-green-200' : 'bg-dorado/10 border-dorado'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-body font-bold text-navy">{r.nombre}</p>
                        <p className="font-body text-xs text-navy/60">Para: {r.negocios?.nombre || 'Negocio eliminado'} • {new Date(r.created_at).toLocaleDateString('es-AR')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-dorado text-lg">{'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}</span>
                        <span className={`font-label text-xs px-2 py-1 rounded ${r.aprobado ? 'bg-green-500 text-white' : 'bg-dorado text-navy'}`}>{r.aprobado ? 'Publicada' : 'Pendiente'}</span>
                      </div>
                    </div>
                    <p className="font-body text-navy/80 text-sm mb-3">{r.comentario}</p>
                    <div className="flex gap-2">
                      {!r.aprobado && (<button onClick={() => aprobarResena(r)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-body font-bold text-sm hover:bg-green-600 transition">✅ Aprobar</button>)}
                      <button onClick={() => eliminarResena(r.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg font-body font-bold text-sm hover:bg-red-600 transition">🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA PROMOCIONES */}
        {vistaActual === 'promociones' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-display text-2xl text-navy mb-6 tracking-wide">🎁 Moderacion de Promociones</h3>
            {promociones.length === 0 ? (
              <p className="text-navy/60 text-center py-8">No hay promociones registradas.</p>
            ) : (
              <div className="space-y-4">
                {promociones.map((p) => {
                  const vencida = new Date(p.fecha_fin) < new Date()
                  return (
                    <div key={p.id} className={`p-4 rounded-lg border-2 ${!p.aprobada ? 'bg-dorado/10 border-dorado' : vencida ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div>
                          <p className="font-body font-bold text-navy text-lg">{p.titulo}</p>
                          <p className="font-body text-xs text-navy/60">Negocio: <strong>{p.negocios?.nombre || 'Eliminado'}</strong> • Plan: {p.negocios?.plan}</p>
                          <p className="font-body text-xs text-navy/60">Vigencia: {new Date(p.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(p.fecha_fin).toLocaleDateString('es-AR')}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {vencida && <span className="font-label text-xs px-2 py-1 rounded bg-gray-500 text-white">Vencida</span>}
                          <span className={`font-label text-xs px-2 py-1 rounded ${p.aprobada ? 'bg-green-500 text-white' : 'bg-yellow-400 text-navy'}`}>{p.aprobada ? 'Aprobada' : 'Pendiente'}</span>
                        </div>
                      </div>
                      <p className="font-body text-navy/80 text-sm mb-3 bg-white/50 p-3 rounded">{p.descripcion}</p>
                      <div className="flex gap-2">
                        {!p.aprobada && !vencida && (<button onClick={() => aprobarPromo(p.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-body font-bold text-sm hover:bg-green-600 transition">✅ Aprobar</button>)}
                        <button onClick={() => rechazarPromo(p.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg font-body font-bold text-sm hover:bg-red-600 transition">🗑️ Eliminar</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VISTA PENDIENTES / PUBLICADOS */}
        {(vistaActual === 'pendientes' || vistaActual === 'publicados') && (
          <>
            <div className="bg-white px-4 py-3 border-b border-navy/10 flex flex-wrap items-center gap-3 rounded-t-xl">
              <span className="font-label text-navy font-bold uppercase tracking-wide text-xs">Filtrar por plan:</span>
              <div className="flex flex-wrap gap-2">
                {PLANES.map(plan => (
                  <button key={plan} onClick={() => setFiltroPlan(plan)} className={`px-3 py-1 rounded-full text-xs font-body font-bold transition ${filtroPlan === plan ? 'bg-navy text-crema' : 'bg-crema text-navy hover:bg-navy/10'}`}>{plan}</button>
                ))}
              </div>
              <button onClick={cargarDatos} className="ml-auto text-xs bg-navy/10 px-3 py-1 rounded hover:bg-navy/20 transition font-bold">🔄 Actualizar</button>
            </div>
            <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
              {cargando ? (
                <div className="p-8 text-center text-navy/60 font-body">Cargando datos...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-crema text-navy uppercase text-xs font-label tracking-wider">
                      <tr>
                        <th className="p-4">Negocio</th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4">Categoria / Plan</th>
                        <th className="p-4">Vistas</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/10 font-body text-sm">
                      {(vistaActual === 'pendientes' ? pendientesFiltrados : publicadosFiltrados).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-navy/60">
                            <p className="text-4xl mb-4">{vistaActual === 'pendientes' ? '🎉' : '📭'}</p>
                            <p className="text-lg font-bold">No hay registros en esta seccion{filtroPlan !== 'Todos' ? ` con plan "${filtroPlan}"` : ''}.</p>
                          </td>
                        </tr>
                      ) : (
                        (vistaActual === 'pendientes' ? pendientesFiltrados : publicadosFiltrados).map((sol) => (
                          <tr key={sol.id} className={`hover:bg-crema/50 transition ${sol.suspendido ? 'bg-red-50' : ''}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-navy">{sol.nombre}</span>
                                {sol.suspendido && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-label uppercase">Suspendido</span>}
                              </div>
                              <div className="text-xs text-navy/60">{sol.tipo}</div>
                              {sol.codigo_acceso && (
                                <div className="text-xs font-mono bg-dorado/20 text-navy px-2 py-1 rounded mt-1 inline-block">
                                  Codigo: <strong>{sol.codigo_acceso}</strong>
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="text-navy">{sol.nombre_contacto || 'No especificado'}</div>
                              <div className="text-xs text-navy/60">{sol.telefono}</div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block bg-crema text-navy text-xs px-2 py-1 rounded mb-1 border border-navy/10">{sol.categoria}</span>
                              <br />
                              <span className={`inline-block text-xs px-2 py-1 rounded font-bold ${sol.plan === 'Patrocinado' ? 'bg-navy text-crema' : sol.plan === 'Destacado' ? 'bg-dorado text-navy' : 'bg-gray-200 text-gray-700'}`}>{sol.plan}</span>
                            </td>
                            <td className="p-4 text-xs text-navy/60">{sol.vistas || 0} 👁️</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2 justify-center">
                                {/* 🆕 BOTÓN DE REPORTE */}
                                <button 
                                  onClick={() => generarReportePDF(sol)} 
                                  className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 transition text-xs flex items-center gap-1"
                                >
                                  📊 Reporte
                                </button>
                                <button onClick={() => abrirEdicion(sol)} className="bg-dorado text-navy px-3 py-1.5 rounded-lg font-bold hover:bg-dorado-claro transition text-xs flex items-center gap-1">✏️ Editar</button>
                                {vistaActual === 'publicados' && (
                                  <button onClick={() => toggleSuspender(sol)} className={`px-3 py-1.5 rounded-lg font-bold transition text-xs flex items-center gap-1 ${sol.suspendido ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                                    {sol.suspendido ? '🔄 Reactivar' : '⏸️ Suspender'}
                                  </button>
                                )}
                                <button onClick={() => eliminarNegocio(sol.id, sol.nombre)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition text-xs flex items-center gap-1">🗑️ Eliminar</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
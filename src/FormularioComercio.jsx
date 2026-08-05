import { useState } from 'react'
import { supabase } from './supabase'

function FormularioComercio({ onClose }) {
  const [formData, setFormData] = useState({
    nombre: '', tipo: 'Comercio', categoria: '', nombre_contacto: '', telefono: '', whatsapp: '', email: '', descripcion: '', direccion: '', horario: '', google_maps_url: '', plan: 'Gratuito', instagram: '', facebook: '', recomendacion: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  const enviarTelegram = async (datos) => {
    const token = 'TU_TOKEN_DE_TELEGRAM_AQUI' // ¡Recordá poner tu token!
    const chatId = 'TU_CHAT_ID_AQUI'          // ¡Recordá poner tu chat ID!
    const mensaje = `
📋 *NUEVA PUBLICACIÓN EN MIPIN*
🏪 *Negocio:* ${datos.nombre}
📂 *Tipo:* ${datos.tipo}
📁 *Categoría:* ${datos.categoria}
👤 *Contacto:* ${datos.nombre_contacto}
📞 *Teléfono:* ${datos.telefono}
📱 *WhatsApp:* ${datos.whatsapp}
📧 *Email:* ${datos.email}
💬 *Descripción:* ${datos.descripcion || 'Sin descripción'}
📍 *Dirección:* ${datos.direccion || 'No especificada'}
⏰ *Horario:* ${datos.horario || 'No especificado'}
🗺️ *Google Maps:* ${datos.google_maps_url || 'No especificado'}
💼 *Plan:* ${datos.plan}
📱 *Instagram:* ${datos.instagram || '-'}
📘 *Facebook:* ${datos.facebook || '-'}
👥 *Recomendación:* ${datos.recomendacion || 'Sin recomendación'}
    `.trim()
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
      })
    } catch (err) { console.error('Error Telegram:', err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const datosParaDB = {
        ...formData,
        activo: false,
        destacado: formData.plan === 'Destacado' || formData.plan === 'Patrocinado',
        vistas: 0,
        redes_sociales: JSON.stringify({ instagram: formData.instagram, facebook: formData.facebook }),
      }
      const { error } = await supabase.from('negocios').insert([datosParaDB])
      if (error) throw error
      await enviarTelegram(formData)
      setExito(true)
      setTimeout(() => onClose(), 3000)
    } catch (err) {
      console.error('Error:', err)
      setError('Hubo un error: ' + err.message)
    } finally { setEnviando(false) }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-oliva text-6xl mb-4">✓</div>
          <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">¡Publicación Enviada!</h2>
          <p className="font-body text-navy/70 mb-6">Revisaremos tu publicación y te contactaremos en las próximas 48 horas.</p>
          <button onClick={onClose} className="bg-navy text-crema px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">Cerrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-crema rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl text-navy tracking-wide">Publicar en MiPin</h2>
          <button onClick={onClose} className="text-navy/60 hover:text-navy text-2xl font-bold">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Nombre del negocio *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
            </div>
            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Tipo *</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm">
                <option value="Comercio">Comercio</option><option value="Servicio">Servicio</option><option value="Profesión">Profesión</option><option value="Productor Local">Productor Local</option><option value="Emprendimiento">Emprendimiento</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Categoría *</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm">
                <option value="">Seleccionar...</option><option value="Gastronomía">Gastronomía</option><option value="Salud y Farmacias">Salud y Farmacias</option><option value="Servicios y Oficios">Servicios y Oficios</option><option value="Agropecuario">Agropecuario</option><option value="Automotor">Automotor</option><option value="Construcción">Construcción</option><option value="Educación">Educación</option><option value="Turismo">Turismo</option><option value="Profesiones">Profesiones</option><option value="Productores">Productores</option><option value="Emprendimientos">Emprendimientos</option><option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Plan *</label>
              <select name="plan" value={formData.plan} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm">
                <option value="Gratuito">Gratuito - $0/mes</option><option value="Estándar">Estándar - $X.XXX/mes</option><option value="Destacado">Destacado - $X.XXX/mes</option><option value="Patrocinado">Patrocinado - Consultar</option>
              </select>
            </div>
          </div>

          <div className="border-t border-navy/10 pt-4">
            <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-3">Persona de contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="nombre_contacto" placeholder="Nombre y apellido *" value={formData.nombre_contacto} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              <input type="tel" name="telefono" placeholder="Teléfono *" value={formData.telefono} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              <input type="text" name="whatsapp" placeholder="WhatsApp (solo números) *" value={formData.whatsapp} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
            </div>
          </div>

          <div className="border-t border-navy/10 pt-4">
            <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-3">Información del negocio</h3>
            <div className="space-y-4">
              <textarea name="descripcion" placeholder="Descripción breve *" value={formData.descripcion} onChange={handleChange} required rows="2" className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
                <input type="text" name="horario" placeholder="Horario" value={formData.horario} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              </div>
              <input type="text" name="google_maps_url" placeholder="Link Google Maps (opcional)" value={formData.google_maps_url} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
            </div>
          </div>

          <div className="border-t border-navy/10 pt-4">
            <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-3">Redes sociales (opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="instagram" placeholder="Instagram (@)" value={formData.instagram} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
              <input type="text" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
            </div>
          </div>

          <div className="border-t border-navy/10 pt-4">
            <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-3">¿Quién te recomendó?</h3>
            <input type="text" name="recomendacion" placeholder="Nombre de la persona o comercio" value={formData.recomendacion} onChange={handleChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body text-sm" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-body text-sm">{error}</div>}
          
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={enviando} className="flex-1 bg-dorado text-navy py-3 rounded-lg font-body font-bold hover:bg-dorado-claro transition disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {enviando ? 'Enviando...' : 'Enviar Publicación'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border-2 border-navy/30 text-navy rounded-lg font-body font-bold hover:bg-navy/10 transition text-sm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default FormularioComercio
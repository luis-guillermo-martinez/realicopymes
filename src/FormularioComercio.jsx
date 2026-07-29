import { useState } from 'react'
import { supabase } from './supabase'

function FormularioComercio({ onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Comercio',
    categoria: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    whatsapp: '',
    email: '',
    horario: '',
    plan: 'Gratuito'
  })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const enviarTelegram = async (datos) => {
    const token = 'TU_TOKEN_DE_TELEGRAM_AQUI'
    const chatId = 'TU_CHAT_ID_AQUI'
    
    const mensaje = `
📋 *NUEVA PUBLICACIÓN*

🏪 *Nombre:* ${datos.nombre}
 *Tipo:* ${datos.tipo}
📁 *Categoría:* ${datos.categoria}
 *Contacto:* ${datos.email}
 *Teléfono:* ${datos.telefono}
📍 *Dirección:* ${datos.direccion || 'No especificada'}
💼 *Plan:* ${datos.plan}
💬 *Descripción:* ${datos.descripcion || 'Sin descripción'}
    `.trim()

    try {
      const respuesta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
      })
      if (!respuesta.ok) throw new Error(`Error Telegram: ${respuesta.status}`)
      console.log('✅ Telegram enviado')
    } catch (err) {
      console.error('❌ Error Telegram:', err)
      throw err
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    try {
      const { error } = await supabase.from('negocios').insert([{
        ...formData,
        activo: false,
        destacado: formData.plan === 'Destacado' || formData.plan === 'Patrocinado',
        vistas: 0
      }])

      if (error) throw error
      await enviarTelegram(formData)

      setExito(true)
      setTimeout(() => onClose(), 3000)
    } catch (err) {
      console.error('Error:', err)
      setError('Hubo un error: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-oliva text-6xl mb-4">✓</div>
          <h2 className="font-display text-3xl text-navy mb-4 tracking-wide">¡Publicación Enviada!</h2>
          <p className="font-body text-navy/70 mb-6">
            Revisaremos tu publicación y te contactaremos en las próximas 48 horas.
          </p>
          <button onClick={onClose} className="bg-navy text-crema px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">Cerrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-crema rounded-xl p-8 max-w-2xl w-full my-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl text-navy tracking-wide">Publicar en el Directorio</h2>
          <button onClick={onClose} className="text-navy/60 hover:text-navy text-2xl font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Ej: Panadería La Espiga" />
            </div>

            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Tipo *</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body">
                <option value="Comercio">Comercio</option>
                <option value="Servicio">Servicio</option>
                <option value="Profesión">Profesión</option>
                <option value="Productor Local">Productor Local</option>
                <option value="Emprendimiento">Emprendimiento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Categoría *</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body">
                <option value="">Seleccionar...</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Salud y Farmacias">Salud y Farmacias</option>
                <option value="Servicios y Oficios">Servicios y Oficios</option>
                <option value="Agropecuario">Agropecuario</option>
                <option value="Automotor">Automotor</option>
                <option value="Construcción">Construcción</option>
                <option value="Educación">Educación</option>
                <option value="Turismo">Turismo</option>
                <option value="Profesiones">Profesiones</option>
                <option value="Productores">Productores</option>
                <option value="Emprendimientos">Emprendimientos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Plan *</label>
              <select name="plan" value={formData.plan} onChange={handleChange} className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body">
                <option value="Gratuito">Gratuito</option>
                <option value="Estándar">Estándar</option>
                <option value="Destacado">Destacado</option>
                <option value="Patrocinado">Patrocinado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Descripción breve *</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows="3" className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Contá en pocas palabras qué ofrecés..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Teléfono / WhatsApp *</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Ej: (02955) 12-3456" />
            </div>

            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">WhatsApp (solo número) *</label>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Ej: 5492955123456" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="tu@email.com" />
            </div>

            <div>
              <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Ej: Av. Libertador 123" />
            </div>
          </div>

          <div>
            <label className="block font-label text-navy font-bold mb-2 uppercase tracking-wide">Horario</label>
            <input type="text" name="horario" value={formData.horario} onChange={handleChange} className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white font-body" placeholder="Ej: Lunes a Viernes 9:00 - 18:00" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-body">{error}</div>
          )}

          <div className="flex gap-4">
            <button type="submit" disabled={enviando} className="flex-1 bg-dorado text-navy py-4 rounded-lg font-body font-bold hover:bg-dorado-claro transition disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? 'Enviando...' : 'Enviar Publicación'}
            </button>
            <button type="button" onClick={onClose} className="px-8 py-4 border-2 border-navy/30 text-navy rounded-lg font-body font-bold hover:bg-navy/10 transition">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioComercio
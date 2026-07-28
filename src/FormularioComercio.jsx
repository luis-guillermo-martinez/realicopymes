import { useState } from 'react'
import { supabase } from './supabase'

function FormularioComercio({ onClose }) {
  const [formData, setFormData] = useState({
    nombre_comercio: '',
    nombre_contacto: '',
    telefono: '',
    email: '',
    categoria: '',
    direccion: '',
    mensaje: '',
    plan_interes: 'Gratuito'
  })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const enviarTelegram = async (datos) => {
    // ⚠️ REEMPLAZÁ ESTOS VALORES CON TUS CREDENCIALES REALES DE TELEGRAM
    const token = '8148372070:AAGcVESfbNhZuXAKss2v9lnOXa6_qyj90z4'
    const chatId = '6436917492'
    
    const mensaje = `
📋 *NUEVA SOLICITUD DE COMERCIO*

🏪 *Comercio:* ${datos.nombre_comercio}
👤 *Contacto:* ${datos.nombre_contacto}
📞 *Teléfono:* ${datos.telefono}
📧 *Email:* ${datos.email}
📂 *Categoría:* ${datos.categoria}
 *Dirección:* ${datos.direccion || 'No especificada'}
💼 *Plan:* ${datos.plan_interes}
💬 *Mensaje:* ${datos.mensaje || 'Sin mensaje'}
    `.trim()

    try {
      const respuesta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'Markdown'
        })
      })
      
      if (!respuesta.ok) {
        throw new Error(`Error de Telegram: ${respuesta.status}`)
      }
      
      console.log('✅ Telegram enviado con éxito')
    } catch (err) {
      console.error('❌ Error enviando Telegram:', err)
      throw err
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    try {
      const { error } = await supabase
        .from('solicitudes_comercios')
        .insert([formData])

      if (error) throw error

      await enviarTelegram(formData)

      setExito(true)
      setFormData({
        nombre_comercio: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        categoria: '',
        direccion: '',
        mensaje: '',
        plan_interes: 'Gratuito'
      })

      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (err) {
      console.error('Error general:', err)
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
          <h2 className="text-2xl font-bold text-navy mb-4">¡Solicitud Enviada!</h2>
          <p className="text-navy/70 mb-6">
            Nos contactaremos con vos en las próximas 48 horas para confirmar tu registro.
          </p>
          <button 
            onClick={onClose}
            className="bg-navy text-white px-6 py-3 rounded-lg font-bold hover:bg-navy-dark transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-crema rounded-xl p-8 max-w-2xl w-full my-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-navy">Sumá tu Comercio</h2>
          <button 
            onClick={onClose}
            className="text-navy/60 hover:text-navy text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy font-bold mb-2">
                Nombre del Comercio *
              </label>
              <input
                type="text"
                name="nombre_comercio"
                value={formData.nombre_comercio}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
                placeholder="Ej: Panadería La Espiga"
              />
            </div>

            <div>
              <label className="block text-navy font-bold mb-2">
                Nombre del Contacto *
              </label>
              <input
                type="text"
                name="nombre_contacto"
                value={formData.nombre_contacto}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
                placeholder="Tu nombre completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy font-bold mb-2">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
                placeholder="Ej: (02955) 12-3456"
              />
            </div>

            <div>
              <label className="block text-navy font-bold mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy font-bold mb-2">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
              >
                <option value="">Seleccionar...</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Salud y Farmacias">Salud y Farmacias</option>
                <option value="Servicios y Oficios">Servicios y Oficios</option>
                <option value="Agropecuario">Agropecuario</option>
                <option value="Automotor">Automotor</option>
                <option value="Construcción">Construcción</option>
                <option value="Educación">Educación</option>
                <option value="Turismo">Turismo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-navy font-bold mb-2">
                Plan de Interés
              </label>
              <select
                name="plan_interes"
                value={formData.plan_interes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
              >
                <option value="Gratuito">Gratuito</option>
                <option value="Destacado">Destacado</option>
                <option value="Patrocinado">Patrocinado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-navy font-bold mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
              placeholder="Ej: Av. Libertador 123, Realicó"
            />
          </div>

          <div>
            <label className="block text-navy font-bold mb-2">
              Mensaje / Consulta
            </label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dorado bg-white"
              placeholder="Contanos más sobre tu comercio o hacé tu consulta..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 bg-dorado text-navy py-4 rounded-lg font-bold hover:bg-dorado-claro transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border-2 border-navy/30 text-navy rounded-lg font-bold hover:bg-navy/10 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioComercio
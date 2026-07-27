import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Contraseña simple para el MVP (cambiala por la que quieras)
  const ADMIN_PASSWORD = 'realico2026'

  useEffect(() => {
    if (isAuthenticated) {
      cargarSolicitudes()
    }
  }, [isAuthenticated])

  const cargarSolicitudes = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('solicitudes_comercios')
      .select('*')
      .eq('estado', 'Pendiente')
      .order('fecha_solicitud', { ascending: false })

    if (error) console.error('Error cargando solicitudes:', error)
    else setSolicitudes(data || [])
    
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

  const aprobarComercio = async (solicitud) => {
    if (!window.confirm(`¿Aprobar y publicar a "${solicitud.nombre_comercio}"?`)) return

    setMensaje('Procesando...')
    
    try {
      // 1. Crear el negocio en la tabla principal
      const { error: errorNegocio } = await supabase.from('negocios').insert({
        nombre: solicitud.nombre_comercio,
        categoria: solicitud.categoria,
        descripcion: solicitud.mensaje || 'Comercio local de confianza en Realicó',
        direccion: solicitud.direccion || 'Consultar',
        telefono: solicitud.telefono,
        whatsapp: solicitud.telefono.replace(/\D/g, ''), // Limpia el número para WhatsApp
        horario: 'Consultar horario',
        activo: true,
        // Si eligió Destacado o Patrocinado, lo marcamos como destacado
        destacado: solicitud.plan_interes === 'Destacado' || solicitud.plan_interes === 'Patrocinado'
      })

      if (errorNegocio) throw errorNegocio

      // 2. Cambiar el estado de la solicitud a "Aprobado"
      const { error: errorSolicitud } = await supabase
        .from('solicitudes_comercios')
        .update({ estado: 'Aprobado' })
        .eq('id', solicitud.id)

      if (errorSolicitud) throw errorSolicitud

      setMensaje(`✅ "${solicitud.nombre_comercio}" aprobado y publicado con éxito.`)
      
      // 3. Recargar la lista
      setTimeout(() => {
        setMensaje('')
        cargarSolicitudes()
      }, 2000)

    } catch (error) {
      console.error('Error al aprobar:', error)
      setMensaje('❌ Error al aprobar. Revisá la consola.')
    }
  }

  // --- VISTA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acceso Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-800 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Ingresar
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // --- VISTA DEL PANEL ---
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Panel de Administración</h1>
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition">
            Salir del Panel
          </button>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-lg mb-6 font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-800 text-white p-4">
            <h2 className="text-xl font-bold">Solicitudes Pendientes ({solicitudes.length})</h2>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>
          ) : solicitudes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">🎉 ¡No hay solicitudes pendientes!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase text-sm">
                  <tr>
                    <th className="p-4">Comercio</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Categoría / Plan</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {solicitudes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{sol.nombre_comercio}</div>
                        <div className="text-sm text-gray-500">{sol.direccion || 'Sin dirección'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{sol.nombre_contacto}</div>
                        <div className="text-sm text-blue-600">{sol.telefono}</div>
                        <div className="text-sm text-gray-500">{sol.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mb-1">
                          {sol.categoria}
                        </span>
                        <br />
                        <span className={`inline-block text-xs px-2 py-1 rounded font-bold ${
                          sol.plan_interes === 'Destacado' ? 'bg-yellow-200 text-yellow-800' :
                          sol.plan_interes === 'Patrocinado' ? 'bg-purple-200 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {sol.plan_interes}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(sol.fecha_solicitud).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => aprobarComercio(sol)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition text-sm flex items-center gap-2 mx-auto"
                        >
                          ✅ Aprobar y Publicar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
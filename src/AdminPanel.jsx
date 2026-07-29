import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [vistaActual, setVistaActual] = useState('pendientes')
  const [filtroPlan, setFiltroPlan] = useState('Todos')
  
  const [pendientes, setPendientes] = useState([])
  const [publicados, setPublicados] = useState([])
  
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const ADMIN_PASSWORD = 'realico2026'
  const PLANES = ['Todos', 'Gratuito', 'Estándar', 'Destacado', 'Patrocinado']

  useEffect(() => {
    if (isAuthenticated) cargarDatos()
  }, [isAuthenticated])

  const cargarDatos = async () => {
    setCargando(true)
    
    const { data: dataPendientes } = await supabase
      .from('negocios')
      .select('*')
      .eq('activo', false)
      .order('created_at', { ascending: false })

    const { data: dataPublicados } = await supabase
      .from('negocios')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    setPendientes(dataPendientes || [])
    setPublicados(dataPublicados || [])
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

  const handleInputChange = (e) => {
    setEditando({ ...editando, [e.target.name]: e.target.value })
  }

  const guardarNegocio = async () => {
    if (!window.confirm(`¿Guardar cambios y ${editando.activo ? 'actualizar' : 'aprobar y publicar'} a "${editando.nombre}"?`)) return

    setMensaje('Procesando...')
    try {
      const redes = JSON.stringify({
        instagram: editando.instagram || '',
        facebook: editando.facebook || ''
      })

      const { error } = await supabase
        .from('negocios')
        .update({
          nombre: editando.nombre,
          tipo: editando.tipo,
          categoria: editando.categoria,
          descripcion: editando.descripcion,
          direccion: editando.direccion,
          telefono: editando.telefono,
          whatsapp: editando.whatsapp,
          email: editando.email,
          horario: editando.horario,
          plan: editando.plan,
          foto_portada: editando.foto_portada,
          redes_sociales: redes,
          activo: true,
          suspendido: false, // Al aprobar desde admin, nunca queda suspendido
          destacado: editando.plan === 'Destacado' || editando.plan === 'Patrocinado',
          estado: 'Aprobado'
        })
        .eq('id', editando.id)

      if (error) throw error

      setMensaje(`✅ "${editando.nombre}" guardado correctamente.`)
      setEditando(null)
      setTimeout(() => { setMensaje(''); cargarDatos() }, 2500)
    } catch (error) {
      console.error('Error:', error)
      setMensaje('❌ Error: ' + error.message)
    }
  }

  const eliminarNegocio = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE a "${nombre}"? Esta acción no se puede deshacer.`)) return

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

  const toggleSuspender = async (negocio) => {
    const nuevoEstado = !negocio.suspendido
    const accion = nuevoEstado ? 'SUSPENDER' : 'REACTIVAR'
    
    if (!window.confirm(`¿${accion} a "${negocio.nombre}"?\n\n${nuevoEstado ? 'Desaparecerá de la web hasta que lo reactives.' : 'Volverá a aparecer en la web.'}`)) return

    setMensaje('Procesando...')
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ suspendido: nuevoEstado })
        .eq('id', negocio.id)

      if (error) throw error

      setMensaje(`✅ "${negocio.nombre}" ${nuevoEstado ? 'suspendido' : 'reactivado'}.`)
      setEditando(null)
      setTimeout(() => { setMensaje(''); cargarDatos() }, 2500)
    } catch (error) {
      setMensaje('❌ Error: ' + error.message)
    }
  }

  // Filtrar por plan
  const aplicarFiltro = (lista) => {
    if (filtroPlan === 'Todos') return lista
    return lista.filter(n => n.plan === filtroPlan)
  }

  const pendientesFiltrados = aplicarFiltro(pendientes)
  const publicadosFiltrados = aplicarFiltro(publicados)

  // --- LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="font-display text-2xl text-navy mb-6 text-center tracking-wide">Acceso Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado focus:outline-none font-body"
              autoFocus
            />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-navy text-crema py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">Ingresar</button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-navy py-3 rounded-lg font-body font-bold hover:bg-gray-300 transition">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // --- EDICIÓN ---
  if (editando) {
    return (
      <div className="fixed inset-0 bg-crema z-50 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl text-navy tracking-wide">
              {editando.activo ? 'Editar Negocio Publicado' : 'Revisar y Aprobar Solicitud'}
            </h1>
            <button onClick={() => setEditando(null)} className="font-body text-navy hover:text-dorado font-bold flex items-center gap-2">← Volver a la lista</button>
          </div>

          {mensaje && (
            <div className={`p-4 rounded-lg mb-6 font-body font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje}
            </div>
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
                  <option value="Profesión">Profesión</option>
                  <option value="Productor Local">Productor Local</option>
                  <option value="Emprendimiento">Emprendimiento</option>
                </select>
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Categoría *</label>
                <input name="categoria" value={editando.categoria} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Plan *</label>
                <select name="plan" value={editando.plan} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm font-bold">
                  <option value="Gratuito">Gratuito</option>
                  <option value="Estándar">Estándar</option>
                  <option value="Destacado">Destacado</option>
                  <option value="Patrocinado">Patrocinado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Descripción *</label>
              <textarea name="descripcion" value={editando.descripcion} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Persona de contacto</label>
                <input name="nombre_contacto" value={editando.nombre_contacto || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Teléfono</label>
                <input name="telefono" value={editando.telefono} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">WhatsApp (solo números)</label>
                <input name="whatsapp" value={editando.whatsapp} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Email</label>
                <input name="email" value={editando.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Dirección</label>
                <input name="direccion" value={editando.direccion || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
              <div>
                <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">Horario</label>
                <input name="horario" value={editando.horario || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" />
              </div>
            </div>

            <div className="border-t border-navy/10 pt-6">
              <h3 className="font-label text-navy font-bold uppercase tracking-wide text-xs mb-4">Multimedia y Redes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label text-navy font-bold mb-1 uppercase tracking-wide text-xs">URL Foto de Portada</label>
                  <input name="foto_portada" value={editando.foto_portada || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-navy/20 rounded-lg focus:ring-2 focus:ring-dorado font-body text-sm" placeholder="https://..." />
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
            </div>

            <div className="flex gap-4 pt-4 border-t border-navy/10">
              <button onClick={guardarNegocio} className="flex-1 bg-oliva text-white py-3 rounded-lg font-body font-bold hover:bg-oliva-dark transition">
                💾 Guardar Cambios {editando.activo ? '' : 'y Aprobar'}
              </button>
              <button onClick={() => eliminarNegocio(editando.id, editando.nombre)} className="px-8 py-3 border-2 border-red-500 text-red-600 rounded-lg font-body font-bold hover:bg-red-50 transition">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- LISTA CON PESTAÑAS Y FILTRO ---
  return (
    <div className="fixed inset-0 bg-crema z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl text-navy tracking-wide">Panel de Administración</h1>
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg font-body font-bold hover:bg-red-600 transition">Salir</button>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-lg mb-6 font-body font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}

        {/* PESTAÑAS */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setVistaActual('pendientes')}
            className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${
              vistaActual === 'pendientes' ? 'bg-navy text-crema shadow-md' : 'bg-white text-navy/60 hover:bg-crema'
            }`}
          >
            🕒 Pendientes ({pendientes.length})
          </button>
          <button 
            onClick={() => setVistaActual('publicados')}
            className={`px-6 py-3 rounded-t-lg font-body font-bold transition flex items-center gap-2 ${
              vistaActual === 'publicados' ? 'bg-dorado text-navy shadow-md' : 'bg-white text-navy/60 hover:bg-crema'
            }`}
          >
            ✅ Publicados ({publicados.length})
          </button>
        </div>

        {/* FILTRO POR PLAN */}
        <div className="bg-white px-4 py-3 border-b border-navy/10 flex flex-wrap items-center gap-3">
          <span className="font-label text-navy font-bold uppercase tracking-wide text-xs">Filtrar por plan:</span>
          <div className="flex flex-wrap gap-2">
            {PLANES.map(plan => (
              <button
                key={plan}
                onClick={() => setFiltroPlan(plan)}
                className={`px-3 py-1 rounded-full text-xs font-body font-bold transition ${
                  filtroPlan === plan
                    ? 'bg-navy text-crema'
                    : 'bg-crema text-navy hover:bg-navy/10'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
          <button onClick={cargarDatos} className="ml-auto text-xs bg-navy/10 px-3 py-1 rounded hover:bg-navy/20 transition font-bold">🔄 Actualizar</button>
        </div>

        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center text-navy/60 font-body">Cargando datos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-crema text-navy uppercase text-xs font-label tracking-wider">
                  <tr>
                    <th className="p-4">Negocio</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Categoría / Plan</th>
                    <th className="p-4">Vistas</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10 font-body text-sm">
                  {(vistaActual === 'pendientes' ? pendientesFiltrados : publicadosFiltrados).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-navy/60">
                        <p className="text-4xl mb-4">{vistaActual === 'pendientes' ? '' : '📭'}</p>
                        <p className="text-lg font-bold">No hay registros en esta sección{filtroPlan !== 'Todos' ? ` con plan "${filtroPlan}"` : ''}.</p>
                      </td>
                    </tr>
                  ) : (
                    (vistaActual === 'pendientes' ? pendientesFiltrados : publicadosFiltrados).map((sol) => (
                      <tr key={sol.id} className={`hover:bg-crema/50 transition ${sol.suspendido ? 'bg-red-50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy">{sol.nombre}</span>
                            {sol.suspendido && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-label uppercase">Suspendido</span>
                            )}
                          </div>
                          <div className="text-xs text-navy/60">{sol.tipo}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-navy">{sol.nombre_contacto || 'No especificado'}</div>
                          <div className="text-xs text-navy/60">{sol.telefono}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block bg-crema text-navy text-xs px-2 py-1 rounded mb-1 border border-navy/10">{sol.categoria}</span>
                          <br />
                          <span className={`inline-block text-xs px-2 py-1 rounded font-bold ${
                            sol.plan === 'Patrocinado' ? 'bg-navy text-crema' :
                            sol.plan === 'Destacado' ? 'bg-dorado text-navy' :
                            'bg-gray-200 text-gray-700'
                          }`}>{sol.plan}</span>
                        </td>
                        <td className="p-4 text-xs text-navy/60">{sol.vistas || 0} ️</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              onClick={() => setEditando(sol)}
                              className="bg-dorado text-navy px-3 py-1.5 rounded-lg font-bold hover:bg-dorado-claro transition text-xs flex items-center gap-1"
                            >
                              ✏️ Editar
                            </button>
                            {vistaActual === 'publicados' && (
                              <button
                                onClick={() => toggleSuspender(sol)}
                                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                                  sol.suspendido 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                              >
                                {sol.suspendido ? '🔄 Reactivar' : '️ Suspender'}
                              </button>
                            )}
                            <button
                              onClick={() => eliminarNegocio(sol.id, sol.nombre)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition text-xs flex items-center gap-1"
                            >
                              🗑️ Eliminar
                            </button>
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
      </div>
    </div>
  )
}

export default AdminPanel
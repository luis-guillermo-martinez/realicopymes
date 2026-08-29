import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function Promociones() {
  const navigate = useNavigate()
  const [promos, setPromos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarPromos = async () => {
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('promociones')
        .select('*, negocios(nombre, categoria, foto_portada, slug)')
        .eq('aprobada', true)
        .gte('fecha_fin', hoy) // Solo las que no expiraron
        .order('fecha_fin', { ascending: true })
      
      setPromos(data || [])
      setCargando(false)
    }
    cargarPromos()
  }, [])

  return (
    <div className="min-h-screen bg-crema flex flex-col font-body">
      <nav className="bg-crema border-b border-navy/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img src="/logo.png" alt="MiPin" className="h-10 md:h-12 w-auto" />
          </button>
          <button onClick={() => navigate('/')} className="font-body text-navy hover:text-dorado font-semibold flex items-center gap-2">← Volver al inicio</button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="font-display text-4xl md:text-5xl text-navy mb-4 text-center tracking-wide">Promociones Vigentes</h1>
        <p className="font-body text-navy/70 text-center mb-12 max-w-2xl mx-auto text-lg">Aprovechá las ofertas exclusivas de nuestros comercios asociados antes de que terminen.</p>

        {cargando ? (
          <p className="text-center text-navy/60 text-xl">Cargando promociones...</p>
        ) : promos.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-navy/70 text-lg mb-4">No hay promociones vigentes en este momento.</p>
            <button onClick={() => navigate('/')} className="bg-navy text-crema px-6 py-3 rounded-lg font-body font-bold hover:bg-navy-dark transition">Volver al inicio</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-lg border-2 border-dorado hover:shadow-2xl transition duration-300 relative">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white font-label font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  Vence: {new Date(p.fecha_fin).toLocaleDateString('es-AR')}
                </div>
                {p.negocios?.foto_portada && (
                  <img src={p.negocios.foto_portada} alt={p.negocios.nombre} className="w-16 h-16 object-cover rounded-full border-2 border-dorado mb-4 mx-auto" />
                )}
                <h3 className="font-display text-navy text-2xl mb-1 tracking-wide text-center">{p.negocios?.nombre}</h3>
                <p className="font-label text-dorado font-semibold text-xs mb-3 uppercase tracking-wide text-center">{p.negocios?.categoria}</p>
                <div className="bg-dorado/10 p-4 rounded-lg mb-4">
                  <h4 className="font-display text-navy text-lg mb-1">{p.titulo}</h4>
                  <p className="font-body text-navy/80 text-sm">{p.descripcion}</p>
                </div>
                <button onClick={() => navigate(`/ficha/${p.negocios?.slug}`)} className="w-full text-center bg-navy text-crema py-2 rounded-lg font-body font-bold text-sm hover:bg-navy-dark transition">
                  Ver ficha del comercio →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Promociones
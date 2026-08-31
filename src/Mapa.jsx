import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import L from 'leaflet'

// Íconos personalizados según el plan
const crearIcono = (foto, plan) => {
  const tamanos = {
    'Patrocinado': [50, 50],
    'Destacado': [44, 44],
    'Estándar': [38, 38],
    'Gratuito': [32, 32]
  }
  const tamaño = tamanos[plan] || [32, 32]

  // Si hay foto, usar la imagen como pin
  if (foto) {
    return L.icon({
      iconUrl: foto,
      iconSize: tamaño,
      iconAnchor: [tamaño[0] / 2, tamaño[1]],
      popupAnchor: [0, -tamaño[1]],
      className: 'custom-marker-pin'
    })
  }

  // Fallback: pin con inicial del nombre
  return L.divIcon({
    className: 'custom-marker-fallback',
    html: `<div style="
      background: linear-gradient(135deg, #1e3a5f, #d4af37);
      width: ${tamaño[0]}px;
      height: ${tamaño[1]}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: ${tamaño[0] * 0.45}px;
        font-family: 'Bebas Neue', sans-serif;
      "></span>
    </div>`,
    iconSize: tamaño,
    iconAnchor: [tamaño[0] / 2, tamaño[1]]
  })
}

// Componente para centrar el mapa
function CentrarMapa({ centros }) {
  const map = useMap()
  useEffect(() => {
    if (centros.length > 0) {
      const bounds = L.latLngBounds(centros)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [centros, map])
  return null
}

function Mapa() {
  const [negocios, setNegocios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [centros, setCentros] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    cargarNegocios()
  }, [])

  const cargarNegocios = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('activo', true)
        .eq('suspendido', false)
      
      if (error) throw error
      
      if (data) {
        setNegocios(data)
        // Crear centros para ajustar el zoom
        const nuevosCentros = data
          .filter(n => n.latitud && n.longitud)
          .map(n => [n.latitud, n.longitud])
        setCentros(nuevosCentros)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <p className="font-body text-navy text-xl">Cargando mapa...</p>
      </div>
    )
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

      {/* MAPA */}
      <div className="flex-grow">
        <MapContainer
          center={[-36.0, -63.0]} // Centro de Realicó (ajustar según tu zona)
          zoom={13}
          className="h-[calc(100vh-80px)] w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {centros.length > 0 && <CentrarMapa centros={centros} />}
          
          {negocios.map((n) => {
            if (!n.latitud || !n.longitud) return null
            return (
              <Marker
  key={n.id}
  position={[n.latitud, n.longitud]}
  icon={crearIcono(n.foto_portada, n.plan)}
>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-navy">{n.nombre}</h3>
                    <p className="text-sm text-navy/70">{n.categoria}</p>
                    <button
                      onClick={() => navigate(`/ficha/${n.slug || n.id}`)} // ✅ AHORA USA EL SLUG
                      className="mt-2 bg-dorado text-navy px-3 py-1 rounded text-xs font-bold hover:bg-dorado-claro transition"
                    >
                      Ver ficha →
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

export default Mapa
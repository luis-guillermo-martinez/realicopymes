function ReporteVisual({ negocio }) {
  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  const plan = negocio.plan || 'Gratuito'
  const vistas = negocio.vistas || 0
  const clicsWa = negocio.clics_whatsapp || 0
  const clicsMapa = negocio.clics_mapa || 0
  const total = vistas + clicsWa + clicsMapa

  const ordenPlanes = ['Gratuito', 'Estándar', 'Destacado', 'Patrocinado']
  const indiceActual = ordenPlanes.indexOf(plan)

  const recomendaciones = {
    'Gratuito': {
      titulo: 'Desbloquea todo el potencial de tu negocio',
      texto: 'Con el plan Estandar, Destacado o Patrocinado vas a tener WhatsApp directo, fotos, horario, mapa y mucho mas.',
      beneficios: [
        'Foto de portada profesional',
        'Boton de WhatsApp directo',
        'Horario visible',
        'Galeria de hasta 5 fotos',
        'Redes sociales integradas',
        'Google Maps en tu ficha',
        'Badge Destacado o Patrocinado',
        'Video de YouTube',
        'Estadisticas de rendimiento'
      ]
    },
    'Estándar': {
      titulo: 'Multiplica tu visibilidad',
      texto: 'Subi al plan Destacado o Patrocinado para tener galeria de fotos, redes sociales, mapa y posicion preferencial.',
      beneficios: [
        'Galeria de hasta 5 fotos',
        'Redes sociales integradas',
        'Google Maps embebido',
        'Badge Destacado o Patrocinado',
        'Video de YouTube',
        'Posicion #1 en resultados',
        'Estadisticas de rendimiento',
        'Crear promociones'
      ]
    },
    'Destacado': {
      titulo: 'Domina tu categoria',
      texto: 'Con el plan Patrocinado vas a tener maxima exposicion: video, banner propio y posicion #1 garantizada.',
      beneficios: [
        'Galeria ampliada a 5 fotos',
        'Video de YouTube embebido',
        'Banner propio en tu ficha',
        'Seccion exclusiva Patrocinadores',
        'Boton "Como llegar" destacado',
        'Posicion #1 en resultados',
        'Maxima exposicion visual'
      ]
    },
    'Patrocinado': {
      titulo: 'Estas en el maximo nivel!',
      texto: 'Tu negocio ya tiene la maxima visibilidad posible en MiPin. Segui asi!',
      beneficios: []
    }
  }

  // Fallback por si el plan tiene tilde o no
  const planKey = ordenPlanes.includes(plan) ? plan : (plan === 'Estandar' ? 'Estándar' : 'Gratuito')
  const rec = recomendaciones[planKey] || recomendaciones['Gratuito']
  const esMaximo = plan === 'Patrocinado'

  return (
    <div 
      id="reporte-visual"
      style={{
        width: '800px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1e33 100%)',
        padding: '50px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Decoracion de fondo */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
        <div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#d4af37', margin: '0 0 5px 0', letterSpacing: '3px' }}>MiPin</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, fontStyle: 'italic' }}>A un pin de distancia</p>
        </div>
        <div style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid #d4af37', padding: '10px 20px', borderRadius: '30px', fontSize: '13px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Reporte
        </div>
      </div>

      {/* INFO DEL NEGOCIO - CENTRADO FORZADO */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '20px', 
        padding: '30px', 
        marginBottom: '30px', 
        position: 'relative', 
        zIndex: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center' 
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 15px 0', color: 'white' }}>{negocio.nombre}</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: (plan === 'Patrocinado' || plan === 'Destacado') ? '#d4af37' : '#6b7280',
            color: (plan === 'Patrocinado' || plan === 'Destacado') ? '#1e3a5f' : 'white',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Plan {plan}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'flex', alignItems: 'center' }}>📅 {fecha}</span>
        </div>
      </div>

      {/* ESTADÍSTICAS - 3 TARJETAS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', position: 'relative', zIndex: 2 }}>
        {/* VISTAS */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)', borderRadius: '20px', padding: '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>👁️</div>
          <div style={{ fontSize: '44px', fontWeight: 900, color: '#1e3a5f', lineHeight: 1, marginBottom: '8px' }}>{vistas}</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1px' }}>Vistas de ficha</div>
        </div>

        {/* WHATSAPP */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', borderRadius: '20px', padding: '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(37,211,102,0.3)' }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '44px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '8px' }}>{clicsWa}</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Clics WhatsApp</div>
        </div>

        {/* MAPA */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)', borderRadius: '20px', padding: '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(66,133,244,0.3)' }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>📍</div>
          <div style={{ fontSize: '44px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '8px' }}>{clicsMapa}</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Clics en Mapa</div>
        </div>
      </div>

      {/* RESUMEN TOTAL */}
      <div style={{ background: 'rgba(212,175,55,0.1)', border: '2px solid #d4af37', borderRadius: '20px', padding: '25px', marginBottom: '30px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Total de interacciones</p>
        <p style={{ fontSize: '56px', fontWeight: 900, color: '#d4af37', margin: 0, lineHeight: 1 }}>{total}</p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0' }}>personas se interesaron en tu negocio</p>
      </div>

      {/* MENSAJE DE UPSELL INTELIGENTE */}
      <div style={{
        background: esMaximo ? 'rgba(37,211,102,0.15)' : 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
        border: esMaximo ? '2px solid #25D366' : 'none',
        borderRadius: '20px',
        padding: '30px',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: esMaximo ? '#25D366' : '#1e3a5f', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {esMaximo ? '🏆 ' : '🚀 '}{rec.titulo}
        </h3>
        <p style={{ fontSize: '15px', color: esMaximo ? 'rgba(255,255,255,0.9)' : '#1e3a5f', margin: '0 0 15px 0', lineHeight: 1.5, textAlign: 'center' }}>
          {rec.texto}
        </p>
        {rec.beneficios.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {rec.beneficios.map((item, i) => (
              <span key={i} style={{
                background: esMaximo ? 'rgba(255,255,255,0.1)' : 'rgba(30,58,95,0.15)',
                color: esMaximo ? 'white' : '#1e3a5f',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ✓ {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>© 2026 MiPin · El directorio de Realicó</p>
        <p style={{ fontSize: '12px', color: '#d4af37', margin: 0, fontWeight: 'bold' }}>www.mipin.com.ar</p>
      </div>
    </div>
  )
}

export default ReporteVisual
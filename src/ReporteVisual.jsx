function ReporteVisual({ negocio, formato = 'pdf' }) {
  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const plan = negocio.plan || 'Gratuito'
  const vistas = negocio.vistas || 0
  const clicsWa = negocio.clics_whatsapp || 0
  const clicsMapa = negocio.clics_mapa || 0
  const total = vistas + clicsWa + clicsMapa

  const ordenPlanes = ['Gratuito', 'Estándar', 'Destacado', 'Patrocinado']
  const planKey = ordenPlanes.includes(plan) ? plan : (plan === 'Estandar' ? 'Estándar' : 'Gratuito')
  const esMaximo = plan === 'Patrocinado'

  const recomendaciones = {
    'Gratuito': {
      titulo: 'Desbloquea todo el potencial',
      texto: 'Subí al plan Estándar o Destacado para tener WhatsApp directo, fotos, horario y mapa.',
      beneficios: ['WhatsApp directo', 'Foto de portada', 'Horario visible', 'Galería de fotos', 'Google Maps']
    },
    'Estándar': {
      titulo: 'Multiplica tu visibilidad',
      texto: 'Pasá al plan Destacado o Patrocinado para tener galería, redes, mapa y posición preferencial.',
      beneficios: ['Galería de 5 fotos', 'Redes sociales', 'Google Maps embebido', 'Badge Destacado', 'Crear promociones']
    },
    'Destacado': {
      titulo: 'Dominá tu categoría',
      texto: 'Con el plan Patrocinado tendrás máxima exposición: video, banner propio y posición #1.',
      beneficios: ['Video de YouTube', 'Banner propio', 'Sección Patrocinadores', 'Botón "Cómo llegar"', 'Posición #1']
    },
    'Patrocinado': {
      titulo: '¡Estás en el máximo nivel!',
      texto: 'Tu negocio ya tiene la máxima visibilidad posible en MiPin. ¡Seguí así!',
      beneficios: []
    }
  }

  const rec = recomendaciones[planKey] || recomendaciones['Gratuito']

  // 🆕 ESTILOS SEGÚN FORMATO
  const isStory = formato === 'story'
  const containerStyle = {
    width: isStory ? '540px' : '800px', // 540 * 2 = 1080px (HD)
    minHeight: isStory ? '960px' : 'auto', // 960 * 2 = 1920px (9:16)
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1e33 100%)',
    padding: isStory ? '30px' : '50px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  }

  return (
    <div id="reporte-visual" style={containerStyle}>
      {/* Decoración de fondo */}
      <div style={{ position: 'absolute', top: isStory ? '-50px' : '-100px', right: isStory ? '-50px' : '-100px', width: isStory ? '250px' : '400px', height: isStory ? '250px' : '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: isStory ? '-80px' : '-150px', left: isStory ? '-80px' : '-150px', width: isStory ? '300px' : '500px', height: isStory ? '300px' : '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isStory ? '25px' : '40px', position: 'relative', zIndex: 2 }}>
        <div>
          <h1 style={{ fontSize: isStory ? '36px' : '56px', fontWeight: 900, color: '#d4af37', margin: '0 0 5px 0', letterSpacing: '3px' }}>MiPin</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, fontStyle: 'italic' }}>A un pin de distancia</p>
        </div>
        <div style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid #d4af37', padding: '8px 16px', borderRadius: '30px', fontSize: '11px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Reporte
        </div>
      </div>

      {/* INFO DEL NEGOCIO */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: isStory ? '20px' : '30px', marginBottom: isStory ? '20px' : '30px', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: isStory ? '24px' : '36px', fontWeight: 900, margin: '0 0 12px 0', color: 'white', lineHeight: 1.2 }}>{negocio.nombre}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: (plan === 'Patrocinado' || plan === 'Destacado') ? '#d4af37' : '#6b7280',
            color: (plan === 'Patrocinado' || plan === 'Destacado') ? '#1e3a5f' : 'white',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Plan {plan}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>📅 {fecha}</span>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={{ display: isStory ? 'flex' : 'flex', gap: isStory ? '10px' : '20px', marginBottom: isStory ? '20px' : '30px', position: 'relative', zIndex: 2, flexDirection: isStory ? 'column' : 'row' }}>
        {/* VISTAS */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)', borderRadius: '16px', padding: isStory ? '15px' : '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
          <div style={{ fontSize: isStory ? '32px' : '50px', marginBottom: '4px' }}>👁️</div>
          <div style={{ fontSize: isStory ? '32px' : '44px', fontWeight: 900, color: '#1e3a5f', lineHeight: 1, marginBottom: '4px' }}>{vistas}</div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1px' }}>Vistas</div>
        </div>
        {/* WHATSAPP */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', borderRadius: '16px', padding: isStory ? '15px' : '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(37,211,102,0.3)' }}>
          <div style={{ fontSize: isStory ? '32px' : '50px', marginBottom: '4px' }}>💬</div>
          <div style={{ fontSize: isStory ? '32px' : '44px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '4px' }}>{clicsWa}</div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</div>
        </div>
        {/* MAPA */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)', borderRadius: '16px', padding: isStory ? '15px' : '30px 15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(66,133,244,0.3)' }}>
          <div style={{ fontSize: isStory ? '32px' : '50px', marginBottom: '4px' }}>📍</div>
          <div style={{ fontSize: isStory ? '32px' : '44px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '4px' }}>{clicsMapa}</div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Mapa</div>
        </div>
      </div>

      {/* RESUMEN TOTAL */}
      <div style={{ background: 'rgba(212,175,55,0.1)', border: '2px solid #d4af37', borderRadius: '16px', padding: isStory ? '15px' : '25px', marginBottom: isStory ? '20px' : '30px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Total de interacciones</p>
        <p style={{ fontSize: isStory ? '42px' : '56px', fontWeight: 900, color: '#d4af37', margin: 0, lineHeight: 1 }}>{total}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>personas se interesaron en tu negocio</p>
      </div>

      {/* MENSAJE DE UPSELL */}
      <div style={{
        background: esMaximo ? 'rgba(37,211,102,0.15)' : 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
        border: esMaximo ? '2px solid #25D366' : 'none',
        borderRadius: '16px',
        padding: isStory ? '20px' : '30px',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        marginTop: 'auto' // Empuja hacia abajo en formato story
      }}>
        <h3 style={{ fontSize: isStory ? '18px' : '22px', fontWeight: 900, color: esMaximo ? '#25D366' : '#1e3a5f', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {esMaximo ? '🏆 ' : '🚀 '}{rec.titulo}
        </h3>
        <p style={{ fontSize: '13px', color: esMaximo ? 'rgba(255,255,255,0.9)' : '#1e3a5f', margin: '0 0 12px 0', lineHeight: 1.4, textAlign: 'center' }}>
          {rec.texto}
        </p>
        {rec.beneficios.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {rec.beneficios.map((item, i) => (
              <span key={i} style={{
                background: esMaximo ? 'rgba(255,255,255,0.1)' : 'rgba(30,58,95,0.15)',
                color: esMaximo ? 'white' : '#1e3a5f',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                ✓ {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: isStory ? '20px' : '30px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>© 2026 MiPin · Realicó</p>
        <p style={{ fontSize: '11px', color: '#d4af37', margin: 0, fontWeight: 'bold' }}>www.mipin.com.ar</p>
      </div>
    </div>
  )
}

export default ReporteVisual
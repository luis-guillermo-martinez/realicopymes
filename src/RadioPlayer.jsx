import { useState, useRef, useEffect } from 'react'

function RadioPlayer() {
  // ⚠️ IMPORTANTE: Reemplazá esta URL por la real de tu streaming (debe ser https://)
  const STREAM_URL = "https://streaming1.locucionar.com/proxy/fmdigital965?mp=/stream" 
  const RADIO_NAME = "FM DIGITAL 96.5"
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState('')
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8
    }
  }, [])

  // 🆕 LÓGICA SEPARADA: El botón flotante solo abre/cierra el mini-player
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    setError('')
  }

  // 🆕 El botón Play/Pausa está DENTRO del mini-player
  const togglePlay = async () => {
    setError('')
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        audioRef.current.src = STREAM_URL
        audioRef.current.load()
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
        }
      } catch (err) {
        console.error("Error de reproducción:", err)
        setError("No se pudo reproducir. Verificá la URL del streaming.")
        setIsPlaying(false)
      }
    }
  }

  const cerrar = () => {
    audioRef.current.pause()
    setIsPlaying(false)
    setIsExpanded(false)
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="none" 
        crossOrigin="anonymous" 
        playsInline 
      />
      
      {/* 🎵 MINI-PLAYER (aparece solo cuando se toca el botón flotante) */}
      {isExpanded && (
        <div className="fixed bottom-24 right-4 z-[100] bg-navy text-crema rounded-2xl shadow-2xl border-2 border-dorado overflow-hidden" style={{ width: '280px', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-dorado text-navy animate-pulse' : 'bg-navy-light text-dorado border border-dorado'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm leading-tight truncate">{RADIO_NAME}</p>
                <p className="font-body text-[10px] text-crema/70 flex items-center gap-1">
                  {isPlaying ? (
                    <><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> En vivo</>
                  ) : (
                    "Tocá para escuchar"
                  )}
                </p>
              </div>
              <button 
                type="button"
                onClick={cerrar}
                className="text-crema/50 hover:text-crema transition p-1"
                title="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button 
              type="button"
              onClick={togglePlay}
              className="w-full bg-dorado text-navy py-2 rounded-lg font-body font-bold text-sm hover:bg-dorado-claro transition flex items-center justify-center gap-2 active:scale-95"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  Pausar
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Escuchar
                </>
              )}
            </button>
            
            {error && (
              <p className="text-red-300 text-[10px] mt-2 text-center">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* 🔘 BOTÓN FLOTANTE (siempre visible, solo abre el mini-player) */}
      <button 
        type="button"
        onClick={toggleExpand}
        className={`fixed bottom-4 right-4 z-[100] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 ${
          isPlaying 
            ? 'bg-dorado text-navy hover:bg-dorado-claro' 
            : 'bg-navy text-dorado border-2 border-dorado hover:bg-navy-dark'
        }`}
        title="Radio MiPin FM"
        style={isPlaying ? { animation: 'pulseSlow 2s infinite' } : {}}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </button>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
        }
      `}</style>
    </>
  )
}

export default RadioPlayer

  
  import { useState, useRef, useEffect } from 'react'

function RadioPlayer() {
  // ⚠️ IMPORTANTE: La URL DEBE ser HTTPS. Los móviles bloquean HTTP por seguridad.
  const STREAM_URL = "https://streaming1.locucionar.com/proxy/fmdigital965?mp=/stream" // <-- PONÉ TU URL ACÁ
  const RADIO_NAME = "Escucha FM Digital 96.5" 
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState('')
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8
    }
  }, [])

  const togglePlay = async () => {
    setError('')
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        // En móviles, a veces hay que recargar el source para evitar buffers viejos
        audioRef.current.src = STREAM_URL
        
        // Intentar reproducir y capturar el error si el móvil lo bloquea
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
        }
      } catch (err) {
        console.error("Error de reproducción en móvil:", err)
        setError("No se pudo reproducir. Verificá que la URL sea HTTPS y que tu celular no esté en modo silencio.")
        setIsPlaying(false)
      }
    }
  }

  const toggleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false)
    } else {
      setIsMinimized(true)
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="none" 
        crossOrigin="anonymous" // 🆕 Ayuda con la compatibilidad móvil
        playsInline // 🆕 Evita que algunos móviles intenten abrir un reproductor nativo a pantalla completa
      />
      
      {/* 📻 REPRODUCTOR STICKY (Fijo abajo) */}
      <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-300 ${isMinimized ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="bg-navy text-crema shadow-2xl border-t-2 border-dorado">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            
            {/* Info de la Radio */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-dorado text-navy animate-pulse' : 'bg-navy-light text-dorado border border-dorado'}`}>
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-lg leading-tight truncate">{RADIO_NAME}</p>
                <p className="font-body text-xs text-crema/70 flex items-center gap-2">
                  {isPlaying ? (
                    <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> En vivo</>
                  ) : (
                    "Tocá para escuchar"
                  )}
                </p>
                {error && <p className="text-red-300 text-[10px] mt-1">{error}</p>}
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={togglePlay}
                className="w-14 h-14 bg-dorado text-navy rounded-full flex items-center justify-center hover:bg-dorado-claro transition shadow-lg flex-shrink-0 active:scale-95"
              >
                {isPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              
              <button 
                type="button"
                onClick={toggleMinimize}
                className="p-2 text-crema/60 hover:text-crema hover:bg-white/10 rounded-full transition"
                title="Ocultar reproductor"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para reabrir si se ocultó */}
      {isMinimized && (
        <button 
          type="button"
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 z-[100] w-14 h-14 bg-dorado text-navy rounded-full shadow-2xl flex items-center justify-center hover:bg-dorado-claro transition active:scale-95"
          title="Abrir radio"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        </button>
      )}
    </>
  )
}

export default RadioPlayer
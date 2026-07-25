function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Realicó PyMEs</h1>
          <div className="space-x-4 hidden md:block">
            <a href="#" className="hover:text-blue-200 transition">Inicio</a>
            <a href="#" className="hover:text-blue-200 transition">Categorías</a>
            <a href="#" className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">
              Soy Comercio
            </a>
          </div>
        </div>
      </nav>

      <header className="bg-blue-700 text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            El directorio de negocios de Realicó
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Conectamos a la comunidad con los mejores servicios y profesionales locales.
          </p>
          
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-lg shadow-xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué buscas? (ej. Panadería, Cerrajero, Agro)" 
              className="flex-1 p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-md hover:bg-yellow-400 transition">
              Buscar
            </button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Explora por Categoría</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <div className="text-4xl mb-3">🍞</div>
            <h4 className="font-semibold text-gray-700">Gastronomía</h4>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <div className="text-4xl mb-3">💊</div>
            <h4 className="font-semibold text-gray-700">Salud y Farmacias</h4>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <div className="text-4xl mb-3">🔧</div>
            <h4 className="font-semibold text-gray-700">Servicios y Oficios</h4>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <div className="text-4xl mb-3">🌾</div>
            <h4 className="font-semibold text-gray-700">Agropecuario</h4>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
        <p>© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
      </footer>
    </div>
  )
}
export default App
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación */}
      <nav className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center space-x-3">
  <img 
    src="/src/assets/logo.png" 
    alt="Realicó PyMEs Logo" 
    className="h-12 w-auto"
  />
</div>
          
          {/* Menú de navegación */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="hover:text-yellow-400 transition font-medium">Inicio</a>
            <a href="#" className="hover:text-yellow-400 transition font-medium">Categorías</a>
            <a href="#" className="hover:text-yellow-400 transition font-medium">Cómo Funciona</a>
            <a href="#" className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">
              Soy Comercio
            </a>
          </div>
        </div>
      </nav>

      {/* Sección Principal (Hero) */}
      <header className="bg-gradient-to-b from-blue-800 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            El directorio de negocios de Realicó
          </h1>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Conectamos a la comunidad con los mejores servicios y profesionales locales de La Pampa.
          </p>
          
          {/* Buscador */}
          <div className="max-w-3xl mx-auto bg-white p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué buscas? Ejemplo: Panadería, Cerrajero, Farmacia..." 
              className="flex-1 p-4 rounded-md text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-yellow-500 text-blue-900 font-bold py-4 px-10 rounded-md hover:bg-yellow-400 transition text-lg">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* Categorías Destacadas */}
      <section className="container mx-auto px-4 py-16 flex-grow">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Explora por Categoría</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Encuentra rápidamente los servicios que necesitas en Realicó y la región.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categoría 1 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Gastronomía</h3>
            <p className="text-gray-600 text-sm">Restaurantes, cafeterías y más</p>
          </div>

          {/* Categoría 2 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Salud y Farmacias</h3>
            <p className="text-gray-600 text-sm">Profesionales y centros de salud</p>
          </div>

          {/* Categoría 3 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Servicios y Oficios</h3>
            <p className="text-gray-600 text-sm">Técnicos, reparaciones y mantenimiento</p>
          </div>

          {/* Categoría 4 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Agropecuario</h3>
            <p className="text-gray-600 text-sm">Insumos y servicios rurales</p>
          </div>

          {/* Categoría 5 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Automotor</h3>
            <p className="text-gray-600 text-sm">Talleres, repuestos y servicios</p>
          </div>

          {/* Categoría 6 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Construcción</h3>
            <p className="text-gray-600 text-sm">Materiales y profesionales</p>
          </div>

          {/* Categoría 7 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Educación</h3>
            <p className="text-gray-600 text-sm">Instituciones y cursos</p>
          </div>

          {/* Categoría 8 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center border border-gray-100 cursor-pointer">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Turismo</h3>
            <p className="text-gray-600 text-sm">Alojamiento y actividades</p>
          </div>
        </div>
      </section>

      {/* Sección: ¿Cómo Funciona? */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">¿Cómo Funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">Buscá</h3>
              <p className="text-gray-600">Encontrá el servicio que necesitás en Realicó</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">Compará</h3>
              <p className="text-gray-600">Revisá las opciones disponibles y sus servicios</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">Contactá</h3>
              <p className="text-gray-600">Comunicate directamente con el comercio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="bg-gray-800 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Realicó PyMEs</h3>
              <p className="text-gray-400 text-sm">
                El directorio oficial de negocios y servicios de Realicó, La Pampa.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition">Inicio</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Categorías</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Soy Comercio</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
              <p className="text-gray-400 text-sm">
                ¿Tenés un comercio?<br />
                Sumate al directorio y llegá a más clientes.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Realicó PyMEs. Hecho con ❤️ para La Pampa.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
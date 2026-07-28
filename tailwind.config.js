/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4B',    // Primario (marca, headers, hero)
          dark: '#1A1C2E',       // Primario oscuro (bordes, footer)
          light: '#2A3F6B',      // Versión más clara para hover
        },
        dorado: {
          DEFAULT: '#C9B24A',    // Secundario/acento (CTAs, destacados)
          claro: '#E6B661',      // Acento claro (sobre fondos oscuros)
          oscuro: '#A89430',     // Versión más oscura para hover
        },
        crema: '#F4F1E6',        // Fondo general
        papel: '#F1E8C9',        // Fondo oscuro (secciones acentuadas)
        oliva: {
          DEFAULT: '#4A7C59',    // Texto de apoyo / contrastes / WhatsApp
          dark: '#3A6247',       // Hover
        },
      },
    },
  },
  plugins: [],
}
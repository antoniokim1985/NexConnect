/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  purge: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.jsx',
    // ... Agrega otras rutas según sea necesario
  ],
  theme: {
    extend: {
      colors: {
        
        'dark-black': '#1D1D1F',
        'principal-white': '#F9FCFD',
        'bg-primary': '#0071E3',
        'color-primary': '#0071E3',
        'dark-bgblack': '#1D1D1F',
        'maestro': '#CD8DC3',
        'alumno': '#4CDFDF',
        'padre': '#88C25B',
        'admin': '#0101DF',
        'otro': '#your-other-color',
      },
    },
  },
  darkMode: 'class',
  plugins: [require("daisyui")],
}


// creamos la configuracion de tailwind para que sepa donde debe buscar los archiuvos
// en donde se usaran las clase para poder pasar el css 
export default {
    // Indicamos el contenido de los archivos donde se usaran las clas de tailwinds
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // extendemos el tema para agregar nuevas clases o modificar las existentes
    theme:{
        extends:{}
    },
    //agregamos los plugis a utilizar
    plugins:[]
}

// en este caso se esta usando la ultima version de tailwinds,
// por lo que para instalalo se debe usar el comando ( npm install -D tailwindcss postcss autoprefixer ) y luego se debe ejecutar el comando (npx tailwindcss init -p) para crear los archivos de configuracion
// luego se debe crear el archivo de configuracion con el comando npx tailwindcss init -p
// esto creara el archivo tailwind.config.js y postcss.config.js
// luego se debe agregar el contenido del archivo tailwind.config.js para que tailwinds sepa donde buscar las clases
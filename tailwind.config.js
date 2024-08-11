/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require( "@iconify/tailwind" )
export default {
    content: [
        './src/**/*.{svelte,js,ts,html}',
    ],
    plugins: [
        require( "@tailwindcss/typography" ),
        require( 'daisyui' ),
        addDynamicIconSelectors()
    ],
    daisyui: {
        themes: [ "bumblebee" ]
    }
}

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig( {
    plugins: [ sveltekit() ],
    test: {
        environment: 'node',
        include: ['src/**/*.test.js', 'tests/**/*.test.js', "src/**/*.js"],
        watch: true,
        watchIgnore: [ 'node_modules', '.svelte-kit', 'dist' ],
        watchPaths:['src/routes/**']
    },
    server:{
        port: 5174,
        host: true,
    }
} );

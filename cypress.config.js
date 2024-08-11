import { defineConfig } from "cypress";

export default defineConfig( {
    e2e: {
        defaultCommandTimeout:5000,
        viewportHeight: 1200,
        watchForFileChanges: true,
        baseUrl: "http://localhost:5173",
        setupNodeEvents( on, config ) {
            // implement node event listeners here
        },
    },
} );

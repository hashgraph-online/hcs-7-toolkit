import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import nodePolyfillsPlugin from 'rollup-plugin-polyfill-node';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'wasm-bridge.ts'),
      name: 'WasmPriceChecker',
      fileName: 'wasm-bridge',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      plugins: [nodePolyfillsPlugin()],
      external: ['util'],
      output: {
        globals: {
          util: 'util'
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['long']
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    })
  ]
});

import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ts/index.ts'),
      name: 'Hcs7Toolkit',
      fileName: 'hcs-7-toolkit',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        '@hashgraph/sdk',
        'dotenv',
        'ethers',
        'long',
        'ioredis'
      ],
      output: {
        globals: {
          '@hashgraph/sdk': 'HashgraphSDK',
          'ethers': 'ethers',
          'long': 'Long',
          'ioredis': 'Redis'
        }
      }
    }
  },
  plugins: [
    dts(),
    nodePolyfills({
      include: ['util']
    })
  ]
});

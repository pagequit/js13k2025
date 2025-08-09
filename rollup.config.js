import serve from 'rollup-plugin-serve';
import { minify } from 'rollup-plugin-esbuild'

export default {
  input: "src/main.js",
  output: {
    file: "dist.js",
  },
  plugins: [
    serve(),
    minify(),
  ],
}

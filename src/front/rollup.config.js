import typescript from '@rollup/plugin-typescript'
import nodeResolve from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/front/app.ts',
  output: { file: 'app.js', format: 'esm' },
  plugins: [nodeResolve(), typescript(), json(),
    process.env.minify ? terser() : {}]
}
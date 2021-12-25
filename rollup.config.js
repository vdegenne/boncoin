import typescript from '@rollup/plugin-typescript'
import nodeResolve from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json'

export default {
  input: 'src/app.ts',
  output: { file: 'app.js', format: 'esm' },
  plugins: [nodeResolve(), typescript(), json()]
}
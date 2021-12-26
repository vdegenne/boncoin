import nodeResolve from "@rollup/plugin-node-resolve"
import cjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from "rollup-plugin-terser"

export default {
  input: 'src/server/server.js',
  output: { file: 'server.js', format: 'cjs' },
  plugins: [nodeResolve(), cjs(), json(),
    process.env.minify ? terser() : {}]
}
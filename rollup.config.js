import alias from 'rollup-plugin-strict-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-purified-css';
import { terser } from 'rollup-plugin-terser';

const { PRODUCTION } = process.env;

const BASE_PLUGINS = [
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
  }),
  alias({
    'react': require.resolve('preact/compat'),
    'react-dom': require.resolve('preact/compat'),
  }),
  resolve({
    browser: true,
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(PRODUCTION ? 'production' : 'development'),
  }),
  commonjs({
    exclude: '**/preact-use/**',
  }),
  commonjs({
    include: '**/preact-use/**',
    transformMixedEsModules: true,
  }),
];

const SOURCE_PLUGINS = {
  'ui': [
    css({
      output: 'dist/assets/css/ui.css',
    })
  ],
};

const getSourcePlugins = source => (
  BASE_PLUGINS
    .concat(SOURCE_PLUGINS[source] || [])
    .concat(PRODUCTION ? [ terser() ] : [])
);

export default [
  'content',
  'observer',
  'ui',
].map(source => ({
  input: `src/${source}.js`,
  output: {
    file: `dist/src/${source}.js`,
    format: 'iife',
  },
  treeshake: true,
  plugins: getSourcePlugins(source),
}));

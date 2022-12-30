import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import path from 'path';

const outDir = 'vanilla';
const libName = 'everscale';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'iife',
      name: libName,
      file: path.join(outDir, 'everscale.js'),
    },
    {
      format: 'iife',
      name: libName,
      file: path.join(outDir, 'everscale.min.js'),
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      compilerOptions: {
        module: 'esnext',
      },
      outDir,
    }),
  ],
};

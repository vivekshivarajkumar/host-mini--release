import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  context: __dirname,
  entry: './index.js',
  output: {
    uniqueName: 'mini',
    publicPath: 'https://mini.ct0.in/',

  },
  resolve: {
    ...Repack.getResolveOptions(),
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'mini',
      filename: 'mini.container.js.bundle',
      exposes: {
        './App': './App.tsx',
      },
    }),
  ],
};

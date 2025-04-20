import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default {
  context: __dirname,
  entry: './index.js',
  devtool: false,
  output: {
    uniqueName: 'mini',
    publicPath: 'https://mini.ct0.in/',
    path: path.join(__dirname, 'dist'),
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
    new Repack.RepackPlugin({
      platform: 'android',
      context: __dirname,
      devtool: false,
      output: {
        uniqueName: 'mini',
      }
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'mini',
      filename: 'mini.container.js.bundle',
      exposes: {
        './App': './App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '19.0.0',
        },
        'react-native': {
          singleton: true,
          eager: true,
          requiredVersion: '0.78.2',
        },
        '@module-federation/enhanced': {
          singleton: true,
          eager: true,
          requiredVersion: '^0.12.0',
        },
      },
    }),
  ],
};

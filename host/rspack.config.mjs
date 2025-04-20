import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default {
  context: __dirname,
  entry: './index.js',
  output: {
    uniqueName: 'host',
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
      output: {
        uniqueName: 'host',
      }
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'host',
      filename: 'host.container.js.bundle',
      remotes: {
        mini: 'mini@https://mini.ct0.in/mf-manifest.json',
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
    new Repack.plugins.HermesBytecodePlugin({
      enabled: true,
      test: /\.(js)?bundle$/,
      exclude: /index.bundle$/,
    }),
  ],
};

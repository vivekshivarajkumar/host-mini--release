import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json and generate shared config dynamically
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create shared dependencies configuration automatically
const generateSharedDependencies = (deps = {}) => {
  const sharedDeps = {};
  
  Object.keys(deps).forEach(dep => {
    
    sharedDeps[dep] = {
      singleton: true,
      eager: false,
    };
  });
  
  return sharedDeps;
};

// Combine both dependencies and devDependencies
const allDependencies = {
  ...packageJson.dependencies || {},
  // Uncomment if you want to include devDependencies
  // ...packageJson.devDependencies || {},
};

// Generate the shared config
const sharedDependencies = generateSharedDependencies(allDependencies);

// Ensure React and React Native are always included
sharedDependencies.react = {
  singleton: true,
  eager: true,
};

sharedDependencies['react-native'] = {
  singleton: true,
  eager: true,
};

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
    new Repack.RepackPlugin({
      platform: 'android',
      context: __dirname,
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
      shared: sharedDependencies,
    }),
  ],
};

# Mini App Integration Issue

I have uploaded mini app assets to https://mini.ct0.in/mf-manifest.json

## Problem Statement

The mini app works perfectly in debug mode but fails to load when embedded in the production (release) host APK. The app loads fine with `npm run android` but fails with `npm run android -- --mode="release"`.

## Setup Details

### 1. Mini App Configuration

Created a mini app with the following rspack configuration:

```javascript
// mini/rspack.config.mjs
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
```

### 2. Bundle Creation

Built the bundles with:

```bash
"bundle": "react-native bundle --platform android --entry-file index.js"
```

The mini app works correctly as a standalone app.

### 3. Host App Configuration

Created a host app with the following rspack configuration:

```javascript
// host/rspack.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  context: __dirname,
  entry: './index.js',
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
      name: 'host',
      filename: 'host.container.js.bundle',
      remotes: {
        // http://localhost:8081/android/mf-manifest.json
        mini: 'mini@https://mini.ct0.in/mf-manifest.json',
      },
    }),
  ],
};
```

### 4. Implementation in Host App

The host app loads the mini app with React.lazy:

```javascript
// host/App.js
import React, { Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

const MiniApp = React.lazy(() => import('mini/App'));

const Fallback = () => {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>host app 🥹</Text>
      <Text style={styles.fallbackTextMini}>loading mini app ⏳</Text>
    </View>
  );
};

const App = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <MiniApp />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'yellow',
  },
  fallbackTextMini: {
    fontSize: 16,
    color: 'white',
  },
});

AppRegistry.registerComponent(appName, () => App);
```

## Current Status

- ✅ Works in debug mode: `npm run android`
- ❌ Fails in release mode: `npm run android -- --mode="release"`

Can someone help identify the specific issue?

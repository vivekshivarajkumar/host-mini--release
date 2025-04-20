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

--------- beginning of crash
04-20 19:23:16.080 20252 20289 E AndroidRuntime: FATAL EXCEPTION: mqt_v_native
04-20 19:23:16.080 20252 20289 E AndroidRuntime: Process: com.host, PID: 20252
04-20 19:23:16.080 20252 20289 E AndroidRuntime: com.facebook.react.common.JavascriptException: TypeError: undefined is not a function
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 
04-20 19:23:16.080 20252 20289 E AndroidRuntime: This error is located at:
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at App (https://mini.ct0.in/__federation_expose_App.chunk.bundle:21:54)
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at Suspense (<anonymous>)
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at App (<anonymous>)
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at RCTView (<anonymous>)
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:327642)
04-20 19:23:16.080 20252 20289 E AndroidRuntime:     at AppContainer (address at index.android.bundle:1:391529), js engine: hermes, stack:
04-20 19:23:16.080 20252 20289 E AndroidRuntime: getOwner@9060:63
04-20 19:23:16.080 20252 20289 E AndroidRuntime: jsxDEVImpl@9147:66
04-20 19:23:16.080 20252 20289 E AndroidRuntime: anonymous@9194:25
04-20 19:23:16.080 20252 20289 E AndroidRuntime: App@31:46
04-20 19:23:16.080 20252 20289 E AndroidRuntime: renderWithHooks@1:440815
04-20 19:23:16.080 20252 20289 E AndroidRuntime: updateFunctionComponent@1:453215
04-20 19:23:16.080 20252 20289 E AndroidRuntime: beginWork@1:461138
04-20 19:23:16.080 20252 20289 E AndroidRuntime: performUnitOfWork@1:481430
04-20 19:23:16.080 20252 20289 E AndroidRuntime: workLoopSync@1:480462
04-20 19:23:16.080 20252 20289 E AndroidRuntime: renderRootSync@1:480294
04-20 19:23:16.080 20252 20289 E AndroidRuntime: performWorkOnRoot@1:477786
04-20 19:23:16.080 20252 20289 E AndroidRuntime: performWorkOnRootViaSchedulerTask@1:431090
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at com.facebook.react.modules.core.ExceptionsManagerModule.reportException(ExceptionsManagerModule.kt:52)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at com.facebook.jni.NativeRunnable.run(Native Method)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at android.os.Handler.handleCallback(Handler.java:997)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at android.os.Handler.dispatchMessage(Handler.java:111)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at com.facebook.react.bridge.queue.MessageQueueThreadHandler.dispatchMessage(MessageQueueThreadHandler.java:27)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at android.os.Looper.loopOnce(Looper.java:237)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at android.os.Looper.loop(Looper.java:325)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at com.facebook.react.bridge.queue.MessageQueueThreadImpl.lambda$startNewBackgroundThread$2(MessageQueueThreadImpl.java:217)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at com.facebook.react.bridge.queue.MessageQueueThreadImpl$$ExternalSyntheticLambda1.run(D8$$SyntheticClass:0)
04-20 19:23:16.080 20252 20289 E AndroidRuntime: 	at java.lang.Thread.run(Thread.java:1012)
04-20 19:23:16.094 20252 20289 I HiView  : Begin report 1002
04-20 19:23:16.094 20252 20289 D HiEvent : event mTime is 0, set mTime = 1745157196094
04-20 19:23:16.094 20252 20289 I HiEvent : Flatten done: 1002
04-20 19:23:16.094 20252 20289 I Process : Sending signal. PID: 20252 SIG: 9

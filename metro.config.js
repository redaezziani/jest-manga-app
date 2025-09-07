const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add resolver configuration for socket.io compatibility
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('cjs');

// Add specific resolution for socket.io modules
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': require.resolve('expo-crypto'),
};

module.exports = withNativeWind(config, { input: './app/global.css' });
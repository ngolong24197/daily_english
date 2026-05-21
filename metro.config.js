const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts.filter(ext => ext !== 'test.tsx' && ext !== 'test.ts')];
config.resolver.blockList = [/(?:^|.*)\.test\.(tsx?|jsx?)$/];

module.exports = withNativeWind(config, { input: './src/global.css' });
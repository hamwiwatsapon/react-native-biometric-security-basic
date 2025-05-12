// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Safely modify config properties directly
config.resolver.assetExts.push('svg');
config.transformer.experimentalImportSupport = false;
config.transformer.inlineRequires = false;

module.exports = config;

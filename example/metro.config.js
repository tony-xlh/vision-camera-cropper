// example/metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname; // example/
const workspaceRoot = path.resolve(projectRoot, '..'); // repo root (your lib)

// Small helper to escape paths for a RegExp
const esc = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = getDefaultConfig(projectRoot);

// Watch the library folder so edits in ../src/** refresh
config.watchFolders = [workspaceRoot];

config.resolver = {
  ...config.resolver,
  // IMPORTANT: allow resolving through symlinks (pnpm "link:..")
  unstable_enableSymlinks: true,
  // Ensure React/RN come from the example app only
  nodeModulesPaths: [path.join(projectRoot, 'node_modules')],
};

module.exports = config;

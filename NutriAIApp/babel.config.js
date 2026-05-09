module.exports = {
  presets: ['@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: ['react-native-reanimated/plugin'],
};

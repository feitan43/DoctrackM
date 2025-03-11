// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: ['react-native-reanimated/plugin'],
// };
/* module.exports = (api) => {
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      ['react-native-worklets-core/plugin'],
      ['module:react-native-dotenv', {
        moduleName: "@env",
        path: '.env',
      }],
    ],
  };
}; */

module.exports = (api) => {
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      ['react-native-worklets-core/plugin'],
      'hot-updater/babel-plugin',
      'react-native-reanimated/plugin', // ✅ Now placed at the end
    ],
  };
};




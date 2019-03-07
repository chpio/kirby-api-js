export default {
  input: 'src/api.js',
  output: [
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'getkirby/api-js',
      globals: {
        'cross-fetch': 'fetch'
      }
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ]
};

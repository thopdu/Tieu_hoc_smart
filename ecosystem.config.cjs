module.exports = {
  apps: [
    {
      name: 'hanh-trang-hoc-tap',
      script: 'dist/server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        GEMINI_API_KEY: 'DIEN_MA_API_CUA_BAN_TAI_DAY'
      }
    }
  ]
};

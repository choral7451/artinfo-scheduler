module.exports = {
  apps: [
    {
      name: 'artinfo-serverd@main',
      exec_mode: 'cluster',
      instances: '1',
      script: './dist/main.js',
      args: 'start',
    },
  ],
};

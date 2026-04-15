const config = {
  plugins: {
    "@tailwindcss/postcss": {
      theme: {
        extend: {
          animation: {
            'ping-out': 'ping-out 2s ease-out infinite',
            'pulse-core': 'pulse-core 1.8s ease-in-out infinite',
          }
        }
      }
    },
  },
};

export default config;

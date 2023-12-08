export const CONFIG = {
  PORT: process.env.PORT || 1337,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sc2sptfy',
};

export const NEST_CONFIG = () => ({
  port: CONFIG.PORT,
});

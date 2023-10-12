import dotenvJSON from 'complex-dotenv-json';
dotenvJSON({ path: './env.json' });

export const CONFIG: any = {
  PORT: process.env.PORT || 1337,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sc2sptfy',
  SC: JSON.parse(process.env.SC || ''),
  SPTFY: JSON.parse(process.env.SPTFY || ''),
};

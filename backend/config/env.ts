const readEnv = (name: string): string => (process.env[name] || '').trim();

export const env = {
  jwtSecret: readEnv('JWT_SECRET'),
  appUrl: readEnv('APP_URL') || 'http://localhost:3000',
  port: Number(readEnv('PORT')) || 3001,
  nodeEnv: readEnv('NODE_ENV') || 'development',
  ai: {
    groqApiKey: readEnv('GROQ_API_KEY'),
    geminiApiKey: readEnv('GEMINI_API_KEY')
  },
  clerk: {
    secretKey: readEnv('CLERK_SECRET_KEY'),
    publishableKey: readEnv('CLERK_PUBLISHABLE_KEY')
  },
  integrations: {
    youtubeApiKey: readEnv('YOUTUBE_API_KEY'),
    googleClientId: readEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: readEnv('GOOGLE_CLIENT_SECRET')
  }
};

export const validateEnvironment = (): void => {
  const missing: string[] = [];

  if (!env.jwtSecret) {
    missing.push('JWT_SECRET');
  }

  if (!env.clerk.secretKey) {
    missing.push('CLERK_SECRET_KEY');
  }

  if (!env.ai.groqApiKey && !env.ai.geminiApiKey) {
    missing.push('GROQ_API_KEY or GEMINI_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`[FATAL] Missing required environment variable(s): ${missing.join(', ')}`);
  }
};

export const isGoogleCalendarConfigured = (): boolean => {
  return Boolean(
    env.integrations.googleClientId &&
    env.integrations.googleClientSecret &&
    env.appUrl
  );
};

import crypto from 'crypto';

export const generatePlainApiKey = () => `fai_${crypto.randomBytes(24).toString('hex')}`;

export const hashApiKey = (apiKey) => crypto.createHash('sha256').update(apiKey).digest('hex');

export const getApiKeyPrefix = (apiKey) => apiKey.slice(0, 12);

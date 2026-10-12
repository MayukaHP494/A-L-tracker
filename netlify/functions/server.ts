import serverless from 'serverless-http';
import { app } from '../../server.ts';

// Netlify Function handler wrapping the Express backend
export const handler = serverless(app);

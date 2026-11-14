import serverless from 'serverless-http';
import { app } from '../../server/src/app.js';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Normalize path if routed through /.netlify/functions/api
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '') || '/';
  }
  return serverlessHandler(event, context);
};

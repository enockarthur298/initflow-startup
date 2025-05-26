import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

export const onRequest: PagesFunction = async (context) => {
  // Use dynamic import with error handling
  let serverBuild;
  try {
    serverBuild = (await import('../build/server')) as unknown as ServerBuild;
  } catch (error) {
    console.error('Error importing server build:', error);
    return new Response('Server error', { status: 500 });
  }

  const handler = createPagesFunctionHandler({
    build: serverBuild,
  });

  return handler(context);
};

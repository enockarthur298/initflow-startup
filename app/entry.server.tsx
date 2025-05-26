import type { AppLoadContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToString } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any,
  _loadContext: AppLoadContext,
) {
  // Render the app to a string
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );
  
  // Get the head content
  const head = renderHeadToString({ request, remixContext, Head });
  
  // Get the current theme
  const theme = themeStore.value;
  
  // Create the full HTML response
  const html = `
    <!DOCTYPE html>
    <html lang="en" data-theme="${theme}">
      <head>
        ${head}
      </head>
      <body>
        <div id="root" class="w-full h-full">${markup}</div>
      </body>
    </html>
  `;

  // Set response headers
  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Return the response
  return new Response(html, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

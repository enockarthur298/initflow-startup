import type { AppLoadContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import * as ReactDOMServer from 'react-dom/server';
const renderToReadableStream = ReactDOMServer.renderToReadableStream;

import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any,
  _loadContext: AppLoadContext,
) {
  // await initializeModelList({});

  // Create a new AbortController for the render
  const controller = new AbortController();
  const signal = controller.signal;

  // Set a timeout for the render
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let readable: Awaited<ReturnType<typeof renderToReadableStream>> | null = null;
  try {
    readable = await renderToReadableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        signal,
        onError(error: unknown) {
          console.error('Stream error:', error);
          responseStatusCode = 500;
          controller.abort();
        },
      }
    );
  } catch (error) {
    console.error('Render error:', error);
    responseStatusCode = 500;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const body = new ReadableStream({
    start(controller) {
      try {
        const head = renderHeadToString({ request, remixContext, Head });

        controller.enqueue(
          new Uint8Array(
            new TextEncoder().encode(
              `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
            ),
          ),
        );

        const reader = readable.getReader();

        function read() {
          reader.read()
            .then(({ done, value }: { done: boolean; value?: Uint8Array }) => {
              if (done) {
                controller.enqueue(new Uint8Array(new TextEncoder().encode('</div></body></html>')));
                controller.close();
                return;
              }
              if (value) {
                controller.enqueue(value);
              }
              read();
            })
            .catch((error: unknown) => {
              console.error('Stream read error:', error);
              controller.error(error);
            });
        }
        
        read();
      } catch (error) {
        console.error('Error in ReadableStream start:', error);
        controller.error(error);
      }
    },
    cancel() {
      // Cleanup if the stream is cancelled
      if (readable) {
        const reader = readable.getReader();
        reader.cancel().catch(console.error);
      }
    },
  });

  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

import { StageManager, validateStagedData } from '../stage';
import type { StagedData } from '../types';
import { renderEditor } from './editor';
import { generateHTML, generateMarkdown, generateJSON } from './generators';

export async function startWebServer(port: number = 3000) {
  const stage = new StageManager();

  Bun.serve({
    port,
    hostname: '127.0.0.1',
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === '/') {
        const data = await stage.load();
        return new Response(renderEditor(data), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      if (url.pathname === '/data' && req.method === 'GET') {
        const data = await stage.load();
        return Response.json(data);
      }

      if (url.pathname === '/data' && req.method === 'POST') {
        let data: StagedData;
        try {
          data = validateStagedData(await req.json());
        } catch {
          return Response.json({ error: 'Invalid stage data' }, { status: 400 });
        }
        await stage.update(data);
        return Response.json({ success: true });
      }

      if (url.pathname === '/export' && req.method === 'POST') {
        const body = await req.json() as { format: 'html' | 'markdown' | 'json'; template?: 'full' | 'simple'; language?: 'pl' | 'en' };
        const data = await stage.load();
        
        let content: string;
        let contentType: string;
        let filename: string;

        switch (body.format) {
          case 'html': {
            content = generateHTML(data, body.template || 'full', body.language || 'en');
            contentType = 'text/html';
            const langSuffix = body.language === 'pl' ? '_pl' : '';
            const templateSuffix = body.template === 'simple' ? '_simple' : '';
            filename = `CHANGELOG${templateSuffix}${langSuffix}.html`;
            break;
          }
          case 'markdown':
            content = generateMarkdown(data);
            contentType = 'text/markdown';
            filename = 'CHANGELOG.md';
            break;
          case 'json':
            content = generateJSON(data);
            contentType = 'application/json';
            filename = 'changelog.json';
            break;
          default:
            return Response.json({ error: 'Invalid format' }, { status: 400 });
        }

        return new Response(content, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });
      }

      return new Response('Not Found', { status: 404 });
    }
  });

  console.log(`✅ Server started at http://127.0.0.1:${port}`);
}
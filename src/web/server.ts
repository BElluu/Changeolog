import { StageManager, validateStagedData } from '../stage';
import type { StagedData } from '../types';
import { renderEditor } from './editor';
import { type ExportRequest, isExportFormat, renderExport } from '../export';

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
        const body = (await req.json().catch(() => ({}))) as Partial<ExportRequest>;
        if (!isExportFormat(body.format)) {
          return Response.json({ error: 'Invalid format' }, { status: 400 });
        }
        const { content, contentType, filename } = renderExport(await stage.load(), body as ExportRequest);

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
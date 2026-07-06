import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { Subject } from 'rxjs';
import { AppService } from './app.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  private message$ = new Subject<string>();

  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() reply: FastifyReply): void {
    reply.redirect('/locations', 302);
  }

  @Get(['privacy', 'about', 'terms'])
  redirectLegacyPages(@Res() reply: FastifyReply): void {
    reply.redirect('/locations', 302);
  }

  @Get('chat')
  getChat(): any {
    return {
      message: this.appService.getHello(),
    };
  }

  @Get('offline.html')
  getOffline(@Res() reply: FastifyReply): void {
    reply.redirect('/locations', 302);
  }

  @Sse('sse')
  getChatStream() {
    return this.message$;
  }

  @Post('message')
  async postMessages(@Body() body: any) {
    const message = body.message as string;
    this.message$.next(`
      <div class='chat chat-end'>
        <div class='chat-header'>
          User
        </div>
        <div class='chat-bubble'>${message}</div>
      </div>
      `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.message$.next(`
      <div class='chat chat-start'>
        <div class='chat-header'>
          Assistant
        </div>
        <div class='chat-bubble'>Hello</div>
      </div>
      `);
    this.logger.debug(`done with ${this.postMessages.name}`);
  }

  @Get('.well-known/*')
  well_known() {
    return {};
  }

  @Get('sitemap.xml')
  sitemap(@Req() req: FastifyRequest, @Res() reply: FastifyReply): void {
    const protocol =
      (req.headers['x-forwarded-proto'] as string) ?? req.protocol;
    const host = (req.headers['x-forwarded-host'] as string) ?? req.host;
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];
    reply.header('Content-Type', 'application/xml; charset=utf-8');
    reply.send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/locations</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
    );
  }
}

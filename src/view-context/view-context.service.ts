import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ViewContextService {
  constructor(private configService: ConfigService) {}

  async buildContext(req: FastifyRequest) {
    await Promise.resolve();
    const locale = 'zh';
    const path = req.url.split('?')[0];
    const protocol =
      (req.headers['x-forwarded-proto'] as string) ?? req.protocol;
    const host = (req.headers['x-forwarded-host'] as string) ?? req.hostname;
    const canonicalUrl = `${protocol}://${host}${path}`;
    const baseUrl = req.url === '/' ? '' : path;
    const appName = this.configService.get<string>('APP_NAME');
    const appDescription =
      '运行在个人 NAS 上的家庭衣物位置相册，用照片记录衣物放在哪里。';

    return {
      appName,
      siteUrl: this.configService.get<string>('SITE_URL') ?? host,
      baseUrl,
      authEnabled: false,
      signupsDisabled: true,
      pwaEnabled: false,
      locale,
      canonicalUrl,
      ogUrl: canonicalUrl,
      ogLocale: 'zh_CN',
      ogTitle: appName,
      ogDescription: appDescription,
      ogImage: `${protocol}://${host}/assets/lazztech_icon.png`,
    };
  }
}

import * as crypto from 'crypto';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
      private readonly http: HttpService,
      private readonly config: ConfigService,
    ) {}

    async send(payload: Record<string, any>) {
        const url = this.config.get<string>('WEBHOOK_URL');
        const secret =
          this.config.get<string>('WEBHOOK_SECRET') ?? '';
    
        if (!url) {
          this.logger.warn('WEBHOOK_URL não configurada');
          return;
        }
    
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex');
    
        try {
          await firstValueFrom(
            this.http.post(url, payload, {
              headers: {
                'X-Api-Revision': '2026.2',
                'X-Signature': signature,
              },
            }),
          );
        } catch (error) {
          this.logger.error(
            'Erro ao enviar webhook',
            error,
          );
        }
      }
}


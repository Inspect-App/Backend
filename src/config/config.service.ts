import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('port');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('database.url');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('jwtSecret');
  }

  get databaseHost(): string {
    return this.configService.get<string>('database.host');
  }

  get databasePort(): number {
    return this.configService.get<number>('database.port');
  }

  get databaseUser(): string {
    return this.configService.get<string>('database.user');
  }

  get databasePassword(): string {
    return this.configService.get<string>('database.password');
  }

  get databaseDbName(): string {
    return this.configService.get<string>('database.dbName');
  }
}

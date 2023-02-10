import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Response } from 'express';
import { EntityManager } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectEntityManager('billing_db')
    private readonly billingDbManager: EntityManager,
    @InjectEntityManager('filenode_db')
    private readonly filenodeDbManager: EntityManager,
    @InjectEntityManager('authnode_db')
    private readonly authnodeDbManager: EntityManager,
  ) {}
  @Get()
  getMetaData(): any {
    return {
      title: 'Dashboard API',
      description: 'Dashboard API for Billing',
      swaggerUrl: '/api',
      openApiJsonUrl: '/api-json',
    };
  }

  @Get('__internal/health')
  @ApiOkResponse()
  async getHealthCheck(@Res() res: Response): Promise<void> {
    try {
      await this.billingDbManager.query('SELECT 1 FROM user_plan');
      await this.filenodeDbManager.query('SELECT 1 FROM buckets');
      await this.authnodeDbManager.query('SELECT 1 FROM users');

      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

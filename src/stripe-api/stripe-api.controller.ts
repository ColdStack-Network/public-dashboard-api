import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IsAuth } from '../authnode-api/guards/checkAuth';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { SubscriptionDto } from './dto/subscription-dto';
import { StripeApiService } from './stripe-api.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GetStripeQuery } from './dto/get-stripe-secret.dto';

@Controller('stripe-api')
export class StripeApiController {
  constructor(private readonly stripeApiService: StripeApiService) {}

  @Post('subscribe')
  @UseGuards(IsAuth)
  async subscribe(
    @Body() body: SubscriptionDto,
    @CurrentUser() user: IUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.stripeApiService.subscribe({
        user,
        tariffId: user.tariffId,
        shouldCreateNewUserPlan: true,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Req() req: Request, @Res() res: Response) {
    const session = await this.stripeApiService.createCheckoutSession(
      req.body.lookup_key,
    );

    res.redirect(303, session.url);
  }

  @Post('create-portal-session')
  async createPortalSession(@Req() req: Request, @Res() res: Response) {
    const { session_id: sessionId } = req.body;

    const portalSession = await this.stripeApiService.createPortalSession(
      sessionId,
    );

    res.redirect(303, portalSession.url);
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.stripeApiService.webhook(req);
    } catch (err) {
      return res.status(400).send(err.message);
    }

    res.status(200).send();
  }

  @Get('secret')
  @UseGuards(IsAuth)
  async getSecret(@CurrentUser() user: IUser, @Query() query: GetStripeQuery) {
    return this.stripeApiService.getSecret(user, query);
  }
}

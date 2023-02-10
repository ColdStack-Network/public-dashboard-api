import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import assert from 'assert';
import { APP_CONFIGS_KEY, TAppConfigs } from '../common/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IUser } from './interfaces/user.interface';
import { UserStatus } from './types/user-status.enum';
import { CreatePhysicalUserDto } from '../admin/users/dto/create-physical-user.dto';
import { CreateCorporateUserDto } from '../admin/users/dto/create-corporate-user.dto';

@Injectable()
export class AuthnodeApiService {
  private axios: AxiosInstance;

  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfig: TAppConfigs,
    @InjectPinoLogger(AuthnodeApiService.name)
    private readonly logger: PinoLogger,
  ) {
    this.axios = axios.create({
      baseURL: appConfig.authnodeUrl,
    });
  }

  async getUsersCount(): Promise<number> {
    const resp = await this.axios.get<{ usersCount: number }>('/users-count');

    assert(
      !!resp.data.usersCount,
      new TypeError(
        `Invalid result of GET /users-count: ${JSON.stringify(resp.data)}`,
      ),
    );

    return resp.data.usersCount;
  }

  /**
   * @param token JWT access token. Can be in Authorization header format like `Bearer eyJ...` or just `eyJ...`
   */
  async getAuthData(token: string): Promise<IUser> {
    if (!token) {
      throw new UnauthorizedException();
    }

    return await this.axios
      .get('/me', {
        headers: {
          Authorization: token.replace(/^(Bearer )?(.*)/, 'Bearer $2'),
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new UnauthorizedException();
      })
      .then((res) => res.data);
  }

  async getUserById(id: string): Promise<IUser> {
    const result = await this.axios
      .get('/__internal/users/' + id)
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<IUser> {
    const result = await this.axios
      .get('/__internal/users/stripe-customer-id/' + stripeCustomerId)
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async getAllUserIds(): Promise<{ id: string; email: string }[]> {
    const result = await this.axios
      .get('/__internal/users-ids')
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async stripeFallBack(customerId: string): Promise<IUser> {
    const result = await this.axios
      .post(`/auth/fallback-user-last-step/${customerId}`)
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async updateStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    const result = await this.axios
      .put(`/__internal/users/${userId}/stripe-customer-id/${stripeCustomerId}`)
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async getStripeCustomerForUser(userId: string): Promise<string> {
    const result = await this.axios
      .get(`/__internal/users/${userId}/stripe-customer-id`)
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
    return result.data;
  }

  async updateUserTariffId(userId: string, tariffId: number): Promise<void> {
    await this.axios
      .put(`/__internal/users/${userId}/tariff/${tariffId}`)
      .catch((res) => {
        const result = res.response?.data;

        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
  }

  async updateUserNextTariffId(
    userId: string,
    tariffId: number,
  ): Promise<void> {
    await this.axios
      .put(`/__internal/users/${userId}/next-tariff/${tariffId}`)
      .catch((res) => {
        const result = res.response?.data;

        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
  }

  async deleteUserNextTariffId(userId: string): Promise<void> {
    await this.axios
      .delete(`/__internal/users/${userId}/next-tariff`)
      .catch((res) => {
        const result = res.response?.data;

        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    await this.axios
      .put(`/__internal/users/${userId}/status/${status}`)
      .catch((res) => {
        const result = res.response?.data;

        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
  }

  async getActiveUsers(): Promise<{ userId: string; tariffId: number }[]> {
    const result = await this.axios
      .get<{ userId: string; tariffId: number }[]>(
        '/__internal/active-users-ids',
      )
      .catch((res) => {
        const result = res.response?.data;
        throw new HttpException(
          result?.message || 'Internal error',
          result?.statusCode || 500,
        );
      });

    return result.data;
  }

  async startEmailVerificationProcess(userId: string): Promise<void> {
    await this.axios
      .post('/auth/start-email-verification-process', { userId })
      .catch((res) => {
        const result = res.response?.data;

        throw new HttpException(
          result?.message || 'Internal server error',
          result?.statusCode || 500,
        );
      });
  }

  async resetUserProfileAfterSignUpState(userId: string): Promise<IUser> {
    const rep = await this.axios.put<IUser>(
      `auth/reset-profile-to-after-sign-up-state`,
      { userId },
    );
    return rep.data;
  }

  async genAccessKeyForFirstSub(userId: string): Promise<void> {
    await this.axios.post('auth/gen-access-key-for-first-sub', { userId });
  }

  async createVerifiedPhysicalUser(body: CreatePhysicalUserDto): Promise<void> {
    await this.axios.post(
      `__internal/auth/create-verified-user/physical`,
      body,
    );
  }
  async createVerifiedCorporateUser(
    body: CreateCorporateUserDto,
  ): Promise<void> {
    await this.axios.post(
      `__internal/auth/create-verified-user/corporate`,
      body,
    );
  }
}

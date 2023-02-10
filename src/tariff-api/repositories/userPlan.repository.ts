import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager, EntityRepository, Repository } from 'typeorm';
import { AuthnodeApiService } from '../../authnode-api/authnode-api.service';
import { IUser } from '../../authnode-api/interfaces/user.interface';
import { UserStatus } from '../../authnode-api/types/user-status.enum';
import { TariffsEntity } from '../entities/tariffs.entity';
import { UserPlanEntity } from '../entities/userPlan.entity';

@Injectable()
@EntityRepository(UserPlanEntity)
export class UserPlanRepository extends Repository<UserPlanEntity> {
  constructor(
    @InjectEntityManager('billing_db')
    private readonly bililngDbManager: EntityManager,
    @InjectPinoLogger(AuthnodeApiService.name)
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  getLastForUser(userId: string) {
    return this.findOne({
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
  }

  getActiveForUser(user: IUser): Promise<UserPlanEntity> {
    return this.findOne({
      relations: ['tariff'],
      where: {
        user_id: user.id,
        tariff_id: user.tariffId,
        active: true,
      },
    });
  }

  getCurrentUserPlan(user: IUser): Promise<UserPlanEntity> {
    return this.findOne({
      relations: ['tariff'],
      where: {
        user_id: user.id,
        tariff_id: user.tariffId,
        active: true,
      },
    });
  }

  async createForUser(params: {
    user: IUser;
    tariff: TariffsEntity;
    startDate?: Date;
    active?: boolean;
  }): Promise<UserPlanEntity> {
    const { user, tariff, startDate = new Date(), active = false } = params;

    const createdAt = startDate;

    const endAt = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth() + 1,
      createdAt.getDate(),
    );

    let newPlan;

    const queryRunner = await this.manager.connection.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      newPlan = new UserPlanEntity();
      newPlan.user_id = user.id;
      newPlan.tariff_id = tariff.id;
      newPlan.created_at = createdAt;
      newPlan.end_at = endAt;
      newPlan.active = active;
      newPlan.tariff = tariff;

      if (user.status === UserStatus.Trial) {
        const startAt = new Date();
        const endAt = new Date(startAt);
        endAt.setDate(endAt.getDate() + 30);

        newPlan.start_at = startAt;
        newPlan.end_at = endAt;
      }

      await queryRunner.manager.save(newPlan);

      this.bililngDbManager.save(newPlan);

      await queryRunner.commitTransaction();
    } catch (err) {
      console.log('createForUser Error:', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return newPlan;
  }

  async activatePlan(userId: string, id: number): Promise<void> {
    await this.update({ user_id: userId }, { active: false });

    await this.update({ id }, { active: true });
  }
}

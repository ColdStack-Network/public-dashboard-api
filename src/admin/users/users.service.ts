import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetUsersResponseDto } from './dto/get-users-response.dto';
import { UserRepository } from './repositories/user.repository';
import { CommonService } from '../../common/common.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { toDto } from '../../common/utils';
import { UserDao } from './User.dao';
import { CompanyRepository } from './repositories/company.repository';
import { UserDto } from './dto/user.dto';
import { GetUsersQueryBuilder } from './GetUsersQueryBuilder';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository, 'authnode_db')
    private readonly usersRepo: UserRepository,
    @InjectRepository(CompanyRepository, 'authnode_db')
    private readonly companyRepo: CompanyRepository,
    private readonly commonService: CommonService,
    @InjectEntityManager()
    private readonly dashboardApiDbManager: EntityManager,
    private readonly getUsersQueryBuilder: GetUsersQueryBuilder,
  ) {}

  public async getUsers(query: GetUsersQueryDto): Promise<GetUsersResponseDto> {
    const {
      orderBy = 'email',
      order = 'DESC',
      searchValue = '',
      corporateOnly,
    } = query;

    const stats = await this.usersRepo.getOverallStatistics({
      searchValue,
      corporateOnly,
    });

    this.getUsersQueryBuilder.init();
    this.getUsersQueryBuilder.orderBy = orderBy;
    this.getUsersQueryBuilder.order = order;
    this.getUsersQueryBuilder.limit = query.perPage || 10;

    const getUsersList = async (): Promise<UserDto[]> => {
      const res = await this.dashboardApiDbManager.query(
        this.getUsersQueryBuilder.build(),
      );

      const users: UserDto[] = await Promise.all(
        res.map(async ({ filesCount, filesSize, companyId, ...rest }) => ({
          ...rest,
          filesCount: filesCount || 0,
          filesSize: this.commonService.getPrettyBytes(filesSize),
          company: companyId
            ? await this.companyRepo.findOne({ id: companyId })
            : null,
        })),
      );

      return users;
    };

    if (corporateOnly === 'true') {
      this. getUsersQueryBuilder.andWhere('users.company_id IS NOT NULL');
    }

    this.getUsersQueryBuilder.andWhere(
      `(LOWER(users.name) LIKE '%${searchValue}%' OR LOWER(users.last_name) LIKE '%${searchValue}%' OR LOWER(users.email) LIKE '%${searchValue}%')`,
    );

    const page = +query.page || 1;
    const perPage = +query.perPage || 10;

    this.getUsersQueryBuilder.offset = (page - 1) * perPage;

    if (query.group && query.group !== 'all') {
      this.getUsersQueryBuilder.andWhere(`users.status = '${query.group}'`);
    }

    return new GetUsersResponseDto({
      items: await getUsersList(),
      ...stats,
      group: query.group || undefined,
      page,
      perPage,
      pagesCount: Math.ceil(
        stats[query.group ? `${query.group}Count` : 'totalCount'] / perPage,
      ),
    });
  }

  async updateUser(body: UpdateUserDto): Promise<void> {
    const { id, status, tariffId, name, role, email, company } = body;
    let { password } = body;
    // check user ID realy exist
    await this.usersRepo.findOneOrFail({ id });

    if (password) password = await bcrypt.hash(password, 10);

    if (company) {
      await this.companyRepo.updateCompany(company);
    }

    // expose empty field -> hack for typeorm because nullish values will override stored values in db
    const dto = toDto(UserDao, {
      id,
      status,
      tariffId,
      name,
      role,
      password,
      email,
    });

    await this.usersRepo.update({ id }, { ...dto });
  }
}

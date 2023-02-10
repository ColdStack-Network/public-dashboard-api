import { NotImplementedException } from "@nestjs/common";
import { Inject, Injectable } from "@nestjs/common/decorators";
import { APP_CONFIGS_KEY, TAppConfigs } from "../../common/config";

@Injectable()
export class SqlQueryBuilder {
  public query: string;
  public limit = 10;
  public offset = 0;
  public orderBy = 'id';
  public order: 'ASC' | 'DESC' = 'ASC';
  protected whereQuery: string[] = [];

  constructor(
    @Inject(APP_CONFIGS_KEY)
    protected readonly appConfigs: TAppConfigs,
  ) {}

  init() {
    throw new NotImplementedException();
  }

  andWhere(q: string) {
    this.whereQuery.push(`${this.whereQuery.length ? 'AND ' : ''}${q}`);
  }

  build() {
    throw new NotImplementedException();
  }
}
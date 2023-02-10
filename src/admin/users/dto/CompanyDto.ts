import { PartialType } from '@nestjs/swagger';
import { MetaProperty } from '../../../common/decorators/meta-propery.decorator';
import { CompanyEntity } from '../entities/company.authnode-entity';

export class CompanyDto extends CompanyEntity {}

export class UpdateCompanyDto extends PartialType(CompanyDto) {
  @MetaProperty()
  id: string;
}

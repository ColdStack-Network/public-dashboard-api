import { EntityRepository, Repository } from 'typeorm';
import { UpdateCompanyDto } from '../dto/CompanyDto';
import { CompanyEntity } from '../entities/company.authnode-entity';

@EntityRepository(CompanyEntity)
export class CompanyRepository extends Repository<CompanyEntity> {
  async updateCompany(
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    const { id } = updateCompanyDto;
    await this.update({ id }, { ...updateCompanyDto });

    return this.findOne({ id });
  }
}

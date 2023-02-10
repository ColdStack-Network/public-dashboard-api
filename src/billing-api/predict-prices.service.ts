import { Injectable } from '@nestjs/common';
import { pricesForServices } from './constants/prices-for-services';
import { CostsEstimatorInputs } from './dto/costs-calc.dto';

@Injectable()
export class PredictPricesService {
  async getCostsEstimatorParams(): Promise<CostsEstimatorInputs> {
    return new CostsEstimatorInputs(pricesForServices);
  }
}

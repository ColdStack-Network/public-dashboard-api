import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserRole } from '../authnode-api/types/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { EmailTempaltes, SendGridService } from '../services/SendGrid.service';
import { SeoDto } from './dto/CeoDto';

@Controller('seo')
@Roles(UserRole.CUSTOMER)
export class CeoApiController {
  constructor(private sandgrid: SendGridService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async sendMigrationRequestEmail(@Body() payload: SeoDto) {
    const {
      firstName,
      lastName,
      company,
      email,
      phone,
      textPayload,
      storageSize: { id, name },
    } = payload;
    return this.sandgrid.sendEmailFromSupport({
      to: process.env.MAIL_TO,
      emailTemplate: EmailTempaltes.migration,
      subject: 'Result Migration From data',
      dynamic_template_data: {
        storageName: name,
        id,
        textPayload,
        phone,
        email,
        company,
        lastName,
        firstName,
      },
    });
  }
}

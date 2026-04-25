import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ContactChannel } from '../entities/buyer-seller-contact.entity';

export class RecordContactDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  seller_id: string;

  @IsOptional()
  @IsIn([ContactChannel.WHATSAPP])
  channel?: ContactChannel;
}

import { IsUUID } from 'class-validator';

export class NfcLoginDto {
  @IsUUID()
  userId: string;
}

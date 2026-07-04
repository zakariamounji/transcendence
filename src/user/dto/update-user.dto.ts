import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/common/dto/create-register.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
}

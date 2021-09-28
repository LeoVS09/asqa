import { Equals, IsDefined, IsString, ValidateNested, IsInt} from 'class-validator';


export interface CommonMessage<Meta = any> {
    meta: Meta
    text: string;
}

/** Expected interface messages send to/from telegram by kafka */
export class TelegramIdentityDto {
    @IsString()
    @Equals('telegram')
    provider: 'telegram';

    /** Local telegram chat id, used only for telegram */
    @IsDefined()
    id: number | string;
}


export class ToTelegramMetaDto {

    @ValidateNested()
    identity: TelegramIdentityDto
}

export class ToTelegramMessageDto implements CommonMessage<ToTelegramMetaDto> {
    @ValidateNested()
    meta: ToTelegramMetaDto;

    @IsString()
    text: string;
    
}


export class ToKafkaMetaDto {
    @ValidateNested()
    identity: TelegramIdentityDto

    @IsInt()
    timestamp: number
}

export class ToKafkaMessageDto implements CommonMessage<ToKafkaMetaDto> {
    @ValidateNested()
    meta: ToKafkaMetaDto;

    @IsString()
    text: string;
    
}
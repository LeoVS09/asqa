import { Equals, IsDefined, IsString, ValidateNested} from 'class-validator';

export interface CommonMessage<Meta = any> {
    meta: Meta
    text: string;
}

/** Expected interface for send message to telegram */
export class ToTelegramMetaDto {
    @IsString()
    @Equals('telegram')
    provider: 'telegram';

    /** Local telegram chat id, used only for telegram */
    @IsDefined()
    identity: number | string;
}

export class ToTelegramMessageDto implements CommonMessage<ToTelegramMetaDto> {
    @ValidateNested()
    meta: ToTelegramMetaDto;

    @IsString()
    text: string;
    
}

export class ToKafkaMetaDto {
    @IsString()
    provider: string;

    @IsDefined()
    identity: number | string;
}

export class ToKafkaMessageDto implements CommonMessage<ToKafkaMetaDto> {
    @ValidateNested()
    meta: ToTelegramMetaDto;

    @IsString()
    text: string;
    
}
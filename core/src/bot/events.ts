import { IEventIdentity, IEventMeta, IEventWithIdentity, IMessageFromUserEvent, IMessageToUserEvent } from "./interfaces";
import { IsDefined, IsNumber, IsString, ValidateNested} from 'class-validator';

export class EventIdentity implements IEventIdentity {
    
    @IsDefined()
    id: string | number;

    @IsString()
    provider: string;
    
}

export class EventMetaDto implements IEventMeta {
    @ValidateNested()
    identity: EventIdentity;

    @IsNumber()
    timestamp: number;
}

export class EventWithIdentityDto implements IEventWithIdentity {
    @ValidateNested()
    meta: EventMetaDto
}

export class MessageToUserEventDto extends EventWithIdentityDto implements IMessageToUserEvent {

    @IsString()
    text: string

}

export class MessageFromUserEventDto extends EventWithIdentityDto implements IMessageFromUserEvent {

    @IsString()
    text: string

}

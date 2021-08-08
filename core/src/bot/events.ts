import { IEventMeta, IEventWithIdentity, IMessageFromUserEvent, IMessageToUserEvent } from "./interfaces";
import { IsString, ValidateNested} from 'class-validator';

export class EventMetaDto implements IEventMeta {

    @IsString()
    identity: string;

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

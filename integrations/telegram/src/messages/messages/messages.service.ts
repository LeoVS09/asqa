import { Injectable } from '@nestjs/common';
import { FromTelegramMessageDto } from 'src/telegram';
import { ToKafkaMessageDto, ToTelegramMessageDto } from '../models';

// TODO: store messagges in separate service for easy updates and translation
const HELLO_MESSAGE =
    'Hello! ' +
    'This AI know everything, just ask what you want to know. \n' +
    'For example: Why sky is blue?\n\n' +
    'Disclaimer: We in early alpha, ' +
    'but really want to give all people ability to get answers on any questions instantly.\n' +
    'Let us know if something work incorrectly or you have ideas what we can improve. ' +
    'You can write us directly, asqa-team@protonmail.com.';

export interface IKafkaService {
    send(message: ToKafkaMessageDto)
}

export interface ITelegramService {
    send(message: ToTelegramMessageDto)
}

@Injectable()
export class MessagesService {

    private telegram: ITelegramService
    private kafka: IKafkaService

    registerTelegram(telegram: ITelegramService){
        this.telegram = telegram
    }

    registerKafka(kafka: IKafkaService) {
        this.kafka = kafka
    }

    async getHello(){
        return HELLO_MESSAGE
    }

    onTelegramMessage(message: FromTelegramMessageDto) {
        this.kafka.send(message)
    }

    onKafkaMessage(message: ToTelegramMessageDto) {
        this.telegram.send(message)
    }

}
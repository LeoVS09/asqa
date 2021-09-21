import { Message, IMessageBroker } from "src/retranslator";
import { buildKafkaTopics, KafkaTopics } from "./configuration";
import { KafkaWrapper } from "./wrapper";

export class KafkaAdapter extends KafkaWrapper<Message> implements IMessageBroker {

    private readonly topics: KafkaTopics
  
    constructor() {
      super();
      this.topics = buildKafkaTopics()
    }
  
    on(callback: (message: Message) => void){
      return this.consumeMessages(this.topics.toUser, async (message) => callback(message))
    }
  
    send(message: Message) {
      return this.sendMessage(this.topics.fromUser, message)
    }
  }
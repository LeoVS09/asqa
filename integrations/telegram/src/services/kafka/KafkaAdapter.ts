import { CommonMessage } from "src/interfaces";
import { IMessageBroker } from "src/retranslator";
import { buildKafkaTopics, KafkaTopics } from "./configuration";
import { KafkaWrapper } from "./KafkaWrapper";

export class KafkaAdapter extends KafkaWrapper<CommonMessage> implements IMessageBroker {

    private readonly topics: KafkaTopics
  
    constructor() {
      super();
      this.topics = buildKafkaTopics()
    }
  
    on(callback: (message: CommonMessage) => void){
      return this.consumeMessages(this.topics.toUser, async (message) => callback(message))
    }
  
    send(message: CommonMessage) {
      return this.sendMessage(this.topics.fromUser, message)
    }
  }
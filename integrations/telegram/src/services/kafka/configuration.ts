import { SASLOptions, KafkaConfig, logLevel, Kafka } from "kafkajs";

const getSASLOptions = (username: string, password: string): SASLOptions => 
    username && password
        ? { username, password, mechanism: 'plain' }
        : undefined;

export interface KafkaTopics {
    toUser: string
    fromUser: string
}

export function buildKafkaConfig(): KafkaConfig {
    const {KAFKA_BOOTSTRAP_SERVER: broker} = process.env
    if (!broker) 
        throw new Error("Cannot find enviroment variable KAFKA_BOOTSTRAP_SERVER")
    console.log('Will use broker', broker)

    const { KAFKA_USERNAME: username } = process.env
    if(!username) 
        console.warn('Didn\'t have KAFKA_USERNAME enviroment variable')

    const {KAFKA_PASSWORD: password} = process.env
    if(!password) 
        console.warn('Didn\'t have KAFKA_PASSWORD enviroment variable')

    const sasl = getSASLOptions(username, password);
    const ssl = !!sasl;
    if (!sasl) 
        console.warn('Not have credentials for SASL configuration, will work without ssl')

    return {
        clientId: 'asqa-client',
        brokers: [broker],
        logLevel: logLevel.INFO,
        ssl,
        sasl,
    }
}

export function buildKafkaTopics(): KafkaTopics {
    const {SEND_TO_USER_TOPIC: toUserTopic} = process.env
    if (!toUserTopic)
        throw new Error("Cannot find enviroment variable SEND_TO_USER_TOPIC")

    const {MESSAGE_FROM_USER_TOPIC: fromUserTopic} = process.env
    if (!fromUserTopic)
        throw new Error("Cannot find enviroment variable MESSAGE_FROM_USER_TOPIC")

    return {
        toUser: toUserTopic,
        fromUser: fromUserTopic,
    }
}


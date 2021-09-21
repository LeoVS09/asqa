
const HELLO_MESSAGE =
    'Hello! ' +
    'This AI know everything, just ask what you want to know. \n' +
    'For example: Why sky is blue?\n\n' +
    'Disclaimer: We in early alpha, ' +
    'but really want to give all people ability to get answers on any questions instantly.\n' +
    'Let us know if something work incorrectly or you have ideas what we can improve. ' +
    'You can write us directly, asqa-team@protonmail.com.';

export class MessagesService {

    // TODO: store messagges in separate service for easy updates and translation

    async getHello(){
        return HELLO_MESSAGE
    }

}
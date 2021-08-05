import torch

class EmbedingModel:

    def __init__(self, embeder, tokenizer):

        self.embeder = embeder
        self.tokenizer = tokenizer

    def embed_questions(self, questions, max_length = 128):

        tokens = self.tokenizer.batch_encode_plus(questions, max_length=max_length, pad_to_max_length=True)
        ids, mask = (torch.LongTensor(tokens["input_ids"]), torch.LongTensor(tokens["attention_mask"]))

        with torch.no_grad():
            reprisentation = self.embeder.embed_questions(ids, mask).cpu().type(torch.float)

        return reprisentation.numpy()
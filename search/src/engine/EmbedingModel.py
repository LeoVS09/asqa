import torch
from transformers import AutoModel, AutoTokenizer

def read_tokenizer(filename):
    return AutoTokenizer.from_pretrained(
        filename,
        # solve Exception: No such file or directory (os error 2), 
        # simular to https://github.com/VinAIResearch/PhoBERT/issues/26 
        use_fast=False
    )

def read_embeder(filename):
    model = AutoModel.from_pretrained(filename)
    _ = model.eval()
    return model

class EmbedingModel:

    def __init__(self, embeder_filename, tokenizer_filename):

        self.embeder = read_embeder(embeder_filename)
        self.tokenizer = read_tokenizer(tokenizer_filename)

    def embed_questions(self, questions, max_length = 128):

        tokens = self.tokenizer.batch_encode_plus(questions, max_length=max_length, pad_to_max_length=True)
        ids, mask = (torch.LongTensor(tokens["input_ids"]), torch.LongTensor(tokens["attention_mask"]))

        with torch.no_grad():
            reprisentation = self.embeder.embed_questions(ids, mask).cpu().type(torch.float)

        return reprisentation.numpy()
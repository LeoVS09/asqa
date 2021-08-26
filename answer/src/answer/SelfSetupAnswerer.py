from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from .Answerer import Answerer
from .TokenaizerWrapper import TokenaizerWrapper
import logging

def read_tokenizer(filename):
    return AutoTokenizer.from_pretrained(
        filename,
        # solve Exception: No such file or directory (os error 2), 
        # simular to https://github.com/VinAIResearch/PhoBERT/issues/26 
        use_fast=False
    )

def read_model(filename):
    model = AutoModelForSeq2SeqLM.from_pretrained(filename)
    _ = model.eval()
    return model

class SelfSetupAnswerer(Answerer):

    def __init__(self, model_filename, tokenizer_filename):

        logging.info(f'Reading tokenizer from {tokenizer_filename}')
        tokenizer = read_tokenizer(tokenizer_filename)
        
        logging.info(f'Reading model from {model_filename}')
        model = read_model(model_filename)

        super().__init__(
            model = model, 
            tokenizer = TokenaizerWrapper(tokenizer)
        )

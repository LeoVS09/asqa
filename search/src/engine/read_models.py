from transformers import AutoModel, AutoTokenizer
import logging
from config import settings

def read_tokenizer(filename):
    return AutoTokenizer.from_pretrained(
        filename,
        # solve Exception: No such file or directory (os error 2), 
        # simular to https://github.com/VinAIResearch/PhoBERT/issues/26 
        use_fast=False
    )

def read_model(filename):
    model = AutoModel.from_pretrained(filename)
    _ = model.eval()
    return model

def read_models():
    logging.info('Reading tokenizer...')
    tokenizer = read_tokenizer(settings['TOKENIZER_FILENAME'])
    logging.info('Reading model...')
    model = read_model(settings['MODEL_FILENAME'])

    return tokenizer, model


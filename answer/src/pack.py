from config import settings
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import logging

from .AnswerService import AnswerService, MODELS_ARTIFACT_NAME, MODEL_KEY, TOKENIZER_KEY

TOKENIZER_FILE = settings['TOKENIZER_FILE']
MODEL_FILE = settings['MODEL_FILE']
YATAI_URL = settings['YATAI_URL']
APP_VERSION = settings['APP_VERSION']

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

if __name__ == '__main__':
    service = AnswerService()

    logging.info(f'Reading tokenizer from {TOKENIZER_FILE}')
    tokenizer = read_tokenizer(TOKENIZER_FILE)
    
    logging.info(f'Reading model from {MODEL_FILE}')
    model = read_model(MODEL_FILE)

    logging.info('Pack the trained model artifact...')
    artifact = {MODEL_KEY: model, TOKENIZER_KEY: tokenizer}
    service.pack(MODELS_ARTIFACT_NAME, artifact)

    logging.info(f'Save the prediction service to Yatai registry {YATAI_URL} for model serving...')
    saved_path = service.save(yatai_url=YATAI_URL,labels={"framework": "transformers", "version": APP_VERSION})

    logging.info(f'Saved to {saved_path}')
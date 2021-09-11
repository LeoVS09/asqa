from config import settings
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import logging

if settings['DEBUG_LOG']:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

from .AnswerService import AnswerService, MODELS_ARTIFACT_NAME, MODEL_KEY, TOKENIZER_KEY

# TODO: use mlflow for load and save models
TOKENIZER_FILE = settings['TOKENIZER_FILE']
MODEL_FILE = settings['MODEL_FILE']
# While BentoML config not working, need allow pack locally. 
# TODO: fix when https://github.com/bentoml/BentoML/issues/1799 will be resolved
USE_YATAI = settings['USE_YATAI'] 
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

    labels={"framework": "transformers", "version": APP_VERSION}
    
    if USE_YATAI:
        logging.info(f'Save the prediction service to Yatai registry {YATAI_URL} for model serving...')
        saved_path = service.save(yatai_url=YATAI_URL, labels=labels)
    else:
        logging.info(f'Save the prediction service for model serving...')
        saved_path = service.save(labels=labels)
    
    logging.info(f'Saved to {saved_path}')
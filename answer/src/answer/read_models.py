from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

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

ARCHIVE_FOLDER = './data'
PASSAGES_FILENAME = f'{ARCHIVE_FOLDER}/passages'
INDEX_FILENAME = f'{ARCHIVE_FOLDER}/index'
TOKENIZER_FILENAME = f'{ARCHIVE_FOLDER}/tokenizer'
MODEL_FILENAME = f'{ARCHIVE_FOLDER}/model'

def read_models():
    tokenizer = read_tokenizer(TOKENIZER_FILENAME)
    model = read_model(MODEL_FILENAME)

    return tokenizer, model


import os
from config import settings
import logging

from .SearchEngine import SearchEngine
from .EmbedingModel import EmbedingModel

from .IndexSearch import IndexSearch

cache_folder = settings['CACHE_FOLDER']
index_filename = os.path.join(cache_folder, settings['INDEX_FILENAME']) 
tokenizer_filename = os.path.join(cache_folder, settings['TOKENIZER_FILENAME'])
embeder_filename = os.path.join(cache_folder, settings['EMBEDER_FILENAME'])

def load_and_init_engine(passages):

    logging.info(f'Reading index from {index_filename}')
    index = IndexSearch(index_filename)
    
    logging.info(f'Reading embeding model from {embeder_filename} and tokenizer from {tokenizer_filename}')
    model = EmbedingModel(embeder_filename, tokenizer_filename)

    return SearchEngine(
        model = model, 
        passages = passages, 
        index = index,
    )
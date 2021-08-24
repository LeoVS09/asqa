import os
import logging
from config import settings

from .SearchEngine import SearchEngine
from .EmbedingModel import EmbedingModel
from .read_models import read_models
from .IndexSearch import IndexSearch
from src.db.PassagesDatabaseMongoAdapter import PassagesDatabaseMongoAdapter

REINDEX_SIZE = settings['REINDEX_SIZE']
MEANINGULL_SIZE = settings['MEANINGULL_SIZE']

def load_and_init_engine():
    passages = PassagesDatabaseMongoAdapter(mongodb_url = settings['MONGODB_URL'])
    index = IndexSearch()
    tokenizer, model = read_models()

    return SearchEngine(
        model = EmbedingModel(model, tokenizer), 
        passages = passages, 
        index = index,
        reindex_size = REINDEX_SIZE,
        meaningfull_size = MEANINGULL_SIZE
    )
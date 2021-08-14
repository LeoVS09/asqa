import os
import logging
from config import settings

from .SearchEngine import SearchEngine
from .EmbedingModel import EmbedingModel
from .read_models import read_models
from .IndexSearch import IndexSearch
from src.db.PassagesDatabaseMongoAdapter import PassagesDatabaseMongoAdapter

def load_and_init_engine():
    passages = PassagesDatabaseMongoAdapter(mongodb_url = settings['MONGODB_URL'])
    index = IndexSearch(num_rows = passages.num_rows, compress = settings['COMPRESS_INDEX'])

    index, tokenizer, model = read_models()

    return SearchEngine(
        model = EmbedingModel(model, tokenizer), 
        passages = passages, 
        index = index
    )
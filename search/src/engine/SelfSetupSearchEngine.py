import os
from config import settings
import logging

from .SearchEngine import SearchEngine
from .EmbedingModel import EmbedingModel

from .IndexSearch import IndexSearch

logger = logging.getLogger(__name__)

class SelfSetupSearchEngine(SearchEngine):

    def __init__(self, passages, embeder_filename, tokenizer_filename, index_filename):

        logger.info(f'Reading embeding model from {embeder_filename} and tokenizer from {tokenizer_filename}')
        model = EmbedingModel(embeder_filename, tokenizer_filename)

        logger.info(f'Reading index from {index_filename}')
        index = IndexSearch(index_filename)

        super().__init__(
            model = model, 
            passages = passages, 
            index = index,
        )

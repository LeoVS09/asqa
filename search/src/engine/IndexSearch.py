import faiss
import numpy as np
from .read_models import INDEX_FILENAME
import logging

class IndexSearch:

    def __init__(self, filename = INDEX_FILENAME):
        """
        @param compress - Use compression to decrease size of used RAM, can decrease search results
        
        """
        logging.info(f'Reading index from {filename}')
        self.index = faiss.read_index(filename)

        if not self.index.is_trained:
            logging.info('Perform training on index...')
            raise Exception('Index require training')
   
        logging.info(f'N total of index is {self.index.ntotal}')

    def search(self, *args, **kwargs):
        return self.index.search(*args, **kwargs)

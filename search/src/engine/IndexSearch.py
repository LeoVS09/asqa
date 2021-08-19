import faiss
import numpy as np
from .read_models import INDEX_FILENAME
import logging

class IndexSearch:

    # wiki40b_passages_reps_32_l-8_h-768_b-512-512.dat
    def __init__(self, num_rows, filename = INDEX_FILENAME, batch_size = 128, compress = False):
        """
        @param compress - Use compression to decrease size of used RAM, can decrease search results
        
        """
        logging.info(f'Reading index from {filename}')
        passages_reps = np.memmap(
            filename,
            dtype='float32', mode='r',
            shape=(num_rows, batch_size)
        )

        self.index = None

        if compress:
            raise Exception('Not implemented')
        else:
            self.index = faiss.IndexFlatIP(batch_size)

        if not self.index.is_trained:
            logging.info('Perform training on index...')
            raise Exception('Index require training')

        self.index.add(passages_reps)
   
        logging.info(f'N total of index is {self.index.ntota}')

    def search(self, *args, **kwargs):
        return self.index.search(*args, **kwargs)

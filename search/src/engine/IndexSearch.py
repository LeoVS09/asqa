import scann
import logging
from config import settings

filename = settings['INDEX_FILENAME']
nprobe = settings['INDEX_NPROBE']

class IndexSearch:

    def __init__(self):
        logging.info(f'Reading index from {filename}')
        self.index = scann.scann_ops_pybind.load_searcher(filename)

    def search(self, questions_embeding, passages_count_to_search):
        neighbors, distances = self.index.search_batched(questions_embeding, final_num_neighbors = passages_count_to_search)
        return distances, neighbors

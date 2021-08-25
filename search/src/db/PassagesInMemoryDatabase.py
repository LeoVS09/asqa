from datasets import Dataset
from config import settings

class PassagesInMemoryDatabase:
    """In memory implementation of text passages database"""

    def __init__(self):
        self.passages = Dataset.load_from_disk(settings['PASSAGES_FILENAME'])

    def get_batch(self, I):
        return [[self.passages[int(i)] for i in i_lst] for i_lst in I]
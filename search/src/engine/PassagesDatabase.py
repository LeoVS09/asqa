from datasets import Dataset
from .read_models import PASSAGES_FILENAME

def read_passages():
    return Dataset.load_from_disk(PASSAGES_FILENAME)

class PassagesInMemoryDatabase:
    """In memory implementation of text passages database"""

    def __init__(self):
        self.passages = read_passages()

    def get_batch(self, I):
        return [[self.passages[int(i)] for i in i_lst] for i_lst in I]
class PassagesInMemoryDatabase:
    """In memory implementation of text passages database"""

    def __init__(self, passages):
        self.passages = passages

    def get_batch(self, I):
        return [[self.passages[int(i)] for i in i_lst] for i_lst in I]
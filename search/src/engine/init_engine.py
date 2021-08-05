
from .SearchEngine import SearchEngine
from .EmbedingModel import EmbedingModel
from .read_models import read_models
from .PassagesDatabase import PassagesInMemoryDatabase

def load_and_init_engine():

    passages, index, tokenizer, model = read_models()

    return SearchEngine(
        model = EmbedingModel(model, tokenizer), 
        passages = PassagesInMemoryDatabase(passages), 
        index = index
    )
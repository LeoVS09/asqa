
from .read_models import read_models
from .Answerer import Answerer
from .TokenaizerWrapper import TokenaizerWrapper


def load_and_init_answerer():

    tokenizer, model = read_models()
    

    return Answerer(
        model = model, 
        tokenizer = TokenaizerWrapper(tokenizer)
    )
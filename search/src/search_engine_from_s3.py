from .SearchEngine import SearchEngine
from .load_from_s3 import load_and_read_files
from .EmbedingModel import EmbedingModel

def load_and_init_engine(s3_bucket, file_key):

    passages, index, tokenizer, model = load_and_read_files(s3_bucket, file_key)

    return SearchEngine(
        model = EmbedingModel(model, tokenizer), 
        passages = passages, 
        index = index
    )

    


import faiss
from transformers import AutoModel, AutoTokenizer
import boto3
import tarfile
import io
import numpy as np
from datasets import Dataset

s3 = boto3.client('s3')

def load_files(s3_bucket, file_key, folder):
    obj = s3.get_object(Bucket=s3_bucket, Key=file_key)
    bytestream = io.BytesIO(obj['Body'].read())
    tar = tarfile.open(fileobj=bytestream, mode="r:gz")

    tar.extractall(path=folder)

def read_passages(filename):
    return Dataset.load_from_disk(filename)

# wiki40b_passages_reps_32_l-8_h-768_b-512-512.dat
def read_index(filename, num_rows, batch_size = 128):
    wiki40b_passage_reps = np.memmap(
        filename,
        dtype='float32', mode='r',
        shape=(num_rows, batch_size)
    )

    wiki40b_index_flat = faiss.IndexFlatIP(batch_size)

    wiki40b_index_flat.add(wiki40b_passage_reps)

    return wiki40b_index_flat

def read_tokenizer(filename):
    return AutoTokenizer.from_pretrained(
        filename,
        # solve Exception: No such file or directory (os error 2), 
        # simular to https://github.com/VinAIResearch/PhoBERT/issues/26 
        use_fast=False
    )

def read_model(filename):
    model = AutoModel.from_pretrained(filename)
    _ = model.eval()
    return model


ARCHIVE_FOLDER = './data'
PASSAGES_FILENAME = f'{ARCHIVE_FOLDER}/passages'
INDEX_FILENAME = f'{ARCHIVE_FOLDER}/index'
TOKENIZER_FILENAME = f'{ARCHIVE_FOLDER}/tokenizer'
MODEL_FILENAME = f'{ARCHIVE_FOLDER}/model'

def load_and_read_files(s3_bucket, file_key):
    load_files(s3_bucket, file_key, ARCHIVE_FOLDER)

    passages = read_passages(PASSAGES_FILENAME)
    index = read_index(INDEX_FILENAME, num_rows = passages.num_rows)
    tokenizer = read_tokenizer(TOKENIZER_FILENAME)
    model = read_model(MODEL_FILENAME)

    return passages, index, tokenizer, model

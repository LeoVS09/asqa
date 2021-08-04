
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, AutoConfig
import torch
import boto3
import tarfile
import io
from .QuestionAnsweringModel import QuestionAnsweringModel
import os

s3 = boto3.client('s3')

# Baseed on https://github.com/philschmid/serverless-bert-with-huggingface-aws-lambda


class S3QAModel(QuestionAnsweringModel):
    def __init__(self, model_path=None, s3_bucket=None, file_key=None):
        if not os.path.isdir(model_path):
            raise ValueError(f'Model folder: {model_path}, do not exists')

        files = os.listdir(model_path)
        print('Will load model configuration from', files)

        model, tokenizer = self.from_pretrained(
            model_path, s3_bucket, file_key
        )

        super().__init__(model = model, tokenizer = tokenizer)

    def from_pretrained(self, model_path: str, s3_bucket: str, file_key: str):
        model = self.load_model_from_s3(model_path, s3_bucket, file_key)
        tokenizer = self.load_tokenizer(model_path)
        return model, tokenizer

    def load_model_from_s3(self, model_path: str, s3_bucket: str, file_key: str):
        if not model_path or not s3_bucket or not file_key:
            raise KeyError('No S3 Bucket and Key Prefix provided')
        
        obj = s3.get_object(Bucket=s3_bucket, Key=file_key)
        bytestream = io.BytesIO(obj['Body'].read())
        tar = tarfile.open(fileobj=bytestream, mode="r:gz")
        
        config = AutoConfig.from_pretrained(f'{model_path}/config.json')
        
        for member in tar.getmembers():
            if member.name.endswith(".bin"):
                f = tar.extractfile(member)
                state = torch.load(io.BytesIO(f.read()))
                model = AutoModelForQuestionAnswering.from_pretrained(
                    pretrained_model_name_or_path=None, state_dict=state, config=config
                )
        
        return model

    def load_tokenizer(self, model_path: str):
        tokenizer = AutoTokenizer.from_pretrained(
            model_path,
            # solve Exception: No such file or directory (os error 2), 
            # simular to https://github.com/VinAIResearch/PhoBERT/issues/26 
            use_fast=False
        )
        return tokenizer
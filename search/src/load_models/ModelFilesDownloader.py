import os
import logging
import tarfile
import boto3

logger = logging.getLogger(__name__)

TOKENIZER_FOLDER = 'tokenizer/'
EMBEDER_FOLDER = 'embeder/'
INDEX_FOLDER = 'index/'

def join_and_create(first_dir, second_dir):
    result_dir = os.path.join(first_dir, second_dir)
    os.makedirs(result_dir, exist_ok=True)
    return result_dir

class ModelFilesDownloader:

    def __init__(self):

        self.aws_client = None

        try:
            self.s3 = boto3.client('s3')
        except Exception as error:
            logger.error('Cannot connect to AWS, but still can use cache', error)

        
    # Load and cache file
    def load_file(self, cache_dir, file_url) -> str:
        if not file_url.startswith('s3://'):
            raise Exception(f'Unkonwn or unspecified protocol for file {file_url}, expected s3://')

        if not file_url.endswith('.tar.gz'):
            raise Exception(f'Unkonwn or unspecified extension for file {file_url}, expected .tar.gz')

        archive_name = file_url.split('/')[-1]
        archive_name = os.path.join(cache_dir, archive_name)

        filename = archive_name[:-len('.tar.gz')]

        if os.path.exists(filename):
            logger.info(f'File {file_url} found in cache as {filename}')
            return filename

        if not os.path.exists(archive_name):
            logger.info(f'Cache for {file_url} empty, will download...')

            url_without_protocol = file_url[len('s3://'):]
            bucket_name = url_without_protocol.split('/')[0]
            object_name = url_without_protocol[len(bucket_name) + 1:]

            self.s3.download_file(bucket_name, object_name, archive_name)    

        logger.info(f'Extracting archive {archive_name}')
        with tarfile.open(archive_name) as tf:
            tf.extractall(filename)

        logging.info(f'File {filename} is ready')
        return filename

    def load_models(self, cache_dir, tokenizer_url, embeder_url, index_url):

        tokenizer_folder = join_and_create(cache_dir, TOKENIZER_FOLDER)
        tokenizer_filename = self.load_file(tokenizer_folder, tokenizer_url)

        embeder_folder = join_and_create(cache_dir, EMBEDER_FOLDER)
        embeder_filename = self.load_file(embeder_folder, embeder_url)

        index_folder = join_and_create(cache_dir, INDEX_FOLDER)
        index_filename = self.load_file(index_folder, index_url)

        return tokenizer_filename, embeder_filename, index_filename
    

try:
    import unzip_requirements
except ImportError:
    pass

import logging
import os
from src.search_engine_from_s3 import load_and_init_engine

SEARCH_DATA_BUCKET = os.environ.get('SEARCH_DATA_BUCKET')
if not SEARCH_DATA_BUCKET:
    raise ValueError('SEARCH_DATA_BUCKET enviroment variable must be specified')

SEARCH_DATA_KEY = os.environ.get('SEARCH_DATA_KEY')
if not SEARCH_DATA_KEY:
    raise ValueError('SEARCH_DATA_KEY enviroment variable must be specified')

engine = load_and_init_engine(SEARCH_DATA_BUCKET, SEARCH_DATA_KEY)

"""Adapter of search context for lambda enviroment"""
def search_passages(event, event_context):
    try:

        results_count = event.get('results_count')
        if not results_count:
            results_count = 10
        
        contexts = engine.search_passages([event['question']], results_count = results_count)

        return { 'context': contexts[0] }
    
    except Exception as e:
        logging.exception(e)
        
        return { "error": repr(e) }

try:
    import unzip_requirements
except ImportError:
    pass

import logging
import json
from src.predict_answer import predict_answer as predict_answer_fn


"""Example function which using model for predict answer"""
def predict_answer(event, context):
    try:
        
        answer = predict_answer_fn(event['question'], event['context'])

        return {
            "statusCode": 200,
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": True

            },
            "body": {'answer': answer}
        }
    
    except Exception as e:
        logging.exception(e)
        return {
            "statusCode": 500,
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": True
            },
            "body": {"error": repr(e)}
        }

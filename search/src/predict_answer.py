
from .S3QAModel import S3QAModel

model = S3QAModel('./trained_model', 'neural-networks-model-example', 'squad-distilbert/en.tar.gz')

def predict_answer(question, context):
    answer = model.predict(question, context)
    return answer
   
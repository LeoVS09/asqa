import logging
import os
from bentoml import env, artifacts, api, BentoService
from bentoml.adapters import JsonInput
from bentoml.frameworks.transformers import TransformersModelArtifact
from bentoml.types import JsonSerializable

from src.answer import Answerer

if os.environ.get('DEBUG_LOG'):
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

MODELS_ARTIFACT_NAME = 'transformersModel'
MODEL_KEY = 'model'
TOKENIZER_KEY = 'tokenizer'

http_input_example = """
{
    "question": "Why sky is blue?",
    "context": "<P> some paragraph <P> next paragraph <P> last paragraph </P>",
}
"""

@env(pip_packages=['transformers==4.9.1', 'torch==1.9.0'])
@artifacts([TransformersModelArtifact(MODELS_ARTIFACT_NAME)])
class AnswerService(BentoService):
    """
    Wrapper on model for predict answer
    """

    @api(input=JsonInput(http_input_example=http_input_example), batch=False) # TODO: use micro batch processing
    def predict(self, parsed_json: JsonSerializable):
        question = parsed_json.get("question")
        context = parsed_json.get("context")

        if not question or not context:
            raise Exception('BAD_REQUEST: question or context fields missing')

        model = self.artifacts.transformersModel.get(MODEL_KEY)
        tokenizer = self.artifacts.transformersModel.get(TOKENIZER_KEY)

        if not model or not tokenizer:
            raise Exception('Model or Tokenizer artifact not exists')

        answerer = Answerer(
            model = model, 
            tokenizer = tokenizer
        )

        return answerer.answer(question, context)
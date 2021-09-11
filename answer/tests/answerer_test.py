import pytest
import json

from src.answer import Answerer
from src.pack import read_tokenizer, read_model, TOKENIZER_FILE, MODEL_FILE

@pytest.fixture
def tokenizer():
    yield read_tokenizer(TOKENIZER_FILE)

@pytest.fixture
def model():
    yield read_model(MODEL_FILE)

def test_answerer(tokenizer, model, snapshot):
    answerer = Answerer(model = model, tokenizer = tokenizer)
    
    with open('./input.json', 'r') as f:
        input = json.load(f)

        answers = answerer.answer(
            question = input['question'],
            context = input['context']
        )

        assert len(answers) == 10, 'Not have 10 answers'
        assert isinstance(answers[0], str), 'First Answer must be a string'
        snapshot.assert_match(json.dumps(answers, indent=4), 'expected_answers.json')

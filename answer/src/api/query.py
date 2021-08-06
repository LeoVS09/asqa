from ariadne import ObjectType
from src.answer import load_and_init_answerer

query = ObjectType("Query")

answerer = load_and_init_answerer()

@query.field("status")
def resolve_status(_, info):
    return {'enabled': True}

@query.field("answr")
def resolve_search(_, info, input):
    question = input['question']

    answers = answerer.answer(
        question = question,
        context = input['context'],
        max_input_length = input['max_input_length'],
        num_answers = input['num_answers'],
        num_beams = input['num_beams'],
        min_answer_length = input['min_answer_length'],
        max_answer_length = input['max_answer_length'],
        do_sample = input['do_sample'],
        temperature = input['temperature'],
        top_p = input['top_p'],
        top_k = input['top_k'],
        no_repeat_ngram_size = input['no_repeat_ngram_size'],
        length_penalty = input['length_penalty'],
        max_time = input['max_time'],
    )

    nodes = []

    for text in answers:
        nodes.append({
            'question': question,
            'text': text
        })

    return {'nodes': nodes}


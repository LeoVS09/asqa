from ariadne import ObjectType
from src.engine import load_and_init_engine

query = ObjectType("Query")

engine = load_and_init_engine()

@query.field("status")
def resolve_status(_, info):
    return {'enabled': True}

@query.field("search")
def resolve_search(_, info, input):
    questions = input['questions']
    batch_passages = engine.search_passages(
        questions = questions,
        passages_count = input['passages_count'],
    )

    nodes = []

    for passages, question in zip(batch_passages, questions):
        nodes.append({
            'passages': passages,
            'question': question
        })

    return {'nodes': nodes}


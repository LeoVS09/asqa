from ariadne import ObjectType

query = ObjectType("Query")


@query.field("search")
def resolve_search(_, info, input):
    questions = input['questions']
    batch_passages = info.context.engine.search_passages(
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


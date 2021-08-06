from fastapi import APIRouter
from ariadne.asgi import GraphQL
from ariadne import load_schema_from_path, make_executable_schema
from .query import query
from config import settings

graphql_router = APIRouter()

type_defs = load_schema_from_path("schema.gql")

schema = make_executable_schema(type_defs, query)

graphql_router.add_route('/graphql', GraphQL(schema, debug=settings['GRAPHQL_DEBUG']))

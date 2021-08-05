from fastapi import FastAPI
from .api import router, graphql_router
from config import settings

app = FastAPI(port=settings['SERVER_PORT'])

app.include_router(router)
app.include_router(graphql_router)
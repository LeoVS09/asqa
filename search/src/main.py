import uvicorn
from fastapi import FastAPI
from fastapi_health import health
from .api import setup_graphql_router, AppContext
from .engine import SelfSetupSearchEngine
from config import settings
import logging
from .db.PassagesDatabaseMongoAdapter import PassagesDatabaseMongoAdapter
from .load_models import ModelFilesDownloader

if settings['DEBUG_LOG']:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

logging.info(f'App version: {settings["APP_VERSION"]}')

IS_DEVELOPMENT = settings['IS_DEVELOPMENT']
PORT = settings['SERVER_PORT']
CACHE_FOLDER = settings['CACHE_FOLDER']
INDEX_URL = settings['INDEX_URL']
TOKENIZER_URL = settings['TOKENIZER_URL']
EMBEDER_URL = settings['EMBEDER_URL']

def is_live():
    return {"started": True}

engine = None

def is_engine_ready():
    if engine is None:
        return False

    if not engine.is_ready():
        return False

    return {"engine": True}

passages_database = None

def is_passages_database_ready():
    if passages_database is None:
        return False

    if not passages_database.is_ready():
        return False
    
    return {'passages_database': True}

context = AppContext()

def startup():
    global engine
    global passages_database
    global context

    downloader = ModelFilesDownloader()
    tokenizer_filename, embeder_filename, index_filename = downloader.load_models(
        cache_dir = CACHE_FOLDER,
        tokenizer_url = TOKENIZER_URL,
        embeder_url = EMBEDER_URL,
        index_url = INDEX_URL
    )

    passages_database = PassagesDatabaseMongoAdapter(mongodb_url = settings['MONGODB_URL'])

    engine = SelfSetupSearchEngine(
        passages = passages_database, 
        embeder_filename = embeder_filename, 
        tokenizer_filename = tokenizer_filename, 
        index_filename = index_filename
    )
    context.set_engine(engine)

if __name__=="__main__":
    app = FastAPI(port=PORT)
    
    app.add_api_route("/is-live", health([is_live]))
    app.add_api_route("/is-ready", health([is_passages_database_ready, is_engine_ready]))

    app.include_router(setup_graphql_router(context))

    startup() # TODO: make it async

    uvicorn.run(app, host='0.0.0.0', port=PORT, reload=IS_DEVELOPMENT, debug=IS_DEVELOPMENT)
import uvicorn
from fastapi import FastAPI
from fastapi_health import health
from .api import setup_graphql_router, AppContext
from .answer import SelfSetupAnswerer
from config import settings
import logging
from .load_models import ModelFilesDownloader

if settings['DEBUG_LOG']:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

logging.info(f'App version: {settings["APP_VERSION"]}')

IS_DEVELOPMENT = settings['IS_DEVELOPMENT']
PORT = settings['SERVER_PORT']
CACHE_FOLDER = settings['CACHE_FOLDER']
TOKENIZER_URL = settings['TOKENIZER_URL']
MODEL_URL = settings['MODEL_URL']

def is_live():
    return {"started": True}

answerer = None

def is_answerer_ready():
    if answerer is None:
        return False

    if not answerer.is_ready():
        return False

    return {"answerer": True}

context = AppContext()

def startup():
    global answerer
    global context

    downloader = ModelFilesDownloader()
    tokenizer_filename, model_filename = downloader.load_models(
        cache_dir = CACHE_FOLDER,
        tokenizer_url = TOKENIZER_URL,
        model_url = MODEL_URL
    )

    answerer = SelfSetupAnswerer(
        model_filename = model_filename, 
        tokenizer_filename = tokenizer_filename
    )
    context.set_answerer(answerer)

if __name__=="__main__":
    app = FastAPI(port=PORT)
    
    app.add_api_route("/is-live", health([is_live]))
    app.add_api_route("/is-ready", health([is_answerer_ready]))

    app.include_router(setup_graphql_router(context))

    startup() # TODO: make it async

    uvicorn.run(app, host='0.0.0.0', port=PORT, reload=IS_DEVELOPMENT, debug=IS_DEVELOPMENT)
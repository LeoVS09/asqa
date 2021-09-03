 
#!/usr/bin/env bash

.PHONY: setup start docker-console console install attach-console save-dependencies

# ---------------------------------------------------------------------------------------------------------------------
# PRODUCTION
# ---------------------------------------------------------------------------------------------------------------------

start:
	python -m src.main


# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

pack:
	python -m src.pack

dev:
	bentoml serve AnswerService:latest --port=${SERVER_PORT} --yatai-url=${YATAI_URL}

pull-latest:
	bentoml retrieve AnswerService:latest --target_dir="/bentoml/service/latest" --yatai-url=${YATAI_URL}

get-latest:
	bentoml get AnswerService:latest --yatai-url=${YATAI_URL} --print-location

install: 
	pip install -r requirements.txt

save-dependencies:
	pip freeze > requirements.txt
	pip freeze | sed 's/==.*//g' > requirements-unfized.txt

list-models:
	bentoml list --yatai-url=${YATAI_URL}

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

chmod:
	chmod -R 777 .

# --------------------------------------------------- TESTS --------------------------------------------------------------- 

test: 
	pytest

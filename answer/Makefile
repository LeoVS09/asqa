 
#!/usr/bin/env bash

.PHONY: setup start docker-console console install attach-console save-dependencies

# ---------------------------------------------------------------------------------------------------------------------
# PRODUCTION
# ---------------------------------------------------------------------------------------------------------------------

start:
	bentoml serve-gunicorn ${MODEL_NAME} --yatai-url=${YATAI_URL}


# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

pack:
	python -m src.pack

pack-and-push:
	USE_YATAI=True python -m src.pack

dev: pack
	bentoml serve AnswerService:latest

pull-latest:
	bentoml retrieve AnswerService:latest --target_dir="/bentoml/service/latest" --yatai-url=${YATAI_URL}

get-latest:
	bentoml get AnswerService:latest --print-location

install: 
	pip install -r requirements.txt

save-dependencies:
	pip freeze > requirements.txt
	pip freeze | sed 's/==.*//g' > requirements-unfized.txt

list-models:
	bentoml list --yatai-url=${YATAI_URL}

# Install not working in dockerfile :(
bentoml-completion:
	bentoml install-completion

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

chmod:
	chmod -R 777 .

# --------------------------------------------------- TESTS --------------------------------------------------------------- 

unit-test: 
	pytest --snapshot-update

integration-test: pack
	bentoml run AnswerService:latest predict --input-file './input.json'

test: unit-test integration-test
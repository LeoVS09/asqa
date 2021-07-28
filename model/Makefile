#!/usr/bin/env make

# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

# Will reproduce all stages to generate model based on changes
default:
	dvc repro && dvc push

# Will load data and models which specifaed by dvc files
checkout:
	dvc pull

# Will start notebook environment on http://0.0.0.0:8890
notebook: 
	jupyter notebook --ip=0.0.0.0 --allow-root --port=8890


install:
	pip install -r requirements.txt

# Will save all current dependencies to requirements.txt
save-dependencies:
	pip freeze > requirements.txt
	pip freeze | sed 's/==.*//g' > requirements-unfized.txt

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

CURRENT_UID := $(shell id -u)
CURRENT_GID := $(shell id -g)


chmod:
	chmod -R 777 .
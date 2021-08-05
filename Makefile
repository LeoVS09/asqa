#!/usr/bin/env make

.PHONY: start default notebook attach-console chmod gpu-monitor search-notebook

default: start

# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

# Will start in docker develoment environment
notebook:
	docker-compose run --service-ports model-notebook

# Will start docker development environment for search lambda
search-notebook:
	docker-compose run --service-ports search

attach-console:
	docker exec -it asqa_model-notebook_1 bash

attach-search-console:
	docker exec -it asqa_search_dev_1 bash

chmod:
	chmod -R 777 .

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

start:
	docker-compose up --build

# ---------------------------------------------------------------------------------------------------------------------
# GPU
# ---------------------------------------------------------------------------------------------------------------------

gpu-monitor:
	watch -n 0.5 nvidia-smi
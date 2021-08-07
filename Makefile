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
search:
	docker-compose run --service-ports search

search-console:
	docker-compose run --service-ports search bash

answer:
	docker-compose run --service-ports answer

answer-console:
	docker-compose run --service-ports answer bash

attach-console:
	docker exec -it asqa_model-notebook_1 bash

attach-search-console:
	docker exec -it asqa_search_dev bash

attach-answer-console:
	docker exec -it asqa_answer_dev bash

platform-gateway:
	docker-compose up platform-gateway

core:
	docker-compose up core

core-console:
	docker-compose run --service-ports core bash

attach-core-console:
	docker exec -it asqa_core_run_a94722544b08 bash


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
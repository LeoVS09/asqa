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

a2g-console:
	docker-compose run --service-ports answer2gql bash

platform-gateway-console:
	docker-compose run --service-ports platform-gateway sh

attach-core-console:
	docker exec -it asqa_core_run_9655390d68b8 bash

telegram:
	docker-compose up telegram_integration

telegram-console:
	docker-compose run --service-ports telegram_integration bash

chmod:
	chmod -R 777 .

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

start:
	docker-compose up --build


# ---------------------------------------------------------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------------------------------------------------------
# TODO: move to some CI/CD automation

# read .env $ set -o allexport; source .env; set +o allexport

AWS_REGION = eu-central-1
AWS_ACCOUNT_ID = 449682673987

ANSWER_VERSION = 0.2.4
ANSWER2GQL_VERSION = 0.1.1
CORE_VERSION = 0.1.2
TELEGRAM_INTEGRATION_VERSION = 0.1.0

login-aws:
	aws configure

login-docker-to-aws:
	aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
# after login run cat ~/.docker/config.json to see credentials

add-aws-ecr-to-k8s:
	kubectl create secret generic regcred \
		--from-file=.dockerconfigjson=/home/leovs09/.docker/config.json \
		--type=kubernetes.io/dockerconfigjson

build-core:
	docker build -t asqa-core:${CORE_VERSION} ./core

deploy-core:
	docker tag asqa-core:${CORE_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-core:${CORE_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-core:${CORE_VERSION}

build-telegram:
	docker build -t asqa-telegram-integration:${TELEGRAM_INTEGRATION_VERSION} ./integrations/telegram

deploy-telegram:
	docker tag asqa-telegram-integration:${TELEGRAM_INTEGRATION_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-telegram-integration:${TELEGRAM_INTEGRATION_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-telegram-integration:${TELEGRAM_INTEGRATION_VERSION}

build-a2g:
	docker build -t leovs09/asqa-answer2gql:${ANSWER2GQL_VERSION} ./answer2gql

push-a2g:
	docker push leovs09/asqa-answer2gql:${ANSWER2GQL_VERSION}


# TODO: use argo-cd for automatically setup kafka
setup-kafka-for-k8s:
	kubectl apply -f ./manifests/kafka.yaml

# ---------------------------------------------------------------------------------------------------------------------
# PRODUCTION MODEL SERVICE
# ---------------------------------------------------------------------------------------------------------------------

build-production-answer:
	docker build -t leovs09/asqa-answer:${ANSWER_VERSION} ./answer/production

run-production-answer:
	docker run -it \
		-v ${PWD}/data/answer/production/bentoml:/home/bentoml \
		-p 5000:5000 \
		--network="asqa_default" \
		-e MODEL_NAME=AnswerService:latest \
		-e YATAI_URL=model-registry-manager:50051 \
		leovs09/asqa-answer:${ANSWER_VERSION}

push-production-answer:
	docker push leovs09/asqa-answer:${ANSWER_VERSION}

# ---------------------------------------------------------------------------------------------------------------------
# GPU
# ---------------------------------------------------------------------------------------------------------------------

gpu-monitor:
	watch -n 0.5 nvidia-smi

# ---------------------------------------------------------------------------------------------------------------------
# KUSTOMIZE
# ---------------------------------------------------------------------------------------------------------------------

k-prod:
	kustomize build ./manifests/overlays/production > ./manifests/overlays/production/tml_prod.yaml

k-answer-version:
	cd ./manifests/overlays/production && \
	kustomize edit set image leovs09/asqa-answer:${ANSWER_VERSION} && \
	kustomize edit set image leovs09/asqa-answer2gql:${ANSWER2GQL_VERSION}

# ---------------------------------------------------------------------------------------------------------------------
# MODELS DATA
# ---------------------------------------------------------------------------------------------------------------------

archive-search-models:
	tar -czvf ./search-data/transfromers-bert-auto-tokenaizer-1.0.1.tar.gz -C ./search-data/transfromers-bert-auto-tokenaizer-1.0.1 .
	tar -czvf ./search-data/transformers-bert-embeder-auto-model-1.0.1.tar.gz -C ./search-data/transformers-bert-embeder-auto-model-1.0.1 .
	tar -czvf ./search-data/scann262144x1_wiki40b_num_17553713_brute_force-index-1.0.1.tar.gz -C ./search-data/scann262144x1_wiki40b_num_17553713_brute_force-index-1.0.1 .

push-search-models:
	aws s3 cp ./search-data/transfromers-bert-auto-tokenaizer-1.0.1.tar.gz s3://asqa-search-models/tokenizer/transfromers-bert-auto-tokenaizer-1.0.1.tar.gz
	aws s3 cp ./search-data/transformers-bert-embeder-auto-model-1.0.1.tar.gz s3://asqa-search-models/embeder/transformers-bert-embeder-auto-model-1.0.1.tar.gz
	aws s3 cp ./search-data/scann262144x1_wiki40b_num_17553713_brute_force-index-1.0.1.tar.gz s3://asqa-search-models/index/scann262144x1_wiki40b_num_17553713_brute_force-index-1.0.1.tar.gz

archive-answer-models:
	tar -czvf ./answer-data/transformers-bert-auto-tokenizer-1.0.0.tar.gz -C ./answer-data/transformers-bert-auto-tokenizer-1.0.0 .
	tar -czvf ./answer-data/transformers-bert-auto-model-for-seq2seq-lm-1.0.0.tar.gz -C ./answer-data/transformers-bert-auto-model-for-seq2seq-lm-1.0.0 .

push-answer-models:
	aws s3 cp ./answer-data/transformers-bert-auto-tokenizer-1.0.0.tar.gz s3://asqa-answer-models/tokenizer/transformers-bert-auto-tokenizer-1.0.0.tar.gz
	aws s3 cp ./answer-data/transformers-bert-auto-model-for-seq2seq-lm-1.0.0.tar.gz s3://asqa-answer-models/model/transformers-bert-auto-model-for-seq2seq-lm-1.0.0.tar.gz



 
#!/usr/bin/env bash

.PHONY: setup start docker-console console install attach-console save-dependencies

# ---------------------------------------------------------------------------------------------------------------------
# SETUP
# ---------------------------------------------------------------------------------------------------------------------

setup:
	./setup-env.sh

# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------


# Will start notebook environment on http://0.0.0.0:8895
notebook: 
	jupyter notebook --ip=0.0.0.0 --NotebookApp.allow_origin='https://colab.research.google.com' --allow-root --port=8895 --NotebookApp.port_retries=0


install: 
	pip install -r dev.requirements.txt

save-dependencies:
	pip freeze > dev.requirements.txt
	pip freeze | sed 's/==.*//g' > dev.requirements-unfized.txt

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

chmod:
	chmod -R 777 .

# ---------------------------------------------------------------------------------------------------------------------
# SERVERLESS
# ---------------------------------------------------------------------------------------------------------------------

# Macros to get arguments passed to make command
args = $(filter-out $@,$(MAKECMDGOALS))

# Redeploy entire stack throught cloud function
# Example: make deploy
# Example with stage: make deploy --stage prod
deploy: 
	serverless deploy $(call args)

login: 
	serverless login

# Redeploy only the code + dependencies to update the AWS lambda function
# Faster then full deploy
# example: deploy-fn hello
deploy-fn:
	sls deploy function -f $(call args)

# View logs of hello function and tail via -t flag
# example: make logs hello
logs:
	serverless logs -t -f $(call args)

# Will create function with name `functionName` in `./api/index.js` file and 
# a Javascript function `module.exports.handler` as the entrypoint for the Lambda function
# and add test for them to `test/functionName.js` file
create-function-example: 
	sls create function -f functionName  --handler api/index.handler

create:
	sls create test -f ${FN} --handler ${HANDL}

# ----------------------------------------------------- INVOKE ---------------------------------------------------------

# Invoke the Lambda directly and print log statements via
# Example: make invoke hello
invoke:
	serverless invoke --log --function=$(call args) 

# Invoke functioon localy
# Example: make local hello
local:
	serverless invoke local --log --function=$(call args)

# Unforrtunately we cannot push all enviroment variables to function only by key=value pairs after '-e' paramet
# Example: make local-env hello
local-env:
	. ./dev.env && serverless invoke local --log -e SECRET_FUNCTION_TOKEN="$$SECRET_FUNCTION_TOKEN" --function=$(call args)

# --------------------------------------------------- TESTS --------------------------------------------------------------- 

test: 
	pytest

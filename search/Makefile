 
#!/usr/bin/env bash

.PHONY: setup start docker-console console install attach-console save-dependencies

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

# --------------------------------------------------- TESTS --------------------------------------------------------------- 

test: 
	pytest

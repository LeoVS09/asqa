# Asqa / Answer

Service which can answer on questions by given context, based on DNN.

## Technology References

* [DPR](https://arxiv.org/abs/2004.04906) - Dense Passage Retrieval for Open-Domain Question Answering. NN for indexing (embeding) and search
* [REALM](https://arxiv.org/abs/2002.08909) - Simular to DPR, but have few limitation, which not was allow use for this solution.

### Quick Start

Create enviroment and start server

```bash
# In upper folder start console 
make answer-console

# Start development server
make dev
```

And now you can open GraphiQL enviroment

## API routes

Web API service provide graphql and rest endoints

* <http://localhost:8894/redoc> - rest api docs
* <http://localhost:8894/docs> - alternative rest api docs
* <http://localhost:8894/graphql> - graphql playground

### In docker isolated linux development

This bootstrap allow (but not require) develop all code inside docker container

This will achive you prevent problems:

* If you develop on windows, but want use linux enviromnt in production, you can develop in linux container
* If you not want install all required tool and packages in global enviroment you machine you can use predefinet container
* If multiple new team members will work on you package you not need to explain what need to install on their machines

Start docker container, sync all local files, get console inside

```bash
make search-notebook # will start notebook

docker exec -it <container_name> bash # will attach current console to running container
```

### Configuration

You can add `.env` file and all variables will be loaded into your enviroment, default values you can set in `setting.yaml`.

```yml
# setting.yaml
GRAPHQL_DEBUG: true
```

Enviroment variables, in `.env` also, override `settings.yaml`

```.env
GRAPHQL_DEBUG = false
```

## Tests

For run unit test powered by `pytest`, simply run

```bash
make test
```

## Deploy image

For start server in cloud need deploy image in AWS ECR

```bash
# Firstly get your AWS ACCOUNT ID 
aws sts get-caller-identity

# Login docker
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

# Build image locally
docker build -t asqa-answer:0.1.0 .

# Tag image relative to your account
docker tag asqa-answer:0.1.0 <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<my-repository>:<tag>

# Push image
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<my-repository>:<tag>
```

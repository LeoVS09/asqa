# Asqa / Search

Search engine based on NN for Asqa solution.

## Technology References

* [DPR](https://arxiv.org/abs/2004.04906) - Dense Passage Retrieval for Open-Domain Question Answering. NN for indexing (embeding) and search
* [REALM](https://arxiv.org/abs/2002.08909) - Simular to DPR, but have few limitation, which not was allow use for this solution.

### Quick Start

Just go step by step and you will deploy you function to AWS

```bash
# Genereta enviroment template
make setup

# Write you secrets to '.env.local' file
# and load enviroment variables
set -o allexport; source ./.env.local; set +o allexport

# Then deploy you function to AWS, run on local machine console, not in docker
serverless deploy
```

### Setup local enviroment

This command will generate configuration enviroment `.env.local` file which will be used by docker and serveless

```bash
make setup
```

### In docker isolated linux development

This bootstrap allow (but not require) develop all code inside docker container

This will achive you prevent problems:

* If you develop on windows, but want use linux enviromnt in production, you can develop in linux container
* If you not want install all required tool and packages in global enviroment you machine you can use predefinet container
* If multiple new team members will work on you package you not need to explain what need to install on their machines

Start docker container, sync all local files, get console inside

```bash
make start # will start notebook

make attach-console # will attach current console to running container
```

### Deploy you serverless functions

Commands to deploy you function

>Note login to serverless when deploy first time
Deploy to aws cloud by serverless

```bash
serverless deploy
```

Login to serverless

```bash
serverless login
```

### Dependencies

For manage dependencies used custom lambda docker image. Image loads dependencies from `requirements.txt` and deploy to AWS ECR image registry.

### Create new function

You can create new function by `sls create` command

This command will generate for you new handler file, add new function to `serverless.yml` config and add intial test

```bash
sls create function -f newFunction --handler api/functionc/index 
```

### Create S3 Bucket

**Serverless will create S3 bucket by self**, by specified resouce configuration, but you also can use

```bash
aws s3api create-bucket --bucket neural-networks-model-example --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1
```

### Serverless tips

You can deploy faster by update only codee and dependencies of individual function
Example for `hello` function

```bash
sls deploy function -f hello
```

Get logs of deployed `hello` function

```bash
serverless logs -t -f hello
```

Invoke function in cloud and print their log

```bash
serverless invoke --log --function=hello
```

Invoke function locally and print logs

```bash
serverless invoke local --log --function=hello
```

### Enviroment variables

You can add `.env` file and all variables will be loaded into your lambdas, also you can reference them in config.

```yml
# serverless.yaml
  SECRET_FUNCTION_TOKEN: ${env:SECRET_FUNCTION_TOKEN}
```

## Tests

For run unit test powered by `pytest` and `moto`, simply run

```bash
make test
```

After successful deployment, you can test your service remotely by using the following command:

```bash
sls invoke --function hello
```

### Auto-scaling

Different providers have different limitations.

#### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).

## Not in Docker

For run dpleoy not in docker run this

```bash
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are now available for serverless to use
serverless deploy

# 'export' command is valid only for unix shells. In Windows - use 'set' instead of 'export'
```

## References

* Bootstrap based on two articles how to use model in serverless [newer](https://towardsdatascience.com/serverless-bert-with-huggingface-and-aws-lambda-625193c6cc04) and [older](https://www.philschmid.de/scaling-machine-learning-from-zero-to-hero). Also [notebook](https://colab.research.google.com/drive/1eyVi8tkCr7N-sE-yyhDB_lduowp1EZ78?usp=sharing#scrollTo=pUdW5bwb1qre) for pack model and [example repo](https://github.com/philschmid/serverless-bert-with-huggingface-aws-lambda). Thanks [Philipp Schmid](https://github.com/philschmid) for his work.

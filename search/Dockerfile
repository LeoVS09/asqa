FROM tensorflow/tensorflow:2.5.0 as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

WORKDIR /app 

FROM base as data

COPY --from=449682673987.dkr.ecr.eu-central-1.amazonaws.com/asqa-search:0.3.0-data /app/data /app/data

FROM data as dependencies

COPY requirements.txt /app/

RUN pip3 install -r requirements.txt

FROM dependencies

COPY config.* schema.* settings.* Makefile /app/

COPY ./src /app/src

CMD [ "make", "start" ]


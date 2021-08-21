FROM 449682673987.dkr.ecr.eu-central-1.amazonaws.com/asqa-search:0.4.0-data as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

WORKDIR /app 

FROM base as dependencies

COPY requirements.txt /app/

RUN pip3 install -r requirements.txt

FROM dependencies

COPY config.* schema.* settings.* Makefile /app/

COPY ./src /app/src

CMD [ "make", "start" ]


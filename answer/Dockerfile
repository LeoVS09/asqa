FROM tensorflow/tensorflow:2.5.0 as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

WORKDIR /app 

FROM base as second

COPY requirements.txt /app/

RUN pip3 install -r requirements.txt

FROM second

COPY . /app

CMD [ "make", "start" ]


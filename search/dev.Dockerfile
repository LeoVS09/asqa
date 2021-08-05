FROM tensorflow/tensorflow:2.5.0 as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

WORKDIR /app 

FROM base as second

COPY dev.requirements.txt /app/

RUN pip3 install -r dev.requirements.txt

RUN jupyter contrib nbextension install --user && \
    jupyter nbextension enable autoscroll/main && \
    jupyter serverextension enable --py jupyter_http_over_ws

FROM second

COPY . /app

CMD [ "make", "notebook" ]


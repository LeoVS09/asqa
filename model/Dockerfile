FROM tensorflow/tensorflow:2.5.0-gpu as base

RUN apt update && \
    apt install -y make git

FROM base as second

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

FROM second

RUN jupyter contrib nbextension install --user && \
    jupyter nbextension enable autoscroll/main && \
    jupyter serverextension enable --py jupyter_http_over_ws

WORKDIR /work

COPY . /work

CMD [ "make", "notebook" ]
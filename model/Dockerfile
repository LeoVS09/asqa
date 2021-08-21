FROM tensorflow/tensorflow:2.5.0-gpu as base

RUN apt update && \
    apt install -y make git wget

WORKDIR /work

FROM base as second

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

FROM second

COPY datasets datasets
COPY load_datasets.py load_datasets.py

RUN python load_datasets.py

RUN jupyter contrib nbextension install --user && \
    jupyter nbextension enable autoscroll/main && \
    jupyter serverextension enable --py jupyter_http_over_ws


CMD [ "make", "notebook" ]
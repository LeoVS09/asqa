FROM public.ecr.aws/lambda/python:3.8 AS base

COPY requirements.txt ./

RUN pip3 install -r requirements.txt

FROM base

COPY handler.py ./

COPY src ./src/

CMD ["handler.search_passages"]

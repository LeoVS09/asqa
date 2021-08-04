FROM public.ecr.aws/lambda/python:3.8 AS base

COPY requirements.txt ./

RUN pip3 install -r requirements.txt

FROM base

COPY ./trained_model/*.json ./trained_model/*.txt ./trained_model/

COPY handler.py ./

COPY src ./src/

CMD ["handler.predict_answer"]

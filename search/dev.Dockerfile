FROM tensorflow/tensorflow:2.5.0-gpu as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs

RUN npm i -g serverless

## Install aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    echo "Run aws configure for login"

WORKDIR /app 

COPY package.json package-lock.json /app/
RUN npm i

FROM base as second

RUN pip3 install torch==1.9.0+cu111 torchvision==0.10.0+cu111 torchaudio==0.9.0 -f https://download.pytorch.org/whl/torch_stable.html

COPY dev.requirements.txt /app/

RUN pip3 install -r dev.requirements.txt

RUN jupyter contrib nbextension install --user && \
    jupyter nbextension enable autoscroll/main && \
    jupyter serverextension enable --py jupyter_http_over_ws

FROM second

COPY . /app

CMD [ "make", "notebook" ]


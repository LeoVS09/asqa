import boto3
from moto import mock_s3
import os
import pytest


from handler import hello, save_s3_model

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"

@pytest.fixture
def s3_client(aws_credentials):
    with mock_s3():
        conn = boto3.client("s3", region_name="us-east-1")
        yield conn

@pytest.fixture
def bucket_name():
    return "python-botstrap-example-bucket"


@pytest.fixture
def s3_test(s3_client, bucket_name):
    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    s3_client.create_bucket(Bucket=bucket_name)
    yield

def test_hello():
    assert hello({}, '')['statusCode'] == 200

def test_save_s3_model(s3_client, s3_test):

    save_s3_model({'name': 'steve', 'value': 'is awesome'}, '')

    body = s3_client.get_object(Bucket='python-botstrap-example-bucket', Key='steve')['Body'].read().decode("utf-8")

    assert body == 'is awesome'
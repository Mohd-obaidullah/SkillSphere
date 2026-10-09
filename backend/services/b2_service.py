import boto3
from botocore.exceptions import ClientError
from flask import current_app

def get_b2_client():
    if not current_app.config.get('B2_KEY_ID'):
        return None
    return boto3.client(
        service_name='s3',
        endpoint_url=current_app.config.get('B2_S3_ENDPOINT'),
        aws_access_key_id=current_app.config.get('B2_KEY_ID'),
        aws_secret_access_key=current_app.config.get('B2_APPLICATION_KEY')
    )

def upload_to_b2(file_bytes, key, content_type):
    s3 = get_b2_client()
    if not s3:
        return False, "B2 client not configured. Missing B2_KEY_ID or B2_APPLICATION_KEY."
        
    bucket = current_app.config.get('B2_BUCKET_NAME')
    if not bucket:
        return False, "B2_BUCKET_NAME is not configured."
    if not current_app.config.get('B2_S3_ENDPOINT'):
        return False, "B2_S3_ENDPOINT is not configured."
    try:
        s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=file_bytes,
            ContentType=content_type
        )
        return True, key
    except ClientError as e:
        return False, f"B2 upload failed due to a cloud provider error: {e.response['Error']['Code']}"
    except Exception as e:
        return False, f"B2 upload failed: {str(e)}"

def get_b2_url(key):
    # Presigned URL could be generated here, or public URL depending on bucket visibility
    endpoint = current_app.config.get('B2_S3_ENDPOINT')
    bucket = current_app.config.get('B2_BUCKET_NAME')
    if not endpoint or not bucket: return ""
    return f"{endpoint}/{bucket}/{key}"

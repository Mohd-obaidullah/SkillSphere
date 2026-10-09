import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret_key')
    MONGO_URI = os.getenv('MONGO_URI', '')
    DB_NAME = os.getenv('DB_NAME', 'skillsphere')
    
    # B2
    B2_S3_ENDPOINT = os.getenv('B2_S3_ENDPOINT')
    B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')
    B2_KEY_ID = os.getenv('B2_KEY_ID')
    B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
    B2_REGION = os.getenv('B2_REGION')
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

    # AI
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

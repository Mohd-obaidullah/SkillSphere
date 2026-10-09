import cloudinary
import cloudinary.uploader
from flask import current_app

def setup_cloudinary():
    if not current_app.config.get('CLOUDINARY_CLOUD_NAME'):
        return False
    cloudinary.config(
        cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key = current_app.config.get('CLOUDINARY_API_KEY'),
        api_secret = current_app.config.get('CLOUDINARY_API_SECRET'),
        secure = True
    )
    return True

def upload_to_cloudinary(file_bytes, folder="skillsphere"):
    if not setup_cloudinary():
        return False, "Cloudinary not configured"
    
    try:
        result = cloudinary.uploader.upload(file_bytes, folder=folder)
        return True, result
    except Exception as e:
        return False, str(e)

from app.main import app as fastapi_app

# Expose FastAPI instance as the serverless function entry
app = fastapi_app
from pydantic import BaseModel, Field
class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google OAuth ID Token sent from frontend")

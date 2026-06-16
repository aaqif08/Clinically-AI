from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from models.database import engine, Base
from models.patient import Patient, Visit

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClinicallyAI",
    description="AI-powered clinical intelligence platform for all patients",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def health_check():
    return {"status": "ClinicallyAI is running", "version": "2.0.0 - General Clinical Intelligence"}

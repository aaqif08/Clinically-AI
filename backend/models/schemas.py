from pydantic import BaseModel
from typing import Optional

class AnalyzeRequest(BaseModel):
    patient_id: str
    visit_date: str
    clinical_text: str

class DischargeRiskRequest(BaseModel):
    patient_id: str
    discharge_note: str

class DiabetesIndicators(BaseModel):
    hba1c: Optional[str] = None
    fasting_glucose: Optional[str] = None
    postprandial_glucose: Optional[str] = None
    medications: list[str] = []
    complications: list[str] = []
    comorbidities: list[str] = []
    diet_compliance: Optional[str] = None
    insulin_details: Optional[str] = None
    risk_flags: list[str] = []
    doctor_recommendations: list[str] = []

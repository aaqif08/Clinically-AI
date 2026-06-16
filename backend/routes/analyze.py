from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from models.schemas import AnalyzeRequest, DischargeRiskRequest
from models.database import get_db
from services.claude_service import extract_clinical_indicators, extract_clinical_indicators_sync, assess_discharge_risk
from services.patient_service import save_visit, get_patient_history, get_risk_trend
import traceback
import json

router = APIRouter()

def clean_json(raw: str) -> dict:
    cleaned = raw.strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start != -1 and end > start:
        cleaned = cleaned[start:end]
    return json.loads(cleaned)

@router.post("/analyze")
async def analyze_clinical_note(request: AnalyzeRequest):
    def stream_generator():
        for chunk in extract_clinical_indicators(request.clinical_text):
            yield chunk
    return StreamingResponse(stream_generator(), media_type="text/plain")

@router.post("/analyze-sync")
async def analyze_clinical_note_sync(request: AnalyzeRequest, db: Session = Depends(get_db)):
    try:
        raw_result = extract_clinical_indicators_sync(request.clinical_text)
        extracted = clean_json(raw_result)
        visit = save_visit(
            db=db,
            patient_id=request.patient_id,
            visit_date=request.visit_date,
            clinical_text=request.clinical_text,
            extracted=extracted
        )
        return {
            "visit_id": visit.id,
            "patient_id": request.patient_id,
            "visit_date": request.visit_date,
            "extracted": extracted
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@router.post("/discharge-risk")
async def discharge_risk(request: DischargeRiskRequest, db: Session = Depends(get_db)):
    try:
        visits = get_patient_history(db, request.patient_id)
        if not visits:
            return JSONResponse(status_code=404, content={"error": "No visit history found for this patient"})

        history_summary = ""
        for i, v in enumerate(visits):
            history_summary += f"Visit {i+1} ({v.visit_date}): Diagnosis={v.primary_diagnosis}, Risk={v.risk_level}, Score={v.risk_score}, Medications={v.medications}, Comorbidities={v.comorbidities}, Flags={v.risk_flags}\n"

        raw_result = assess_discharge_risk(request.discharge_note, history_summary)
        result = clean_json(raw_result)
        return {"patient_id": request.patient_id, "discharge_risk": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@router.get("/patient/{patient_id}/history")
async def patient_history(patient_id: str, db: Session = Depends(get_db)):
    visits = get_patient_history(db, patient_id)
    return {
        "patient_id": patient_id,
        "total_visits": len(visits),
        "visits": [{
            "visit_id": v.id,
            "visit_date": v.visit_date,
            "department": v.department,
            "primary_diagnosis": v.primary_diagnosis,
            "risk_level": v.risk_level,
            "risk_score": v.risk_score,
            "medications": v.medications,
            "comorbidities": v.comorbidities,
            "risk_flags": v.risk_flags,
            "doctor_recommendations": v.doctor_recommendations,
            "extracted_data": v.extracted_data
        } for v in visits]
    }

@router.get("/patient/{patient_id}/risk-trend")
async def risk_trend(patient_id: str, db: Session = Depends(get_db)):
    trend = get_risk_trend(db, patient_id)
    return {"patient_id": patient_id, "risk_trend": trend}

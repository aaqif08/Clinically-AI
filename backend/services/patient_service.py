from sqlalchemy.orm import Session
from models.patient import Patient, Visit
import uuid

def ensure_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value]
    return []

def save_visit(db: Session, patient_id: str, visit_date: str, clinical_text: str, extracted: dict):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = Patient(patient_id=patient_id)
        db.add(patient)

    visit = Visit(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        visit_date=visit_date,
        clinical_text=clinical_text,
        department=extracted.get('department'),
        primary_diagnosis=extracted.get('primary_diagnosis'),
        risk_level=extracted.get('risk_level'),
        risk_score=extracted.get('risk_score'),
        medications=ensure_list(extracted.get('medications')),
        comorbidities=ensure_list(extracted.get('comorbidities')),
        risk_flags=ensure_list(extracted.get('risk_flags')),
        doctor_recommendations=ensure_list(extracted.get('doctor_recommendations')),
        extracted_data=extracted
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit

def get_patient_history(db: Session, patient_id: str):
    return db.query(Visit).filter(
        Visit.patient_id == patient_id
    ).order_by(Visit.visit_date.asc()).all()

def get_risk_trend(db: Session, patient_id: str):
    visits = db.query(Visit).filter(
        Visit.patient_id == patient_id,
        Visit.risk_level.isnot(None)
    ).order_by(Visit.visit_date.asc()).all()

    risk_order = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4}
    return [{
        "visit_date": v.visit_date,
        "primary_diagnosis": v.primary_diagnosis,
        "risk_level": v.risk_level,
        "risk_score": v.risk_score,
        "risk_order": risk_order.get(v.risk_level, 0)
    } for v in visits]

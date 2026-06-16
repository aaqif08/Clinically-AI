from sqlalchemy import Column, String, DateTime, JSON, Float, Text
from sqlalchemy.sql import func
from models.database import Base

class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    age = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Visit(Base):
    __tablename__ = "visits"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    visit_date = Column(String)
    clinical_text = Column(Text)

    # Core queryable columns
    department = Column(String, nullable=True)
    primary_diagnosis = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)
    medications = Column(JSON, nullable=True)
    comorbidities = Column(JSON, nullable=True)
    risk_flags = Column(JSON, nullable=True)
    doctor_recommendations = Column(JSON, nullable=True)

    # Flexible JSON for all extracted fields
    extracted_data = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

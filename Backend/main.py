from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time
import json
from sqlalchemy.orm import Session
from fastapi import Depends
import os

import models
from database import engine, get_db

# Create database tables based on models
models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Dr. Kajal Patil - Healthcare API",
    description="Backend API for Dr. Kajal Patil's healthcare website",
    version="1.0.0"
)

# CORS middleware for frontend dev server
frontend_urls = os.getenv("FRONTEND_URLS", "http://localhost:5173,http://localhost:3000")
origins = [url.strip() for url in frontend_urls.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class AppointmentRequest(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = None
    preferred_date: str
    preferred_time: str
    reason: str
    language_preference: str = "English"


class AppointmentResponse(BaseModel):
    success: bool
    message: str
    appointment_id: str


class PrescriptionResponse(BaseModel):
    success: bool
    prescription_id: str
    patient_name: str
    date: str
    doctor: str
    medications: list
    notes: str


# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "Dr. Kajal Patil Healthcare API", "status": "running"}


@app.post("/api/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentRequest, db: Session = Depends(get_db)):
    """
    Receive and process appointment booking requests.
    Saves the appointment and patient details to the database.
    """
    import hashlib
    import time as time_module
    from datetime import datetime
    
    # Generate a simple appointment ID
    raw = f"{appointment.name}{appointment.phone}{time_module.time()}"
    appointment_id = "APT-" + hashlib.md5(raw.encode()).hexdigest()[:8].upper()

    # Check if patient exists by phone AND name, otherwise create
    name_parts = appointment.name.split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    patient = db.query(models.Patient).filter(
        models.Patient.phone == appointment.phone,
        models.Patient.first_name == first_name,
        models.Patient.last_name == last_name
    ).first()

    if not patient:
        patient = models.Patient(
            first_name=first_name,
            last_name=last_name,
            phone=appointment.phone,
            age=appointment.age,
            gender=appointment.gender,
            email=appointment.email
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

    # Parse date and time
    try:
        scheduled_date = datetime.strptime(appointment.preferred_date, "%Y-%m-%d").date()
    except ValueError:
        scheduled_date = None

    try:
        scheduled_time = datetime.strptime(appointment.preferred_time, "%H:%M").time()
    except ValueError:
        scheduled_time = None

    # Create the appointment
    new_appointment = models.Appointment(
        appointment_id=appointment_id,
        patient_id=patient.id,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        reason=appointment.reason,
        status="BOOKED"
    )
    db.add(new_appointment)
    db.commit()

    return AppointmentResponse(
        success=True,
        message=f"Appointment booked successfully for {appointment.name} on {appointment.preferred_date} at {appointment.preferred_time}.",
        appointment_id=appointment_id,
    )


@app.get("/api/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: str, db: Session = Depends(get_db)):
    """
    Endpoint for prescription downloads from the database.
    """
    prescription = db.query(models.Prescription).filter(models.Prescription.prescription_id == prescription_id).first()
    
    if prescription:
        patient = prescription.patient
        patient_name = f"{patient.first_name} {patient.last_name}".strip()
        medications = [{"name": m.medicine_name, "dosage": m.dosage, "duration": m.duration} for m in prescription.medications]
        
        return PrescriptionResponse(
            success=True,
            prescription_id=prescription.prescription_id,
            patient_name=patient_name,
            date=prescription.created_at.strftime("%Y-%m-%d") if prescription.created_at else "",
            doctor=prescription.doctor_name or "Dr. Kajal Patil",
            medications=medications,
            notes=prescription.notes or "",
        )
    else:
        return PrescriptionResponse(
            success=False,
            prescription_id=prescription_id,
            patient_name="",
            date="",
            doctor="",
            medications=[],
            notes="Prescription not found. Please check the ID and try again.",
        )


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

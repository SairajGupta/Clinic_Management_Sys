from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time
import json
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import os

import models
import auth
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
    dob: str
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

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.post("/api/setup-admin")
def setup_admin(db: Session = Depends(get_db)):
    user_count = db.query(models.User).count()
    if user_count > 0:
        raise HTTPException(status_code=400, detail="Admin already exists")
    hashed_password = auth.get_password_hash("admin123")
    admin_user = models.User(username="admin", hashed_password=hashed_password, role=models.UserRole.ADMIN.value)
    db.add(admin_user)
    db.commit()
    return {"message": "Admin user created with username 'admin' and password 'admin123'"}

@app.get("/api/staff/me")
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "role": current_user.role}



@app.post("/api/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentRequest, db: Session = Depends(get_db)):
    """
    Receive and process appointment booking requests.
    Saves the appointment and patient details to the database.
    """
    try:
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
            try:
                dob = datetime.strptime(appointment.dob, "%d/%m/%Y").date()
            except ValueError:
                dob = None

            patient = models.Patient(
                first_name=first_name,
                last_name=last_name,
                phone=appointment.phone,
                dob=dob,
                gender=appointment.gender,
                email=appointment.email
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

        # Parse date and time
        try:
            scheduled_date = datetime.strptime(appointment.preferred_date, "%d/%m/%Y").date()
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
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create appointment: {str(e)}")


@app.get("/api/patients/by-phone")
def get_patients_by_phone(phone: str, db: Session = Depends(get_db)):
    """
    Search for patients by phone number.
    Returns a list of patient profiles.
    """
    try:
        patients = db.query(models.Patient).filter(models.Patient.phone == phone).all()
        return {
            "success": True,
            "patients": [
                {
                    "id": p.id,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "dob": p.dob.strftime("%d/%m/%Y") if p.dob else "",
                    "gender": p.gender,
                    "email": p.email
                } for p in patients
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patients: {str(e)}")


@app.get("/api/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: str, db: Session = Depends(get_db)):
    """
    Endpoint for prescription downloads from the database.
    """
    try:
        prescription = db.query(models.Prescription).filter(models.Prescription.prescription_id == prescription_id).first()
        
        if prescription:
            patient = prescription.patient
            patient_name = f"{patient.first_name} {patient.last_name}".strip()
            medications = [{"name": m.medicine_name, "dosage": m.dosage, "duration": m.duration} for m in prescription.medications]
            
            return PrescriptionResponse(
                success=True,
                prescription_id=prescription.prescription_id,
                patient_name=patient_name,
                date=prescription.created_at.strftime("%d/%m/%Y") if prescription.created_at else "",
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prescription: {str(e)}")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

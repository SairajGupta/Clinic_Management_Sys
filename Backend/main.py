from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

import models
import auth
from database import engine, get_db

# Database tables are now managed by Alembic migrations
# models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app = FastAPI(
    title="Dr. Kajal Patil - Healthcare API",
    description="Backend API for Dr. Kajal Patil's healthcare website",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

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


class MedicationRequest(BaseModel):
    medicine_name: str
    dosage: str
    duration: str

class PrescriptionRequest(BaseModel):
    appointment_id: int
    patient_id: int
    notes: str
    medications: List[MedicationRequest]


# --- Endpoints ---

@app.get("/")
def root():
    try:
        return {"message": "Dr. Kajal Patil Healthcare API", "status": "running"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/token")
@limiter.limit("5/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token = auth.create_access_token(data={"sub": user.username, "role": user.role, "name": user.name})
        return {"access_token": access_token, "token_type": "bearer", "role": user.role, "name": user.name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UserCreateRequest(BaseModel):
    username: str
    name: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    is_active: bool

class AdminUserUpdateRequest(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

@app.post("/api/admin/users")
@limiter.limit("20/minute")
def create_staff_user(
    request: Request,
    user_data: UserCreateRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Admin-only endpoint to create new staff accounts (Doctors, Receptionists).
    """
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
            
        # Validate role
        if user_data.role not in [models.UserRole.ADMIN.value, models.UserRole.RECEPTIONIST.value, models.UserRole.DOCTOR.value]:
            raise HTTPException(status_code=400, detail="Invalid role specified")
            
        hashed_password = auth.get_password_hash(user_data.password)
        new_user = models.User(username=user_data.username, name=user_data.name, hashed_password=hashed_password, role=user_data.role)
        
        db.add(new_user)
        db.commit()
        
        return {"success": True, "message": f"User {user_data.username} created successfully with role {user_data.role}"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Admin-only endpoint to list all users.
    """
    try:
        users = db.query(models.User).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/users/{user_id}")
def update_user_by_admin(
    user_id: int,
    request: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Admin-only endpoint to modify a user's name or password.
    Self-modification is prevented.
    """
    try:
        if user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Admins cannot modify their own details from this interface.")
            
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if request.name is not None:
            user.name = request.name
            
        if request.password is not None and request.password.strip():
            user.hashed_password = auth.get_password_hash(request.password)
            
        db.commit()
        return {"success": True, "message": f"User {user.username} updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/staff/me")
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    try:
        return {"username": current_user.username, "role": current_user.role}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class PasswordUpdateRequest(BaseModel):
    new_password: str

@app.put("/api/users/me/password")
def update_password(
    request: PasswordUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Endpoint for users to update their own password.
    """
    try:
        hashed_password = auth.get_password_hash(request.new_password)
        current_user.hashed_password = hashed_password
        db.commit()
        return {"success": True, "message": "Password updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/appointments", response_model=AppointmentResponse)
@limiter.limit("10/minute")
def create_appointment(request: Request, appointment: AppointmentRequest, db: Session = Depends(get_db)):
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
            raise HTTPException(status_code=400, detail="Invalid date format. Expected DD/MM/YYYY")

        try:
            # preferred_time is like "9:00 AM - 10:00 AM" or just "9:00 AM"
            start_time_str = appointment.preferred_time.split(" - ")[0]
            scheduled_time = datetime.strptime(start_time_str, "%I:%M %p").time()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid time format.")

        # Validation for past dates/times
        today = datetime.now().date()
        now_time = datetime.now().time()
        if scheduled_date < today:
            raise HTTPException(status_code=400, detail="Cannot book appointments for past dates.")
        if scheduled_date == today and scheduled_time.hour < now_time.hour:
            raise HTTPException(status_code=400, detail="Cannot book appointments for past times today.")

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
        db.refresh(new_appointment)

        message = f"Appointment booked successfully for {appointment.name} on {appointment.preferred_date} at {appointment.preferred_time}."
        
        # Token System: if it's today AND within 30 mins, check them in immediately
        if scheduled_date == today:
            appt_datetime = datetime.combine(today, scheduled_time)
            now_datetime = datetime.now()
            time_diff = appt_datetime - now_datetime
            
            if time_diff.total_seconds() <= 1800: # 30 mins
                new_appointment.status = "CHECKED_IN"
                
                # Find next token number
                max_token = db.query(func.max(models.QueueToken.token_number)).filter(
                    models.QueueToken.token_date == today
                ).scalar() or 0
                next_token_num = max_token + 1
                
                queue_token = models.QueueToken(
                    appointment_id=new_appointment.id,
                    token_number=next_token_num,
                    token_date=today,
                    sort_order=float(next_token_num),
                    check_in_time=datetime.utcnow()
                )
                db.add(queue_token)
                db.commit()
                message = f"Appointment booked and checked in! Token #{next_token_num} generated."
        return AppointmentResponse(
            success=True,
            message=message,
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

@app.get("/api/prescriptions/by-appointment/{appointment_id}", response_model=PrescriptionResponse)
def get_prescription_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    try:
        prescription = db.query(models.Prescription).filter(models.Prescription.appointment_id == appointment_id).first()
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
                prescription_id="",
                patient_name="",
                date="",
                doctor="",
                medications=[],
                notes="",
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prescription by appointment: {str(e)}")

@app.post("/api/prescriptions")
def create_prescription(
    req: PrescriptionRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    try:
        import hashlib
        import time as time_module
        
        # Verify appointment exists and belongs to patient
        appt = db.query(models.Appointment).filter(
            models.Appointment.id == req.appointment_id,
            models.Appointment.patient_id == req.patient_id
        ).first()
        
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        # Check if prescription already exists
        existing_prescription = db.query(models.Prescription).filter(
            models.Prescription.appointment_id == req.appointment_id
        ).first()
        
        if existing_prescription:
            # Overwrite existing prescription
            existing_prescription.notes = req.notes
            rx_id = existing_prescription.prescription_id
            target_id = existing_prescription.id
            
            # Delete old medications
            db.query(models.Medication).filter(models.Medication.prescription_id == target_id).delete()
            db.commit()
        else:
            # Generate unique prescription ID
            raw = f"{req.patient_id}{req.appointment_id}{time_module.time()}"
            rx_id = "RX-" + hashlib.md5(raw.encode()).hexdigest()[:6].upper()
            
            # Create Prescription
            new_prescription = models.Prescription(
                prescription_id=rx_id,
                appointment_id=req.appointment_id,
                patient_id=req.patient_id,
                doctor_name=current_user.username if current_user.role == "DOCTOR" else "Dr. Kajal Patil",
                notes=req.notes
            )
            db.add(new_prescription)
            db.commit()
            db.refresh(new_prescription)
            target_id = new_prescription.id
        
        # Add Medications
        for med in req.medications:
            new_med = models.Medication(
                prescription_id=target_id,
                medicine_name=med.medicine_name,
                dosage=med.dosage,
                duration=med.duration
            )
            db.add(new_med)
            
        db.commit()
        
        return {"success": True, "prescription_id": rx_id, "message": "Prescription created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create prescription: {str(e)}")

@app.get("/api/health")
def health_check():
    try:
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/receptionist/lookup")
def receptionist_patient_lookup(
    phone: str = None, 
    patient_id: int = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    """
    Search for patients by phone number and return their full history (appointments, prescriptions).
    """
    try:
        query = db.query(models.Patient)
        if patient_id:
            query = query.filter(models.Patient.id == patient_id)
        elif phone:
            query = query.filter(models.Patient.phone == phone)
        else:
            raise HTTPException(status_code=400, detail="Must provide phone or patient_id")
            
        patients = query.all()
        results = []
        for p in patients:
            # Format appointments
            appointments_data = []
            for appt in p.appointments:
                appointments_data.append({
                    "id": appt.id,
                    "appointment_id": appt.appointment_id,
                    "date": appt.scheduled_date.strftime("%d/%m/%Y") if appt.scheduled_date else "",
                    "time": appt.scheduled_time.strftime("%H:%M") if appt.scheduled_time else "",
                    "status": appt.status,
                    "reason": appt.reason or ""
                })
                
            # Format prescriptions
            prescriptions_data = []
            for presc in p.prescriptions:
                prescriptions_data.append({
                    "id": presc.id,
                    "prescription_id": presc.prescription_id,
                    "date": presc.created_at.strftime("%d/%m/%Y") if presc.created_at else "",
                    "doctor": presc.doctor_name or "Dr. Kajal Patil",
                    "medications_count": len(presc.medications)
                })
                
            results.append({
                "patient": {
                    "id": p.id,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "phone": p.phone,
                    "dob": p.dob.strftime("%d/%m/%Y") if p.dob else "",
                    "gender": p.gender,
                    "email": p.email
                },
                "appointments": appointments_data,
                "prescriptions": prescriptions_data
            })
            
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to lookup patient: {str(e)}")

@app.get("/api/patients/{patient_id}/history")
def get_patient_history(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    try:
        p = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Patient not found")
            
        appointments_data = []
        for appt in p.appointments:
            appointments_data.append({
                "id": appt.id,
                "appointment_id": appt.appointment_id,
                "date": appt.scheduled_date.strftime("%d/%m/%Y") if appt.scheduled_date else "",
                "time": appt.scheduled_time.strftime("%H:%M") if appt.scheduled_time else "",
                "status": appt.status,
                "reason": appt.reason or ""
            })
            
        prescriptions_data = []
        for presc in p.prescriptions:
            prescriptions_data.append({
                "id": presc.id,
                "prescription_id": presc.prescription_id,
                "date": presc.created_at.strftime("%d/%m/%Y") if presc.created_at else "",
                "doctor": presc.doctor_name or "Dr. Kajal Patil",
                "medications_count": len(presc.medications)
            })
            
        return {
            "success": True,
            "patient": {
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "phone": p.phone,
                "dob": p.dob.strftime("%d/%m/%Y") if p.dob else "",
                "gender": p.gender,
                "email": p.email
            },
            "appointments": appointments_data,
            "prescriptions": prescriptions_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient history: {str(e)}")


from datetime import timedelta

class CheckInRequest(BaseModel):
    appointment_id: int

class QueueMoveRequest(BaseModel):
    token_id: int
    after_token_id: int

class QueueStatusRequest(BaseModel):
    token_id: int
    status: str # "SERVING", "COMPLETED", "SKIPPED"

@app.get("/api/receptionist/queue")
def get_queue(db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_receptionist_or_doctor)):
    try:
        today = datetime.now().date()
        
        # 1. Fetch today's appointments
        todays_appointments = db.query(models.Appointment).filter(
            models.Appointment.scheduled_date == today
        ).all()
        
        # 2. Lazy Generation of Tokens for appointments within 30 mins
        for appt in todays_appointments:
            if appt.status == "BOOKED" and appt.scheduled_time:
                # Calculate time difference
                appt_datetime = datetime.combine(today, appt.scheduled_time)
                now_datetime = datetime.now()
                time_diff = appt_datetime - now_datetime
                
                # If appointment is in the past, or within 30 minutes, check them in
                if time_diff.total_seconds() <= 1800: # 30 mins
                    # Placeholder: Send SMS/Email reminder
                    print(f"LAZY GENERATION: Generating token for Appt {appt.id} 30 mins early.")
                    
                    appt.status = "CHECKED_IN"
                    max_token = db.query(func.max(models.QueueToken.token_number)).filter(
                        models.QueueToken.token_date == today
                    ).scalar() or 0
                    next_token_num = max_token + 1
                    
                    queue_token = models.QueueToken(
                        appointment_id=appt.id,
                        token_number=next_token_num,
                        token_date=today,
                        sort_order=float(next_token_num),
                        check_in_time=datetime.utcnow()
                    )
                    db.add(queue_token)
        db.commit()
        
        # 3. Fetch the active queue (tokens for today) ordered by sort_order
        active_tokens = db.query(models.QueueToken).filter(
            models.QueueToken.token_date == today
        ).order_by(models.QueueToken.sort_order.asc()).all()
        
        queue_data = []
        for qt in active_tokens:
            appt = qt.appointment
            patient = appt.patient
            queue_data.append({
                "token_id": qt.id,
                "token_number": qt.token_number,
                "sort_order": qt.sort_order,
                "status": appt.status,
                "patient_name": f"{patient.first_name} {patient.last_name}".strip(),
                "appointment_time": appt.scheduled_time.strftime("%H:%M") if appt.scheduled_time else "Walk-in",
                "patient_id": patient.id,
                "appointment_id": appt.id,
                "completed_at": appt.prescription.created_at.isoformat() if appt.prescription and appt.prescription.created_at else None
            })
            
        # Sort queue: SERVING (0), CHECKED_IN (1), COMPLETED (2), then by sort_order
        status_priority = {"SERVING": 0, "CHECKED_IN": 1, "COMPLETED": 2}
        queue_data.sort(key=lambda x: (status_priority.get(x["status"], 3), x["sort_order"]))
            
        return {"success": True, "queue": queue_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch queue: {str(e)}")


@app.post("/api/receptionist/check-in")
def check_in_appointment(
    req: CheckInRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    try:
        appt = db.query(models.Appointment).filter(models.Appointment.id == req.appointment_id).first()
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        today = datetime.now().date()
        if appt.scheduled_date != today:
            raise HTTPException(status_code=400, detail="Can only check in appointments for today")
            
        if appt.status != "BOOKED":
            raise HTTPException(status_code=400, detail="Appointment is already checked in or completed")
            
        appt.status = "CHECKED_IN"
        max_token = db.query(func.max(models.QueueToken.token_number)).filter(
            models.QueueToken.token_date == today
        ).scalar() or 0
        next_token_num = max_token + 1
        
        queue_token = models.QueueToken(
            appointment_id=appt.id,
            token_number=next_token_num,
            token_date=today,
            sort_order=float(next_token_num),
            check_in_time=datetime.utcnow()
        )
        db.add(queue_token)
        db.commit()
        
        return {"success": True, "message": f"Checked in. Token #{next_token_num} generated.", "token_number": next_token_num}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to check in: {str(e)}")


@app.put("/api/receptionist/queue/move")
def move_queue_token(
    req: QueueMoveRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    try:
        today = datetime.now().date()
        token_to_move = db.query(models.QueueToken).filter(models.QueueToken.id == req.token_id).first()
        token_after = db.query(models.QueueToken).filter(models.QueueToken.id == req.after_token_id).first()
        
        if not token_to_move or not token_after:
            raise HTTPException(status_code=404, detail="Token not found")
            
        # Find the token immediately after `token_after` to calculate a midpoint
        next_token = db.query(models.QueueToken).filter(
            models.QueueToken.token_date == today,
            models.QueueToken.sort_order > token_after.sort_order,
            models.QueueToken.id != token_to_move.id
        ).order_by(models.QueueToken.sort_order.asc()).first()
        
        if next_token:
            new_sort_order = (token_after.sort_order + next_token.sort_order) / 2.0
        else:
            new_sort_order = token_after.sort_order + 1.0
            
        token_to_move.sort_order = new_sort_order
        db.commit()
        
        return {"success": True, "message": f"Token moved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to move token: {str(e)}")


@app.put("/api/receptionist/queue/status")
def update_queue_status(
    req: QueueStatusRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_receptionist_or_doctor)
):
    try:
        token = db.query(models.QueueToken).filter(models.QueueToken.id == req.token_id).first()
        if not token:
            raise HTTPException(status_code=404, detail="Token not found")
            
        token.appointment.status = req.status
        db.commit()
        
        return {"success": True, "message": f"Status updated to {req.status}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

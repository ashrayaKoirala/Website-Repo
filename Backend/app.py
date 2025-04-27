import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import json
from pydantic import BaseModel

from services.video_processing import (
    cut_video_with_profile, 
    remove_silence, 
    create_satisfy_montage,
    render_final_video
)
from services.ai_integration import generate_cut_profile
from services.subtitles import generate_subtitles, apply_subtitles
from services.emoji_overlay import generate_emoji_overlay

from models.database import get_db, engine
from models import models
from models.schemas import (
    TaskCreate, Task, 
    KPICreate, KPI,
    FinanceCreate, Finance,
    ContentItem, ContentItemCreate,
    WorkSession, WorkSessionCreate
)

from utils.file_storage import save_upload, get_file_path, list_files

# Initialize database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Content Creator Studio Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# --- Video Processing Endpoints ---

@app.post("/workers/cut-profile")
async def create_cut_profile(
    video: UploadFile = File(...),
    transcript: UploadFile = File(...),
):
    """Generate a cut profile using Gemini AI based on video and transcript"""
    video_path = await save_upload(video, "uploads")
    transcript_path = await save_upload(transcript, "uploads")
    
    try:
        cut_profile = await generate_cut_profile(video_path, transcript_path)
        output_path = f"outputs/cut_profile_{os.path.splitext(video.filename)[0]}.json"
        
        with open(output_path, "w") as f:
            json.dump(cut_profile, f)
            
        return {"filename": os.path.basename(output_path), "cut_profile": cut_profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cut profile: {str(e)}")

@app.post("/workers/video-cutter")
async def cut_video(
    video: UploadFile = File(...),
    cut_profile: UploadFile = File(...),
):
    """Cut video based on provided cut profile JSON"""
    video_path = await save_upload(video, "uploads")
    profile_path = await save_upload(cut_profile, "uploads")
    
    try:
        with open(profile_path, "r") as f:
            cut_data = json.load(f)
        
        output_path = await cut_video_with_profile(video_path, cut_data)
        return {"result": "success", "output_file": os.path.basename(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cutting video: {str(e)}")

@app.post("/workers/silence-remover")
async def remove_silence_endpoint(
    media: UploadFile = File(...),
    min_silence_duration: float = 0.5,
    silence_threshold: float = -40,
):
    """Remove silent parts from video or audio"""
    media_path = await save_upload(media, "uploads")
    
    try:
        output_path = await remove_silence(
            media_path, 
            min_silence_duration=min_silence_duration,
            silence_threshold=silence_threshold
        )
        return {"result": "success", "output_file": os.path.basename(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing silence: {str(e)}")

@app.post("/workers/satisfy")
async def create_satisfy_video(
    intro_clip: UploadFile = File(...),
    clips: List[UploadFile] = File(...),
    duration: int = 60,
    crossfade_duration: float = 0.5,
):
    """Create a satisfying video montage from multiple clips"""
    intro_path = await save_upload(intro_clip, "uploads")
    clip_paths = [await save_upload(clip, "uploads") for clip in clips]
    
    try:
        output_path = await create_satisfy_montage(
            intro_path,
            clip_paths,
            target_duration=duration,
            crossfade_duration=crossfade_duration
        )
        return {"result": "success", "output_file": os.path.basename(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating satisfy video: {str(e)}")

@app.post("/workers/renderer")
async def render_video(
    clips: List[UploadFile] = File(...),
    arrangement: str = None,
    intro_clip: Optional[UploadFile] = File(None),
    outro_clip: Optional[UploadFile] = File(None),
):
    """Render a final video from multiple clips with optional intro/outro"""
    clip_paths = [await save_upload(clip, "uploads") for clip in clips]
    intro_path = await save_upload(intro_clip, "uploads") if intro_clip else None
    outro_path = await save_upload(outro_clip, "uploads") if outro_clip else None
    
    # Parse arrangement if provided
    arrangement_data = json.loads(arrangement) if arrangement else None
    
    try:
        output_path = await render_final_video(
            clip_paths,
            arrangement=arrangement_data,
            intro_path=intro_path,
            outro_path=outro_path
        )
        return {"result": "success", "output_file": os.path.basename(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rendering final video: {str(e)}")

@app.post("/workers/subtitles")
async def create_subtitles(
    transcript: UploadFile = File(...),
    font_style: str = "default",
    format: str = "srt",
):
    """Generate subtitles from transcript"""
    transcript_path = await save_upload(transcript, "uploads")
    
    try:
        subtitle_path = await generate_subtitles(transcript_path, font_style, format)
        return FileResponse(
            subtitle_path,
            media_type="application/octet-stream",
            filename=os.path.basename(subtitle_path)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating subtitles: {str(e)}")

@app.post("/workers/overlay")
async def create_emoji_overlay(
    transcript: UploadFile = File(...),
    video: UploadFile = File(...),
):
    """Generate and apply emoji overlays to video based on transcript"""
    transcript_path = await save_upload(transcript, "uploads")
    video_path = await save_upload(video, "uploads")
    
    try:
        output_path = await generate_emoji_overlay(transcript_path, video_path)
        return {"result": "success", "output_file": os.path.basename(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating emoji overlay: {str(e)}")

# --- Dashboard Endpoints ---

@app.post("/dashboard/kpis", response_model=KPI)
async def create_kpi_record(kpi: KPICreate, db = Depends(get_db)):
    """Create a new KPI record"""
    db_kpi = models.KPI(**kpi.dict())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

@app.get("/dashboard/kpis", response_model=List[KPI])
async def read_kpis(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    """Get all KPI records"""
    kpis = db.query(models.KPI).offset(skip).limit(limit).all()
    return kpis

@app.post("/dashboard/finances", response_model=Finance)
async def create_finance_record(finance: FinanceCreate, db = Depends(get_db)):
    """Create a new finance record"""
    db_finance = models.Finance(**finance.dict())
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance

@app.get("/dashboard/finances", response_model=List[Finance])
async def read_finances(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    """Get all finance records"""
    finances = db.query(models.Finance).offset(skip).limit(limit).all()
    return finances

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, db = Depends(get_db)):
    """Create a new task"""
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks", response_model=List[Task])
async def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    due_filter: Optional[str] = None,
    db = Depends(get_db)
):
    """Get tasks with optional filtering"""
    query = db.query(models.Task)
    
    if due_filter == "today":
        from datetime import date
        query = query.filter(models.Task.deadline == date.today())
    elif due_filter == "week":
        from datetime import date, timedelta
        today = date.today()
        week_later = today + timedelta(days=7)
        query = query.filter(
            models.Task.deadline >= today,
            models.Task.deadline <= week_later
        )
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@app.post("/tasks/work-session", response_model=WorkSession)
async def create_work_session(session: WorkSessionCreate, db = Depends(get_db)):
    """Log a work session"""
    db_session = models.WorkSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/tasks/work-session", response_model=List[WorkSession])
async def read_work_sessions(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    """Get all work sessions"""
    sessions = db.query(models.WorkSession).offset(skip).limit(limit).all()
    return sessions

@app.post("/tasks/content", response_model=ContentItem)
async def create_content_item(content: ContentItemCreate, db = Depends(get_db)):
    """Create a new content production item"""
    db_content = models.ContentItem(**content.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@app.put("/tasks/content/{content_id}", response_model=ContentItem)
async def update_content_stage(
    content_id: int,
    stage: str,
    db = Depends(get_db)
):
    """Update the stage of a content item"""
    db_content = db.query(models.ContentItem).filter(models.ContentItem.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    valid_stages = ["Idea", "Script", "Record", "Edit", "Upload", "Analyze"]
    if stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {', '.join(valid_stages)}")
    
    db_content.stage = stage
    db.commit()
    db.refresh(db_content)
    return db_content

# --- File Management Endpoints ---

@app.get("/files")
async def list_all_files(
    file_type: Optional[str] = None
):
    """List all files in the storage"""
    files = list_files(file_type)
    return {"files": files}

@app.get("/files/{filename}")
async def get_file(filename: str):
    """Get a specific file by filename"""
    file_path = get_file_path(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=filename
    )

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

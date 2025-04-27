from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class KPI(Base):
    __tablename__ = "kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=datetime.now().date())
    platform = Column(String, index=True)
    metric_name = Column(String, index=True)
    metric_value = Column(Float)
    notes = Column(Text, nullable=True)

class Finance(Base):
    __tablename__ = "finances"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=datetime.now().date())
    category = Column(String, index=True)
    amount = Column(Float)
    is_income = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=datetime.now().date())
    name = Column(String, index=True)
    completed = Column(Boolean, default=False)
    streak = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    deadline = Column(Date, nullable=True)
    priority = Column(Integer, default=0)  # 0=Low, 1=Medium, 2=High
    status = Column(String, default="pending")  # pending, in-progress, completed
    tags = Column(String, nullable=True)  # Comma-separated tags

class WorkSession(Base):
    __tablename__ = "work_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, default=datetime.now)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    description = Column(String, nullable=True)
    
    task = relationship("Task", back_populates="work_sessions")

# Add relationship to Task
Task.work_sessions = relationship("WorkSession", back_populates="task")

class ContentItem(Base):
    __tablename__ = "content_items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)
    description = Column(Text, nullable=True)
    stage = Column(String, default="Idea")  # Idea, Script, Record, Edit, Upload, Analyze
    platform = Column(String, nullable=True)
    target_release_date = Column(Date, nullable=True)
    actual_release_date = Column(Date, nullable=True)
    associated_files = Column(Text, nullable=True)  # JSON string of file paths

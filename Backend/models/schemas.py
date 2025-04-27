from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# KPI Schemas
class KPIBase(BaseModel):
    date: Optional[date] = None
    platform: str
    metric_name: str
    metric_value: float
    notes: Optional[str] = None

class KPICreate(KPIBase):
    pass

class KPI(KPIBase):
    id: int
    
    class Config:
        orm_mode = True

# Finance Schemas
class FinanceBase(BaseModel):
    date: Optional[date] = None
    category: str
    amount: float
    is_income: bool
    description: Optional[str] = None

class FinanceCreate(FinanceBase):
    pass

class Finance(FinanceBase):
    id: int
    
    class Config:
        orm_mode = True

# Habit Schemas
class HabitBase(BaseModel):
    date: Optional[date] = None
    name: str
    completed: bool = False
    streak: int = 0
    notes: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    
    class Config:
        orm_mode = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    priority: int = 0
    status: str = "pending"
    tags: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Work Session Schemas
class WorkSessionBase(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    task_id: Optional[int] = None
    description: Optional[str] = None

class WorkSessionCreate(WorkSessionBase):
    pass

class WorkSession(WorkSessionBase):
    id: int
    
    class Config:
        orm_mode = True

# Content Item Schemas
class ContentItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    stage: str = "Idea"
    platform: Optional[str] = None
    target_release_date: Optional[date] = None
    actual_release_date: Optional[date] = None
    associated_files: Optional[str] = None

class ContentItemCreate(ContentItemBase):
    pass

class ContentItem(ContentItemBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

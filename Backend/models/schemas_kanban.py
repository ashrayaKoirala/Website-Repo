from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Label Schemas
class LabelBase(BaseModel):
    name: str
    color: Optional[str] = "#cccccc"

class LabelCreate(LabelBase):
    pass

class Label(LabelBase):
    id: int
    
    class Config:
        orm_mode = True

# Kanban Card Schemas
class KanbanCardBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = 0

class KanbanCardCreate(KanbanCardBase):
    column_id: int

class KanbanCardUpdate(KanbanCardBase):
    column_id: Optional[int] = None

class KanbanCard(KanbanCardBase):
    id: int
    created_at: datetime
    column_id: int
    labels: List[Label] = []
    
    class Config:
        orm_mode = True

# Kanban Column Schemas
class KanbanColumnBase(BaseModel):
    name: str
    order: Optional[int] = 0

class KanbanColumnCreate(KanbanColumnBase):
    board_id: int

class KanbanColumnUpdate(KanbanColumnBase):
    pass

class KanbanColumn(KanbanColumnBase):
    id: int
    board_id: int
    cards: List[KanbanCard] = []
    
    class Config:
        orm_mode = True

# Kanban Board Schemas
class KanbanBoardBase(BaseModel):
    name: str
    description: Optional[str] = None

class KanbanBoardCreate(KanbanBoardBase):
    pass

class KanbanBoardUpdate(KanbanBoardBase):
    pass

class KanbanBoard(KanbanBoardBase):
    id: int
    created_at: datetime
    columns: List[KanbanColumn] = []
    
    class Config:
        orm_mode = True

# Card Movement Schema
class CardMove(BaseModel):
    card_id: int
    source_column_id: int
    destination_column_id: int
    new_order: int

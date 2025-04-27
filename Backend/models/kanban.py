from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class KanbanBoard(Base):
    __tablename__ = "kanban_boards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    columns = relationship("KanbanColumn", back_populates="board", cascade="all, delete-orphan")

class KanbanColumn(Base):
    __tablename__ = "kanban_columns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    order = Column(Integer, default=0)
    board_id = Column(Integer, ForeignKey("kanban_boards.id"))
    
    board = relationship("KanbanBoard", back_populates="columns")
    cards = relationship("KanbanCard", back_populates="column", cascade="all, delete-orphan")

class KanbanCard(Base):
    __tablename__ = "kanban_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    column_id = Column(Integer, ForeignKey("kanban_columns.id"))
    
    column = relationship("KanbanColumn", back_populates="cards")
    labels = relationship("CardLabel", back_populates="card", cascade="all, delete-orphan")

class Label(Base):
    __tablename__ = "labels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    color = Column(String, default="#cccccc")
    
    card_labels = relationship("CardLabel", back_populates="label")

class CardLabel(Base):
    __tablename__ = "card_labels"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("kanban_cards.id"))
    label_id = Column(Integer, ForeignKey("labels.id"))
    
    card = relationship("KanbanCard", back_populates="labels")
    label = relationship("Label", back_populates="card_labels")

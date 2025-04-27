from fastapi import APIRouter
from models import schemas
from services import dashboard_service  # (if you have one)
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
async def list_kpis():
    return await dashboard_service.get_kpis()

@router.post("/kpis")
async def create_kpi(kpi: schemas.KPI):
    return await dashboard_service.create_kpi(kpi)

@router.get("/finances")
async def list_finances():
    return await dashboard_service.get_finances()

@router.post("/finances")
async def create_finance(finance: schemas.Finance):
    return await dashboard_service.create_finance(finance)

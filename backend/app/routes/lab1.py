from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.warehouse_service import WarehouseService

router = APIRouter()


class SQLExecuteRequest(BaseModel):
    query: str
    max_rows: Optional[int] = 100


@router.get("/summary", summary="Lab 1 summary and statistics")
async def get_lab1_summary():
    """
    Returns summary statistics about warehouse tables, total records, and active schemas.
    """
    tables = WarehouseService.list_tables()
    total_records = sum(t["row_count"] for t in tables)
    
    return {
        "lab_id": "lab1",
        "title": "Dimensional Data Modeling",
        "description": "Star Schema, Snowflake Schema, and Fact Constellation Schema designs for Blood Bank Management DWDM.",
        "status": "ready",
        "database_engine": "In-Memory Data Warehouse (SQLite Engine with PostgreSQL compatibility)",
        "total_warehouse_records": total_records,
        "total_tables": len(tables),
        "fact_tables_count": sum(1 for t in tables if "Fact" in t["type"]),
        "dimension_tables_count": sum(1 for t in tables if "Dimension" in t["type"]),
        "implemented_schemas": ["Star Schema", "Snowflake Schema", "Fact Constellation Schema"]
    }


@router.get("/schemas", summary="List dimensional schemas")
async def list_schemas():
    """
    Returns list of available dimensional schema models (Star, Snowflake, Constellation).
    """
    return WarehouseService.get_schemas_metadata()


@router.get("/schemas/{schema_id}", summary="Get detailed schema diagram definition")
async def get_schema_detail(schema_id: str):
    """
    Returns diagram nodes, edges, relationships, and metadata for the requested schema.
    """
    detail = WarehouseService.get_schema_detail(schema_id.lower())
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Schema '{schema_id}' not found. Valid options: 'star', 'snowflake', 'constellation'."
        )
    return detail


@router.get("/tables", summary="List warehouse tables")
async def list_tables():
    """
    Lists all dimensional warehouse tables with row counts and grains.
    """
    return {"tables": WarehouseService.list_tables()}


@router.get("/tables/{table_name}/schema", summary="Get table schema")
async def get_table_schema(table_name: str):
    """
    Returns column details, types, PK/FK flags, and null counts for a specific table.
    """
    schema = WarehouseService.get_table_schema(table_name)
    if not schema:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")
    return schema


@router.get("/tables/{table_name}/data", summary="Get paginated table data")
async def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_dir: str = Query("asc", pattern="^(asc|desc|ASC|DESC)$"),
    search: Optional[str] = Query(None)
):
    """
    Returns paginated records, total rows, and columns for a table.
    """
    result = WarehouseService.get_table_data(
        table_name=table_name,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/sql/samples", summary="Get sample analytical queries")
async def get_sql_samples():
    """
    Returns pre-defined safe educational sample queries demonstrating Star, Snowflake, and Constellation queries.
    """
    return {"queries": WarehouseService.get_sample_queries()}


@router.post("/sql/execute", summary="Execute safe SQL query")
async def execute_sql(payload: SQLExecuteRequest):
    """
    Executes a read-only SELECT SQL query against the warehouse database and returns execution metrics and rows.
    """
    result = WarehouseService.execute_safe_sql(payload.query, max_rows=payload.max_rows or 100)
    return result

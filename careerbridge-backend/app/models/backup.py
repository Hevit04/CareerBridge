from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.core.database import Base


class BackupRecord(Base):
    """Stores deleted records across the application for recovery."""
    __tablename__ = "backup_records"

    id          = Column(Integer, primary_key=True, index=True)
    table_name  = Column(String(50), nullable=False, index=True)
    original_id = Column(Integer, nullable=False)
    data        = Column(JSON, nullable=False)
    deleted_at  = Column(DateTime, default=datetime.utcnow)

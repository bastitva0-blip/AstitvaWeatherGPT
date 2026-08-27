"""
SQLAlchemy async models mirroring prisma/schema.prisma.

Note: runtime persistence uses SQLAlchemy + asyncpg instead of prisma-client-py
(prisma-client-py requires a network codegen step at build time). The schema
in prisma/schema.prisma remains the canonical documented schema; this module
is a 1:1 runtime implementation of the same tables.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.pool import StaticPool

from app.core.config import settings


def _cuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    apiKey: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    sessions: Mapped[list["Session"]] = relationship(back_populates="user")
    alertSubscriptions: Mapped[list["AlertSubscription"]] = relationship(back_populates="user")


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    userId: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    lang: Mapped[str] = mapped_column(String, default="hi")
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    user: Mapped["User"] = relationship(back_populates="sessions")
    queries: Mapped[list["Query"]] = relationship(back_populates="session")


class Query(Base):
    __tablename__ = "queries"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    sessionId: Mapped[str] = mapped_column(String, ForeignKey("sessions.id"))
    message: Mapped[str] = mapped_column(String)
    enText: Mapped[str] = mapped_column(String)
    intent: Mapped[str] = mapped_column(String)
    slots: Mapped[dict] = mapped_column(JSON)
    response: Mapped[str] = mapped_column(String)
    citations: Mapped[dict] = mapped_column(JSON)
    lang: Mapped[str] = mapped_column(String)
    inputMode: Mapped[str] = mapped_column(String, default="text")
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    session: Mapped["Session"] = relationship(back_populates="queries")


class AlertSubscription(Base):
    __tablename__ = "alert_subscriptions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    userId: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    location: Mapped[str] = mapped_column(String)
    thresholdType: Mapped[str] = mapped_column(String)
    thresholdValue: Mapped[float] = mapped_column(Float)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    user: Mapped["User"] = relationship(back_populates="alertSubscriptions")


class ClimateRecord(Base):
    __tablename__ = "climate_records"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    location: Mapped[str] = mapped_column(String)
    parameter: Mapped[str] = mapped_column(String)
    year: Mapped[int] = mapped_column(Integer)
    month: Mapped[int | None] = mapped_column(Integer, nullable=True)
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class HallucinationLog(Base):
    __tablename__ = "hallucination_logs"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    queryId: Mapped[str] = mapped_column(String)
    response: Mapped[str] = mapped_column(String)
    issue: Mapped[str] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class LocationCache(Base):
    __tablename__ = "location_cache"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    name: Mapped[str] = mapped_column(String, unique=True)
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    district: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str] = mapped_column(String, default="IN")
    geohash: Mapped[str | None] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    global _engine
    if _engine is None:
        if settings.DATABASE_URL.startswith("sqlite") and ":memory:" in settings.DATABASE_URL:
            _engine = create_async_engine(
                settings.DATABASE_URL, echo=False, future=True,
                connect_args={"check_same_thread": False}, poolclass=StaticPool,
            )
        else:
            _engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False, class_=AsyncSession)
    return _session_factory


async def get_db() -> AsyncSession:
    factory = get_session_factory()
    async with factory() as session:
        yield session


async def init_db() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

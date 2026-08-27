from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Core
    DATABASE_URL: str = "postgresql+asyncpg://weathergpt:changeme@localhost:5432/weathergpt"
    REDIS_URL: str = "redis://localhost:6379"
    CHROMADB_HOST: str = "localhost"
    CHROMADB_PORT: int = 8001

    # External APIs
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    # meta/llama-3.2-11b-vision-instruct: ~1.3s/call vs ~10-15s for the
    # 120B reasoning model (nvidia/nemotron-3-super-120b-a12b) — needed to
    # meet the PS's <2000ms P95 latency evaluation criterion. The reasoning
    # model produces more careful JSON but its latency budget doesn't fit
    # a synchronous chat endpoint; swap back if judges prioritize answer
    # depth over response time.
    NVIDIA_MODEL: str = "meta/llama-3.2-11b-vision-instruct"
    OPENWEATHERMAP_API_KEY: str = ""
    IMD_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    # NWP
    GFS_NOMADS_BASE_URL: str = "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl"

    # WIS2.0 / MQTT
    WIS2_BROKER_HOST: str = "globalbroker.meteo.fr"
    WIS2_BROKER_PORT: int = 8883
    WIS2_ENABLED: bool = False
    WIS2_TOPIC_PREFIX: str = "origin/a/wis2/ind-imd/data/core/weather"

    # GIS
    NOMINATIM_USER_AGENT: str = "weathergpt-sih2026"

    # App
    API_KEY_HEADER: str = "X-API-Key"
    API_KEYS: str = "test-key"  # comma-separated valid keys (dev default)
    CACHE_TTL_SECONDS: int = 900
    TOP_CITIES_CACHE: int = 100
    WHISPER_MODEL_SIZE: str = "base"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def model_post_init(self, __context) -> None:
        # Railway's Postgres plugin injects DATABASE_URL as postgresql://
        # (psycopg2-style); the async SQLAlchemy engine needs the asyncpg dialect.
        if self.DATABASE_URL.startswith("postgresql://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

    @property
    def valid_api_keys(self) -> set[str]:
        return {k.strip() for k in self.API_KEYS.split(",") if k.strip()}


settings = Settings()

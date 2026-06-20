from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.submissions import router as submissions_router
from routes.admin       import router as admin_router
from routes.public      import router as public_router

app = FastAPI(
    title="ListingsPipeline API",
    description="Secure ingestion pipeline for Real Estate & Vehicle listings",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions_router)
app.include_router(admin_router)
app.include_router(public_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

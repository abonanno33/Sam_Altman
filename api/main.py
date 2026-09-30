from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Hackathon API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

items: list[dict] = []


class Item(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/items")
def list_items():
    return items


@app.post("/api/items")
def add_item(item: Item):
    entry = {"id": len(items) + 1, **item.model_dump()}
    items.append(entry)
    return entry

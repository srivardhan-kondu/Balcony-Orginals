from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

PROJECTS_SEED = [
    {
        "slug": "proddatur-dussehra",
        "title": "Proddatur Dussehra",
        "telugu": "ప్రొద్దుటూరు దసరా",
        "type": "documentary",
        "status": "completed",
        "categories": ["Devotional", "Cultural"],
        "location": "Proddatur",
        "district": "Kadapa",
        "state": "Andhra Pradesh",
        "country": "India",
        "year": "2025",
        "duration": "Documentary",
        "logline": "A town that burns its devotion into the night sky.",
        "synopsis": "Every year, Proddatur transforms. Streets become rivers of flame and faith as one of Rayalaseema's most spectacular Dussehra celebrations unfolds — processions, rituals, and a community that carries its devotion quite literally on its shoulders. This documentary follows the festival from its quiet first lamps to its thunderous final night.",
        "story": "Dussehra in Proddatur is not watched — it is lived. The film moves through ten days of preparation and release: the artisans who build the idols, the families who keep century-old vows, the drummers whose rhythms decide the pace of entire streets. What emerges is not a record of a festival, but a portrait of a town that measures its year in devotion.",
        "place": "Proddatur, in the Kadapa district of Rayalaseema, sits on the banks of the Penna river — a trading town whose lanes hold temples, mosques and churches within walking distance of each other. During Dussehra, its identity condenses into a single, blazing civic ritual.",
        "people": "Idol makers, temple priests, percussion troupes, municipal workers, grandmothers who have never missed a procession in sixty years — the film belongs to them.",
        "hero": "/assets/projects/proddatur-hero.jpg",
        "poster": "/assets/projects/proddatur-hero.jpg",
        "gallery": ["/assets/projects/proddatur-2.jpg", "/assets/projects/proddatur-3.jpg", "/assets/projects/hero.jpg"],
        "credits": [
            {"role": "Direction & Production", "name": "Balcony Originals"},
            {"role": "Cinematography", "name": "Balcony Originals Crew"},
            {"role": "Sound & Edit", "name": "Balcony Originals Post"}
        ],
        "featured": True,
        "order": 1
    },
    {
        "slug": "medaram-jatara",
        "title": "Medaram Jatara",
        "telugu": "మేడారం జాతర",
        "type": "documentary",
        "status": "completed",
        "categories": ["Devotional", "Cultural", "People"],
        "location": "Medaram",
        "district": "Mulugu",
        "state": "Telangana",
        "country": "India",
        "year": "2024",
        "duration": "Documentary",
        "logline": "Asia's largest tribal gathering, seen from the inside.",
        "synopsis": "Once every two years, a small forest hamlet in Telangana becomes one of the largest human gatherings on earth. The Sammakka Saralamma Jatara draws millions of devotees into the Medaram forest — no temple, no idol house, just faith under the trees. This documentary walks with the pilgrims.",
        "story": "There is no priesthood at the centre of Medaram — only memory. The film follows Koya tribal families, first-time visitors, and the unseen machinery of a state that must build a temporary city for millions in the middle of a forest. It asks what keeps a four-hundred-year-old act of remembrance alive.",
        "place": "Medaram sits deep in the forests of Mulugu, Telangana. For most of the year it is silent. During the Jatara, the forest itself becomes the shrine.",
        "people": "Koya elders, women carrying jaggery offerings equal to their body weight, volunteer doctors, tribal singers keeping oral histories — the gathering is the protagonist.",
        "hero": "/assets/projects/medaram-hero.jpg",
        "poster": "/assets/projects/medaram-hero.jpg",
        "gallery": ["/assets/projects/medaram-2.jpg", "/assets/projects/medaram-3.jpg", "/assets/projects/hero.jpg"],
        "credits": [
            {"role": "Direction & Production", "name": "Balcony Originals"},
            {"role": "Cinematography", "name": "Balcony Originals Crew"},
            {"role": "Sound & Edit", "name": "Balcony Originals Post"}
        ],
        "featured": True,
        "order": 2
    },
    {
        "slug": "yaganti",
        "title": "Yaganti",
        "telugu": "యాగంటి",
        "type": "documentary",
        "status": "upcoming",
        "categories": ["Devotional", "Heritage"],
        "location": "Yaganti",
        "district": "Nandyala",
        "state": "Andhra Pradesh",
        "country": "India",
        "year": "2026",
        "duration": "Documentary",
        "logline": "The stone Nandi that is still growing — and the people who believe it.",
        "synopsis": "In the rocky folds of Nandyala district stands the Yaganti temple, home to a monolithic Nandi that devotees say grows a little every year. Between geology and faith, between cave shrines and prophecy, this upcoming documentary explores a place where stone is alive with story.",
        "story": "Sage Agastya's penance, the crow that became a hill, the Nandi that outgrows its pillars — Yaganti is layered with legend. The film will trace how a single temple holds together geology, devotion and an entire region's imagination.",
        "place": "Yaganti, set among the Erramala hills of Nandyala district, is one of Rayalaseema's most ancient sacred geographies — cave temples, natural springs and boulder hills that look sculpted by intent.",
        "people": "Temple priests, historians, geologists, and the farming communities for whom Yaganti is not a destination but a neighbour.",
        "hero": "/assets/projects/yaganti-hero.jpg",
        "poster": "/assets/projects/yaganti-hero.jpg",
        "gallery": ["/assets/projects/yaganti-2.jpg", "/assets/projects/roots.jpg"],
        "credits": [{"role": "Direction & Production", "name": "Balcony Originals"}],
        "featured": True,
        "order": 3
    },
    {
        "slug": "ahobilam",
        "title": "Ahobilam",
        "telugu": "అహోబిలం",
        "type": "documentary",
        "status": "upcoming",
        "categories": ["Devotional", "Heritage"],
        "location": "Ahobilam",
        "district": "Nandyala",
        "state": "Andhra Pradesh",
        "country": "India",
        "year": "2026",
        "duration": "Documentary",
        "logline": "Nine shrines hidden in a forest where the Lord is said to have torn a pillar apart.",
        "synopsis": "Deep in the Nallamala forest, across gorges and stone steps, lie the nine Narasimha shrines of Ahobilam. This upcoming documentary is a pilgrimage on foot — through the upper and lower kshetras, following the devotees who still climb these hills the old way.",
        "story": "Ahobilam is where myth has a mailing address. The film will walk the full circuit of the Nava Narasimha temples, listening to the legends of Hiranyakashipu and Prahlada in the very landscape where they are believed to have happened.",
        "place": "Ahobilam, in the Nandyala district of Andhra Pradesh, is split between the plains village and the forested upper hills — a demanding terrain that has kept mass tourism away and devotion intact.",
        "people": "Jeeyars and priests of the Ahobila Mutt, forest-dwelling Chenchu guides, and pilgrims who measure the journey in blisters and blessings.",
        "hero": "/assets/projects/ahobilam-hero.jpg",
        "poster": "/assets/projects/ahobilam-hero.jpg",
        "gallery": ["/assets/projects/ahobilam-2.jpg", "/assets/projects/roots.jpg"],
        "credits": [{"role": "Direction & Production", "name": "Balcony Originals"}],
        "featured": True,
        "order": 4
    },
    {
        "slug": "untitled-feature",
        "title": "Untitled Feature",
        "telugu": "",
        "type": "feature",
        "status": "in-development",
        "categories": ["Feature Film"],
        "location": "Rayalaseema",
        "district": "",
        "state": "Andhra Pradesh",
        "country": "India",
        "year": "",
        "duration": "Feature Film",
        "logline": "A story from the soil. Everything else, for now, stays in the soil.",
        "synopsis": "Balcony Originals' first feature film is in development — a root-based concept drawn from the land, the people and the moral weather of Rayalaseema. Title, cast and production details will be announced only when approved.",
        "story": "The same philosophy that drives our documentaries — rooted stories, authentic people, culture, place, emotion — is being shaped into our first fiction feature.",
        "place": "Rayalaseema. Where else.",
        "people": "To be announced.",
        "hero": "/assets/projects/feature-hero.jpg",
        "poster": "/assets/projects/feature-hero.jpg",
        "gallery": [],
        "credits": [],
        "confidential": True,
        "featured": True,
        "order": 5
    }
]


class StorySubmission(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    one_line_story: str
    category: Optional[str] = ""
    note: Optional[str] = ""
    consent: bool
    website: Optional[str] = ""


class ContactMessage(BaseModel):
    name: str
    email: str
    subject: Optional[str] = "General enquiry"
    message: str
    website: Optional[str] = ""


@api_router.get("/")
async def root():
    return {"message": "Balcony Originals API"}


@api_router.get("/projects")
async def list_projects(type: Optional[str] = None, status: Optional[str] = None,
                        category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if category:
        query["categories"] = category
    if featured is not None:
        query["featured"] = featured
    return await db.projects.find(query, {"_id": 0}).sort("order", 1).to_list(200)


@api_router.get("/projects/{slug}")
async def get_project(slug: str):
    doc = await db.projects.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.post("/story-submissions")
async def create_submission(payload: StorySubmission):
    if payload.website:
        return {"ok": True}
    if not payload.name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    if not EMAIL_RE.match(payload.email):
        raise HTTPException(status_code=422, detail="A valid email is required")
    if len(payload.one_line_story.strip()) < 3:
        raise HTTPException(status_code=422, detail="Tell us the story in one line")
    if not payload.consent:
        raise HTTPException(status_code=422, detail="Consent is required")
    doc = payload.model_dump()
    doc.pop("website", None)
    doc["status"] = "New"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.story_submissions.insert_one(doc)
    return {"ok": True, "message": "Thank you for trusting us with your story. Our team will review your submission and reach out if it fits our current storytelling or production interests."}


@api_router.post("/contact")
async def create_contact(payload: ContactMessage):
    if payload.website:
        return {"ok": True}
    if not payload.name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    if not EMAIL_RE.match(payload.email):
        raise HTTPException(status_code=422, detail="A valid email is required")
    if len(payload.message.strip()) < 3:
        raise HTTPException(status_code=422, detail="Message is required")
    doc = payload.model_dump()
    doc.pop("website", None)
    doc["status"] = "New"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(doc)
    return {"ok": True, "message": "Thank you — we have it. We'll get back to you soon."}


@app.on_event("startup")
async def seed_projects():
    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([dict(p) for p in PROJECTS_SEED])


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

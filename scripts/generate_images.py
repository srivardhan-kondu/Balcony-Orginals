import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

OUT = Path("/app/frontend/public/assets/projects")
OUT.mkdir(parents=True, exist_ok=True)

STYLE = (
    " Cinematic documentary film still, ultra-wide 21:9 cinematic aspect ratio, "
    "moody near-black shadows, antique golden light, warm earthy tones, subtle film grain, "
    "anamorphic lens feel, photorealistic, no text, no watermark, no logo."
)

IMAGES = {
    "hero.jpg": "Epic wide shot of a South Indian temple town festival procession at dusk, thousands of oil lamps and fire torches, crowds silhouetted, golden dust in the air, ancient gopuram temple tower rising in the background",
    "proddatur-hero.jpg": "Night festival procession in a small Andhra Pradesh town in India, massive decorated deity idol carried through streets, fire torches, dense crowds, smoke and golden light, documentary photography",
    "proddatur-2.jpg": "Close-up of hands holding a burning camphor lamp during a Hindu festival ritual at night, marigold garlands, golden bokeh lights",
    "proddatur-3.jpg": "Drummers and folk dancers in a street festival procession at night in rural India, slight motion blur, dust kicked up, warm tungsten light",
    "medaram-hero.jpg": "Vast tribal festival gathering in a forest clearing in Telangana India at dawn, thousands of pilgrims, morning mist, red and turmeric colored clothing, sacred atmosphere",
    "medaram-2.jpg": "Tribal devotees carrying offerings of jaggery and turmeric walking a forest path, morning light rays through tall trees",
    "medaram-3.jpg": "High aerial view of a massive crowd of pilgrims gathered for an Indian forest festival, sea of people, dusty golden evening light",
    "yaganti-hero.jpg": "Ancient stone temple of Yaganti in Andhra Pradesh India with a huge monolithic Nandi bull statue, rocky boulder hills, banyan trees, mystical morning light",
    "yaganti-2.jpg": "Interior of an ancient Indian cave temple with carved stone pillars, oil lamp flames flickering, deep shadows, spiritual atmosphere",
    "ahobilam-hero.jpg": "Ancient Hindu temple nestled in dramatic forested Nallamala hills of Andhra Pradesh India, steep stone steps, monsoon mist, epic landscape",
    "ahobilam-2.jpg": "Weathered stone carving of a deity on an ancient Indian temple wall, dramatic side lighting, rich texture detail",
    "feature-hero.jpg": "Cinematic movie-poster mood image, a lone figure walking a red dirt road through an arid Rayalaseema landscape with boulder hills, storm clouds, golden rim light, anamorphic widescreen",
    "roots.jpg": "Red soil landscape of Rayalaseema Andhra Pradesh India, ancient granite boulder hills, dry golden grassland, dramatic monsoon sky, epic wide shot",
    "gems.jpg": "Elderly Indian storyteller's weathered hands gesturing beside a single oil lamp flame at night, intimate documentary portrait, deep shadows, warm golden light",
    "about.jpg": "Documentary film crew silhouettes filming a temple festival at golden hour in India, cinema camera on tripod, dramatic backlight, dust in the air",
}

SEM = asyncio.Semaphore(3)


async def gen(name, prompt):
    path = OUT / name
    if path.exists() and path.stat().st_size > 10000:
        print(f"SKIP {name}", flush=True)
        return
    async with SEM:
        try:
            chat = LlmChat(
                api_key=os.environ["EMERGENT_LLM_KEY"],
                session_id=f"bo-img-{name}",
                system_message="You generate cinematic photographic images.",
            )
            chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
                modalities=["image", "text"]
            )
            text, images = await chat.send_message_multimodal_response(
                UserMessage(text=prompt + STYLE)
            )
            if images:
                path.write_bytes(base64.b64decode(images[0]["data"]))
                print(f"OK {name} ({path.stat().st_size} bytes)", flush=True)
            else:
                print(f"NOIMAGE {name}: {str(text)[:80]}", flush=True)
        except Exception as e:
            print(f"FAIL {name}: {str(e)[:200]}", flush=True)


async def main():
    await asyncio.gather(*(gen(n, p) for n, p in IMAGES.items()))
    print("DONE", flush=True)


asyncio.run(main())

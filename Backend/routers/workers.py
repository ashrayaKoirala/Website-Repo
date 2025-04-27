from fastapi import APIRouter, UploadFile, File, Form
from services import video_processing, emoji_overlay, subtitles, ai_integration

router = APIRouter(prefix="/workers", tags=["Workers"])

@router.post("/cut-profile")
async def cut_profile(video: UploadFile = File(...), transcript: UploadFile = File(...)):
    result = await ai_integration.generate_cut_profile(video, transcript)
    return result

@router.post("/video-cutter")
async def cut_video(video: UploadFile = File(...), cut_profile: UploadFile = File(...)):
    result = await video_processing.cut_video(video, cut_profile)
    return result

@router.post("/silence-remover")
async def remove_silence(media: UploadFile = File(...), 
                         min_silence_duration: float = Form(0.5), 
                         silence_threshold: float = Form(-40)):
    result = await video_processing.remove_silence(media, min_silence_duration, silence_threshold)
    return result

@router.post("/satisfy")
async def satisfy_video(intro_clip: UploadFile = File(...), clips: list[UploadFile] = File(...)):
    result = await video_processing.create_satisfying_montage(intro_clip, clips)
    return result

@router.post("/renderer")
async def render_video(clips: list[UploadFile] = File(...),
                       arrangement: str = Form(None),
                       intro_clip: UploadFile = File(None),
                       outro_clip: UploadFile = File(None)):
    result = await video_processing.render_final_video(clips, arrangement, intro_clip, outro_clip)
    return result

@router.post("/subtitles")
async def generate_subtitles(transcript: UploadFile = File(...), 
                             font_style: str = Form("default"), 
                             format: str = Form("srt")):
    result = await subtitles.generate_subtitles(transcript, font_style, format)
    return result

@router.post("/overlay")
async def create_overlay(transcript: UploadFile = File(...), 
                         video: UploadFile = File(...)):
    result = await emoji_overlay.apply_emoji_overlay(transcript, video)
    return result

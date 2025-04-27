import os
import json
import asyncio
from typing import Dict, Any, List, Optional
import webvtt
from datetime import timedelta

async def generate_subtitles(
    transcript_path: str, 
    font_style: str = "default",
    format: str = "srt"
) -> str:
    """
    Generate subtitles from a transcript file.
    
    Args:
        transcript_path: Path to the transcript file
        font_style: Style preset for subtitles
        format: Output format (srt, vtt)
        
    Returns:
        Path to the generated subtitle file
    """
    # Read the transcript file
    with open(transcript_path, 'r') as f:
        transcript_data = f.read()
    
    # Check if the transcript is already in a structured format
    try:
        # Try parsing as JSON
        transcript_json = json.loads(transcript_data)
        subtitles = process_structured_transcript(transcript_json)
    except json.JSONDecodeError:
        # If not JSON, process as plain text
        subtitles = process_plain_text_transcript(transcript_data)
    
    # Apply font styling
    styled_subtitles = apply_font_style(subtitles, font_style)
    
    # Output to the requested format
    file_extension = format.lower()
    output_filename = f"outputs/subtitles_{os.path.basename(transcript_path)}.{file_extension}"
    
    if file_extension == "srt":
        write_srt(styled_subtitles, output_filename)
    elif file_extension == "vtt":
        write_vtt(styled_subtitles, output_filename)
    else:
        raise ValueError(f"Unsupported subtitle format: {format}")
    
    return output_filename

def process_structured_transcript(transcript_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Process a structured transcript (JSON format)"""
    subtitles = []
    
    # Handle different possible JSON structures
    if "segments" in transcript_json:
        # Format with segments that have start/end times and text
        for segment in transcript_json["segments"]:
            subtitles.append({
                "start_time": segment.get("start_time", 0),
                "end_time": segment.get("end_time", 0),
                "text": segment.get("text", "")
            })
    elif "transcript" in transcript_json and isinstance(transcript_json["transcript"], list):
        # Format with a list of transcript items
        for item in transcript_json["transcript"]:
            subtitles.append({
                "start_time": item.get("start", 0),
                "end_time": item.get("end", 0),
                "text": item.get("text", "")
            })
    
    return subtitles

def process_plain_text_transcript(transcript_text: str) -> List[Dict[str, Any]]:
    """Process a plain text transcript by estimating timing"""
    subtitles = []
    
    # Split into lines or paragraphs
    lines = transcript_text.strip().split('\n\n')
    if len(lines) <= 1:
        lines = transcript_text.strip().split('\n')
    
    # Estimate timing (assume average reading speed)
    # Average reading speed: ~150 words per minute = ~2.5 words per second
    words_per_second = 2.5
    current_time = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        word_count = len(line.split())
        duration = word_count / words_per_second
        
        # Ensure minimum duration of 1 second per subtitle
        duration = max(duration, 1.0)
        
        subtitles.append({
            "start_time": current_time,
            "end_time": current_time + duration,
            "text": line
        })
        
        current_time += duration
    
    return subtitles

def apply_font_style(subtitles: List[Dict[str, Any]], font_style: str) -> List[Dict[str, Any]]:
    """Apply styling to subtitles based on preset"""
    styled_subtitles = subtitles.copy()
    
    # Apply styling based on the selected preset
    # In a real implementation, this would modify the subtitle format
    # For SRT/VTT, this is usually done with tags
    
    if font_style == "default":
        # No special formatting
        pass
    elif font_style == "bold":
        for subtitle in styled_subtitles:
            subtitle["text"] = f"<b>{subtitle['text']}</b>"
    elif font_style == "italic":
        for subtitle in styled_subtitles:
            subtitle["text"] = f"<i>{subtitle['text']}</i>"
    elif font_style == "modern":
        for subtitle in styled_subtitles:
            subtitle["text"] = f"<font color=\"#FFFFFF\" face=\"Arial\">{subtitle['text']}</font>"
    
    return styled_subtitles

def format_time(seconds: float) -> str:
    """Format time in HH:MM:SS,mmm format for SRT"""
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = td.microseconds // 1000
    
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"

def format_time_vtt(seconds: float) -> str:
    """Format time in HH:MM:SS.mmm format for VTT"""
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = td.microseconds // 1000
    
    return f"{hours:02}:{minutes:02}:{seconds:02}.{milliseconds:03}"

def write_srt(subtitles: List[Dict[str, Any]], output_path: str) -> None:
    """Write subtitles to SRT format"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, subtitle in enumerate(subtitles, 1):
            start_formatted = format_time(subtitle["start_time"])
            end_formatted = format_time(subtitle["end_time"])
            
            f.write(f"{i}\n")
            f.write(f"{start_formatted} --> {end_formatted}\n")
            f.write(f"{subtitle['text']}\n\n")

def write_vtt(subtitles: List[Dict[str, Any]], output_path: str) -> None:
    """Write subtitles to VTT format"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")
        
        for i, subtitle in enumerate(subtitles, 1):
            start_formatted = format_time_vtt(subtitle["start_time"])
            end_formatted = format_time_vtt(subtitle["end_time"])
            
            f.write(f"{i}\n")
            f.write(f"{start_formatted} --> {end_formatted}\n")
            f.write(f"{subtitle['text']}\n\n")

async def apply_subtitles(
    video_path: str,
    subtitle_path: str,
    font: str = "Arial",
    font_size: int = 24,
    color: str = "white",
    position: str = "bottom"
) -> str:
    """
    Apply subtitles to a video.
    
    Args:
        video_path: Path to the video file
        subtitle_path: Path to the subtitle file (SRT or VTT)
        font: Font to use for subtitles
        font_size: Font size
        color: Font color
        position: Position on screen (bottom, top)
        
    Returns:
        Path to the output video with subtitles
    """
    from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
    import webvtt
    
    output_filename = f"outputs/subtitled_{os.path.basename(video_path)}"
    
    # Load the video
    video = VideoFileClip(video_path)
    
    # Load subtitles
    if subtitle_path.endswith('.srt') or subtitle_path.endswith('.vtt'):
        subtitles = webvtt.read(subtitle_path)
        
        # Create text clips for each subtitle
        text_clips = []
        
        for subtitle in subtitles:
            start_time = subtitle.start_in_seconds
            end_time = subtitle.end_in_seconds
            text = subtitle.text
            
            # Create a text clip
            txt_clip = TextClip(
                text, 
                fontsize=font_size, 
                font=font,
                color=color,
                bg_color='black',
                stroke_color='black',
                stroke_width=1
            )
            
            # Set position
            if position == "bottom":
                txt_clip = txt_clip.set_position(('center', 'bottom'))
            else:  # top
                txt_clip = txt_clip.set_position(('center', 'top'))
            
            # Set duration and start time
            txt_clip = txt_clip.set_start(start_time).set_duration(end_time - start_time)
            
            # Add to the list of text clips
            text_clips.append(txt_clip)
        
        # Create the final composite
        final_clip = CompositeVideoClip([video] + text_clips)
        
        # Write the output file
        final_clip.write_videofile(output_filename, codec="libx264")
        
        # Clean up
        video.close()
        final_clip.close()
        
        return output_filename
    else:
        raise ValueError(f"Unsupported subtitle format: {os.path.splitext(subtitle_path)[1]}")

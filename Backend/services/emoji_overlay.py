import os
import json
import asyncio
from typing import Dict, Any, List
import requests
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
import numpy as np
from PIL import Image

async def generate_emoji_overlay(transcript_path: str, video_path: str) -> str:
    """
    Generate and apply emoji overlays to a video based on transcript.
    
    Args:
        transcript_path: Path to the transcript file
        video_path: Path to the video file
        
    Returns:
        Path to the output video with emoji overlays
    """
    output_filename = f"outputs/emoji_{os.path.basename(video_path)}"
    
    # Read the transcript
    with open(transcript_path, 'r') as f:
        transcript_text = f.read()
    
    # Map words to emojis using NLP
    # In a real implementation, this would use the Hugging Face API
    # For this demo, we'll use a simplified approach
    emojis = await map_words_to_emojis(transcript_text)
    
    # Now apply the emojis to the video
    await apply_emoji_to_video(video_path, emojis, output_filename)
    
    return output_filename

async def map_words_to_emojis(transcript_text: str) -> List[Dict[str, Any]]:
    """
    Map words in transcript to appropriate emojis with timestamps.
    
    Args:
        transcript_text: The transcript text
        
    Returns:
        List of dictionaries with emoji info and timestamps
    """
    # This is a simplified version of what would be done with a proper NLP model
    # In production, you would use Hugging Face models for more accurate mapping
    
    # For demo purposes, we'll use a simple dictionary of keywords to emojis
    keyword_to_emoji = {
        "happy": "😊",
        "sad": "😢",
        "angry": "😠",
        "surprise": "😲",
        "laugh": "😂",
        "love": "❤️",
        "congratulations": "🎉",
        "good": "👍",
        "bad": "👎",
        "money": "💰",
        "idea": "💡",
        "music": "🎵",
        "movie": "🎬",
        "book": "📚",
        "computer": "💻",
        "phone": "📱",
        "time": "⏰",
        "food": "🍔",
        "drink": "🍹",
        "car": "🚗",
        "home": "🏠",
    }
    
    # Split transcript into words and estimate timing
    words = transcript_text.split()
    
    # Assume average speaking rate of 150 words per minute = 2.5 words per second
    words_per_second = 2.5
    
    emoji_overlays = []
    current_time = 0
    
    for i, word in enumerate(words):
        word_lower = word.lower().strip(".,!?;:\"'()")
        
        # Check if the word matches any of our keywords
        for keyword, emoji in keyword_to_emoji.items():
            if keyword in word_lower:
                # Add emoji with timestamp
                emoji_overlays.append({
                    "emoji": emoji,
                    "time": current_time,
                    "duration": 1.0,  # Show emoji for 1 second
                    "word": word
                })
                break
        
        # Update time counter (each word takes 1/words_per_second seconds)
        if i % 3 == 0:  # Adjust timing every few words for more natural pacing
            current_time += 3 / words_per_second
    
    return emoji_overlays

async def apply_emoji_to_video(
    video_path: str, 
    emoji_data: List[Dict[str, Any]],
    output_path: str
) -> None:
    """
    Apply emojis to the video at specified timestamps.
    
    Args:
        video_path: Path to the video file
        emoji_data: List of emoji data with timestamps
        output_path: Path to write the output video
    """
    from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
    
    # Load the video
    video = VideoFileClip(video_path)
    
    # Create a clip for each emoji
    emoji_clips = []
    
    for emoji_item in emoji_data:
        emoji = emoji_item["emoji"]
        start_time = emoji_item["time"]
        duration = emoji_item["duration"]
        
        # Create a text clip for the emoji
        # Using TextClip for emojis is a simplified approach
        # For better quality, you would create image files for each emoji
        emoji_clip = TextClip(
            emoji, 
            fontsize=72,
            color='white',
            font='Arial'
        )
        
        # Set position (random position within safe margins)
        width, height = video.size
        margin = 100  # Keep emoji away from edges
        
        x_pos = np.random.randint(margin, width - margin)
        y_pos = np.random.randint(margin, height - margin)
        
        emoji_clip = emoji_clip.set_position((x_pos, y_pos))
        
        # Set duration and start time
        emoji_clip = emoji_clip.set_start(start_time).set_duration(duration)
        
        # Add a "popping" effect
        def resize_emoji(t):
            # Start small, grow quickly, then shrink
            if t < 0.2:
                # Growing phase
                scale = t / 0.2
            elif t < 0.8:
                # Full size phase
                scale = 1.0
            else:
                # Shrinking phase
                scale = 1.0 - (t - 0.8) / 0.2
            
            return scale * 1.0  # 1.0 is the base scale
        
        emoji_clip = emoji_clip.resize(resize_emoji)
        
        # Add to the list of emoji clips
        emoji_clips.append(emoji_clip)
    
    # Create the final composite
    final_clip = CompositeVideoClip([video] + emoji_clips)
    
    # Write the output file
    final_clip.write_videofile(output_path, codec="libx264")
    
    # Clean up
    video.close()
    final_clip.close()

import os
import asyncio
from typing import List, Dict, Any, Optional
import json
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
import numpy as np

async def cut_video_with_profile(video_path: str, cut_profile: Dict[str, Any]) -> str:
    """
    Cut a video based on a cut profile JSON.
    
    Args:
        video_path: Path to the video file
        cut_profile: Dictionary containing cut timestamps and instructions
        
    Returns:
        Path to the output video file
    """
    # This function would be implemented with moviepy
    output_filename = f"outputs/cut_{os.path.basename(video_path)}"
    
    # Load the video file
    video = VideoFileClip(video_path)
    
    # Extract the segments to keep based on the cut profile
    segments = []
    for segment in cut_profile.get("segments", []):
        start_time = segment.get("start_time")
        end_time = segment.get("end_time")
        
        if start_time is not None and end_time is not None:
            clip = video.subclip(start_time, end_time)
            segments.append(clip)
    
    # Concatenate all segments
    if segments:
        final_clip = concatenate_videoclips(segments)
        final_clip.write_videofile(output_filename, codec="libx264")
        final_clip.close()
    else:
        raise ValueError("No valid segments found in cut profile")
    
    # Close the original video to free resources
    video.close()
    
    return output_filename

async def remove_silence(
    media_path: str, 
    min_silence_duration: float = 0.5,
    silence_threshold: float = -40
) -> str:
    """
    Remove silent parts from a video or audio file.
    
    Args:
        media_path: Path to the media file
        min_silence_duration: Minimum duration of silence to remove (in seconds)
        silence_threshold: Threshold in dB below which is considered silence
        
    Returns:
        Path to the output file with silence removed
    """
    output_filename = f"outputs/nosilence_{os.path.basename(media_path)}"
    
    # Determine if it's a video or audio file
    is_video = media_path.lower().endswith(('.mp4', '.avi', '.mov', '.wmv'))
    
    if is_video:
        # Load the video
        video = VideoFileClip(media_path)
        # Extract audio
        audio = video.audio
    else:
        # Load as audio file
        audio = AudioFileClip(media_path)
        video = None
    
    # Get the audio array
    audio_array = audio.to_soundarray()
    audio_frame_rate = audio.fps
    
    # Calculate the amplitude in dB
    eps = np.finfo(float).eps  # Small number to avoid log(0)
    amplitude = 20 * np.log10(np.sqrt(np.mean(audio_array**2)) + eps)
    
    # Find segments of non-silence
    non_silent_segments = []
    is_silent = True
    segment_start = 0
    
    for i in range(0, len(audio_array), int(audio_frame_rate * 0.1)):  # Check every 0.1 seconds
        chunk = audio_array[i:i + int(audio_frame_rate * 0.1)]
        if len(chunk) == 0:
            continue
            
        chunk_amplitude = 20 * np.log10(np.sqrt(np.mean(chunk**2)) + eps)
        
        current_time = i / audio_frame_rate
        
        if is_silent and chunk_amplitude > silence_threshold:
            # Transition from silence to non-silence
            segment_start = current_time
            is_silent = False
        elif not is_silent and chunk_amplitude <= silence_threshold:
            # Transition from non-silence to silence
            if current_time - segment_start >= min_silence_duration:
                non_silent_segments.append((segment_start, current_time))
            is_silent = True
    
    # Don't forget the last segment if it's non-silent
    if not is_silent:
        non_silent_segments.append((segment_start, audio.duration))
    
    # Create clips from non-silent segments
    if is_video and video is not None:
        output_clips = [video.subclip(start, end) for start, end in non_silent_segments]
        final_clip = concatenate_videoclips(output_clips)
        final_clip.write_videofile(output_filename, codec="libx264")
        final_clip.close()
    else:
        output_clips = [audio.subclip(start, end) for start, end in non_silent_segments]
        final_audio = concatenate_videoclips(output_clips)
        final_audio.write_audiofile(output_filename)
        final_audio.close()
    
    # Clean up
    if video is not None:
        video.close()
    audio.close()
    
    return output_filename

async def create_satisfy_montage(
    intro_path: str,
    clip_paths: List[str],
    target_duration: int = 60,
    crossfade_duration: float = 0.5
) -> str:
    """
    Create a satisfying video montage from multiple clips.
    
    Args:
        intro_path: Path to the intro clip
        clip_paths: List of paths to various clips
        target_duration: Target duration in seconds
        crossfade_duration: Duration of crossfade between clips
        
    Returns:
        Path to the output montage video
    """
    output_filename = f"outputs/satisfy_montage_{os.path.basename(intro_path)}"
    
    # Load the intro clip
    intro_clip = VideoFileClip(intro_path)
    clips = [intro_clip]
    
    # Load and process other clips
    for path in clip_paths:
        clip = VideoFileClip(path)
        
        # Apply effects (color boost, speed increase)
        # Increase saturation by 50%
        def boost_colors(image):
            hsv = np.array(image, dtype=np.float32) / 255
            hsv[:, :, 1] = hsv[:, :, 1] * 1.5  # Increase saturation
            hsv = np.clip(hsv * 255, 0, 255).astype(np.uint8)
            return hsv
            
        clip = clip.fl_image(boost_colors)
        
        # Speed up by 25%
        clip = clip.speedx(1.25)
        
        clips.append(clip)
    
    # Create the final montage with crossfades
    from moviepy.editor import concatenate_videoclips
    
    final_clip = concatenate_videoclips(
        clips, 
        method="compose",
        padding=-crossfade_duration,  # Negative padding creates crossfade
        bg_color=None
    )
    
    # Ensure the montage meets target duration
    current_duration = final_clip.duration
    if current_duration < target_duration:
        # Loop the montage to reach target duration
        repetitions = int(np.ceil(target_duration / current_duration))
        extended_clips = [final_clip] * repetitions
        final_clip = concatenate_videoclips(
            extended_clips,
            method="compose",
            padding=-crossfade_duration,
            bg_color=None
        )
        # Trim to exact target duration
        final_clip = final_clip.subclip(0, target_duration)
    
    # Write the final montage
    final_clip.write_videofile(output_filename, codec="libx264")
    
    # Clean up
    for clip in clips:
        clip.close()
    final_clip.close()
    
    return output_filename

async def render_final_video(
    clip_paths: List[str],
    arrangement: Optional[Dict[str, Any]] = None,
    intro_path: Optional[str] = None,
    outro_path: Optional[str] = None
) -> str:
    """
    Render a final video from multiple clips with optional intro and outro.
    
    Args:
        clip_paths: List of paths to clips
        arrangement: Dictionary with ordering and timing info
        intro_path: Path to intro clip (optional)
        outro_path: Path to outro clip (optional)
        
    Returns:
        Path to the final rendered video
    """
    output_filename = f"outputs/final_render_{os.path.basename(clip_paths[0])}"
    
    # Load all clips
    clips = [VideoFileClip(path) for path in clip_paths]
    
    # Add intro if provided
    if intro_path:
        intro_clip = VideoFileClip(intro_path)
        clips.insert(0, intro_clip)
    
    # Add outro if provided
    if outro_path:
        outro_clip = VideoFileClip(outro_path)
        clips.append(outro_clip)
    
    # Apply arrangement if provided
    if arrangement:
        # Rearrange clips based on arrangement
        arranged_clips = []
        for item in arrangement.get("sequence", []):
            clip_index = item.get("clip_index")
            start_time = item.get("start_time", 0)
            end_time = item.get("end_time")
            
            if 0 <= clip_index < len(clips):
                if end_time:
                    arranged_clips.append(clips[clip_index].subclip(start_time, end_time))
                else:
                    arranged_clips.append(clips[clip_index].subclip(start_time))
        
        # Replace clips with arranged clips if any
        if arranged_clips:
            # Close original clips
            for clip in clips:
                clip.close()
            clips = arranged_clips
    
    # Concatenate all clips
    final_clip = concatenate_videoclips(clips)
    
    # Write the final video
    final_clip.write_videofile(output_filename, codec="libx264")
    
    # Clean up
    for clip in clips:
        clip.close()
    final_clip.close()
    
    return output_filename

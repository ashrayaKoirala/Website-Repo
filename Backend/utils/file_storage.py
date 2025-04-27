import os
import shutil
from typing import List, Optional
from fastapi import UploadFile

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

async def save_upload(file: Optional[UploadFile], directory: str = "uploads") -> Optional[str]:
    """
    Save an uploaded file to the specified directory.
    
    Args:
        file: The uploaded file
        directory: Directory to save the file in
        
    Returns:
        Path to the saved file or None if no file was provided
    """
    if not file:
        return None
        
    # Create directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)
    
    # Generate file path
    file_path = os.path.join(directory, file.filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Reset file pointer for potential reuse
    await file.seek(0)
    
    return file_path

def get_file_path(filename: str) -> Optional[str]:
    """
    Get the full path to a file by its filename.
    
    Args:
        filename: Name of the file
        
    Returns:
        Full path to the file if found, None otherwise
    """
    # Check uploads directory
    uploads_path = os.path.join("uploads", filename)
    if os.path.exists(uploads_path):
        return uploads_path
    
    # Check outputs directory
    outputs_path = os.path.join("outputs", filename)
    if os.path.exists(outputs_path):
        return outputs_path
    
    return None

def list_files(file_type: Optional[str] = None) -> List[dict]:
    """
    List all files in storage directories.
    
    Args:
        file_type: Optional filter by file extension
        
    Returns:
        List of file info dictionaries
    """
    files = []
    
    # List files in uploads directory
    for filename in os.listdir("uploads"):
        if file_type and not filename.endswith(f".{file_type}"):
            continue
            
        file_path = os.path.join("uploads", filename)
        file_info = {
            "name": filename,
            "path": file_path,
            "size": os.path.getsize(file_path),
            "modified": os.path.getmtime(file_path),
            "directory": "uploads"
        }
        files.append(file_info)
    
    # List files in outputs directory
    for filename in os.listdir("outputs"):
        if file_type and not filename.endswith(f".{file_type}"):
            continue
            
        file_path = os.path.join("outputs", filename)
        file_info = {
            "name": filename,
            "path": file_path,
            "size": os.path.getsize(file_path),
            "modified": os.path.getmtime(file_path),
            "directory": "outputs"
        }
        files.append(file_info)
    
    # Sort by modification time (newest first)
    files.sort(key=lambda x: x["modified"], reverse=True)
    
    return files

def delete_file(filename: str) -> bool:
    """
    Delete a file by its filename.
    
    Args:
        filename: Name of the file
        
    Returns:
        True if file was deleted, False otherwise
    """
    file_path = get_file_path(filename)
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
        return True
    
    return False

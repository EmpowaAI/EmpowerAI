# routes/__init__.py
from . import digital_twin
from . import simulation
from . import cv_analysis
from . import cv_analysis_file
from . import interview
from . import chat
from . import digital_twin_chat  # Add this line

__all__ = [
    'digital_twin',
    'simulation', 
    'cv_analysis',
    'cv_analysis_file',
    'interview',
    'chat',
    'digital_twin_chat'  # Add this line
]
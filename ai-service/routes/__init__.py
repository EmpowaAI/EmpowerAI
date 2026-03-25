# routes/__init__.py
from . import digital_twin
from . import simulation
from . import cv_analysis
from . import cv_analysis_file
from . import cv_revamp
from . import interview
from . import chat
from . import twin
# from . import digital_twin_chat  # Comment this out or remove it
__all__ = [
    'digital_twin',
    'simulation', 
    'cv_analysis',
    'cv_analysis_file',
    'cv_revamp',
    'interview',
    'chat',
     'twin',  # Add this
    # 'digital_twin_chat'  # Remove this
]
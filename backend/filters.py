"""
Custom Jinja2 filters and template utilities for Smart AI Financial Analyzer
"""

from datetime import datetime
from typing import Optional, Union

def format_currency(value: Union[float, int, str]) -> str:
    """
    Format a number as Indian Rupees
    
    Args:
        value: Number to format
        
    Returns:
        Formatted currency string (e.g., "₹ 1,23,456.78")
    """
    if isinstance(value, str):
        try:
            value = float(value)
        except ValueError:
            return "₹ 0.00"
    
    # Format with Indian numbering system (e.g., 1,23,456.78)
    # First, separate integer and decimal parts
    integer_part = int(value)
    decimal_part = int(round((value - integer_part) * 100))
    
    # Format integer part with commas for thousands
    s = str(integer_part)
    if len(s) > 3:
        # Add first comma after 3 digits from right
        s = s[:-3] + ',' + s[-3:]
        
        # Add remaining commas after every 2 digits
        i = len(s) - 5
        while i > 0:
            s = s[:i] + ',' + s[i:]
            i -= 2
    
    # Format decimal part with leading zero if needed
    decimal_str = f"{decimal_part:02d}"
    
    # Combine with Rupee symbol
    return f"₹ {s}.{decimal_str}"

def format_date(value: Union[datetime, str], format_str: str = "%d %b, %Y") -> str:
    """
    Format a date or datetime object
    
    Args:
        value: Date to format
        format_str: Format string (default: "DD Mon, YYYY")
        
    Returns:
        Formatted date string
    """
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            try:
                # Try parsing common date formats
                for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%d/%m/%Y", "%m/%d/%Y"):
                    try:
                        value = datetime.strptime(value, fmt)
                        break
                    except ValueError:
                        continue
            except Exception:
                return value
    
    if isinstance(value, datetime):
        return value.strftime(format_str)
    
    return str(value)

def truncate(value: str, length: int = 100, ellipsis: str = '...') -> str:
    """
    Truncate a long string
    
    Args:
        value: String to truncate
        length: Maximum length
        ellipsis: String to append if truncated
        
    Returns:
        Truncated string
    """
    if not isinstance(value, str):
        value = str(value)
    
    if len(value) <= length:
        return value
    
    return value[:length].rstrip() + ellipsis

def format_percentage(value: Union[float, int, str]) -> str:
    """
    Format a number as percentage
    
    Args:
        value: Number to format (e.g., 0.5 for 50%)
        
    Returns:
        Formatted percentage string with % symbol
    """
    if isinstance(value, str):
        try:
            value = float(value)
        except ValueError:
            return "0.00%"
    
    # If value is already in percentage form (e.g., 50 for 50%)
    if value > 1 and value <= 100:
        return f"{value:.2f}%"
    
    # If value is in decimal form (e.g., 0.5 for 50%)
    return f"{value * 100:.2f}%"

def format_file_size(size_bytes: Union[int, float]) -> str:
    """
    Format file size in bytes to human-readable format
    
    Args:
        size_bytes: File size in bytes
        
    Returns:
        Formatted file size (e.g., "1.23 MB")
    """
    if size_bytes < 1024:
        return f"{size_bytes} bytes"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

def setup_jinja_filters(app):
    """
    Register custom filters with the Jinja2 environment
    
    Args:
        app: FastAPI application instance with Jinja2Templates
    """
    if hasattr(app, 'jinja_env'):
        jinja_env = app.jinja_env
    elif hasattr(app, 'state') and hasattr(app.state, 'templates'):
        jinja_env = app.state.templates.env
    else:
        # Try to access through templates attribute for FastAPI app
        jinja_env = app.templates.env
    
    jinja_env.filters['currency'] = format_currency
    jinja_env.filters['date'] = format_date
    jinja_env.filters['truncate'] = truncate
    jinja_env.filters['percentage'] = format_percentage
    jinja_env.filters['filesize'] = format_file_size
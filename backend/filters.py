"""
Custom Jinja2 filters and template utilities
"""
import locale
from datetime import datetime

# Set locale for Indian number formatting
try:
    locale.setlocale(locale.LC_ALL, 'en_IN.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'en_IN')
    except:
        locale.setlocale(locale.LC_ALL, '')  # Fallback to default locale


def format_currency(value):
    """
    Format a number as Indian Rupees
    
    Args:
        value: Number to format
        
    Returns:
        Formatted currency string (e.g., "1,23,456.78")
    """
    if value is None:
        return "0"
    
    try:
        value = float(value)
        return locale.format_string("%.2f", value, grouping=True)
    except (ValueError, TypeError):
        return str(value)


def format_date(value, format_str="%d %b, %Y"):
    """
    Format a date or datetime object
    
    Args:
        value: Date to format
        format_str: Format string (default: "DD Mon, YYYY")
        
    Returns:
        Formatted date string
    """
    if value is None:
        return ""
    
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            try:
                value = datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")
            except (ValueError, TypeError):
                return value
    
    if isinstance(value, datetime):
        return value.strftime(format_str)
    
    return str(value)


def truncate(value, length=100, ellipsis='...'):
    """
    Truncate a long string
    
    Args:
        value: String to truncate
        length: Maximum length
        ellipsis: String to append if truncated
        
    Returns:
        Truncated string
    """
    if value is None:
        return ""
    
    s = str(value)
    if len(s) <= length:
        return s
    
    return s[:length] + ellipsis


def setup_jinja_filters(app):
    """
    Register custom filters with the Jinja2 environment
    
    Args:
        app: FastAPI application instance
    """
    app.jinja_env.filters["format_currency"] = format_currency
    app.jinja_env.filters["format_date"] = format_date
    app.jinja_env.filters["truncate"] = truncate
from datetime import date, datetime, timezone
from typing import Union
import calendar


def get_utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)



def parse_date(d: Union[str, date, datetime]) -> date:
    """Parse string or datetime into a date object."""
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d
    if isinstance(d, str):
        # Support multiple standard formats
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d %b %Y", "%d %B %Y"):
            try:
                return datetime.strptime(d, fmt).date()
            except ValueError:
                pass
        # Fallback to date.fromisoformat
        return date.fromisoformat(d.split("T")[0])
    raise ValueError(f"Cannot parse date from value: {d}")


def format_readable_date(d: Union[str, date, datetime]) -> str:
    """Format date into '18 Sep 2026'."""
    parsed = parse_date(d)
    return parsed.strftime("%d %b %Y")


def format_iso_date(d: Union[str, date, datetime]) -> str:
    """Format date into 'YYYY-MM-DD'."""
    parsed = parse_date(d)
    return parsed.isoformat()


def add_months_to_date(source_date: date, months: int) -> date:
    """Accurately add months to a date handling different month lengths and leap years."""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

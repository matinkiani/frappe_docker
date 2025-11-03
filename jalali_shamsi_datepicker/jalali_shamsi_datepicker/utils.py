# -*- coding: utf-8 -*-
"""
Utility functions for Jalali Shamsi Datepicker
"""

from datetime import date, datetime
import jdatetime


def to_shamsi(gregorian_date):
    """
    Convert a Gregorian date to Shamsi (Jalali) date string.

    Args:
        gregorian_date: A Python date or datetime object in Gregorian calendar

    Returns:
        str: Shamsi date in format "YYYY/MM/DD" or "YYYY/MM/DD HH:MM:SS" for datetime
        Returns empty string if input is None or invalid
    """
    if not gregorian_date:
        return ""

    try:
        # Handle both date and datetime objects
        if isinstance(gregorian_date, datetime):
            # Convert datetime to Jalali
            jalali_dt = jdatetime.datetime.fromgregorian(datetime=gregorian_date)
            return jalali_dt.strftime("%Y/%m/%d %H:%M:%S")
        elif isinstance(gregorian_date, date):
            # Convert date to Jalali
            jalali_date = jdatetime.date.fromgregorian(date=gregorian_date)
            return jalali_date.strftime("%Y/%m/%d")
        else:
            # Try to parse string input
            if isinstance(gregorian_date, str):
                # Try parsing as datetime first
                try:
                    dt = datetime.strptime(gregorian_date, "%Y-%m-%d %H:%M:%S")
                    jalali_dt = jdatetime.datetime.fromgregorian(datetime=dt)
                    return jalali_dt.strftime("%Y/%m/%d %H:%M:%S")
                except ValueError:
                    # Try parsing as date
                    try:
                        dt = datetime.strptime(gregorian_date, "%Y-%m-%d")
                        jalali_date = jdatetime.date.fromgregorian(date=dt.date())
                        return jalali_date.strftime("%Y/%m/%d")
                    except ValueError:
                        pass

            return ""
    except Exception as e:
        # Log error if needed, but return empty string to prevent template errors
        print(f"Error converting date to Shamsi: {e}")
        return ""

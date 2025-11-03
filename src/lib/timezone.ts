/**
 * Timezone utilities for converting UTC times to local timezone
 */

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get the user's timezone abbreviation (e.g., "PST", "EST", "CET")
 */
export function getTimezoneAbbreviation(): string {
  const date = new Date()
  const timeZoneString = date.toLocaleTimeString('en-US', { 
    timeZoneName: 'short' 
  })
  
  // Extract the timezone abbreviation from the string
  const parts = timeZoneString.split(' ')
  return parts[parts.length - 1] || 'Local'
}

/**
 * Get the timezone offset from UTC in hours
 */
export function getTimezoneOffset(): number {
  const offset = new Date().getTimezoneOffset()
  return -offset / 60 // Convert to hours and invert (JS returns negative for positive offsets)
}

/**
 * Get a human-readable timezone offset (e.g., "UTC+2", "UTC-5")
 */
export function getTimezoneOffsetString(): string {
  const offset = getTimezoneOffset()
  if (offset === 0) return 'UTC'
  const sign = offset >= 0 ? '+' : ''
  return `UTC${sign}${offset}`
}

/**
 * Convert a UTC time string (HH:MM:SS) to local time
 * @param utcTime - Time in UTC format (e.g., "14:30:00")
 * @returns Local time string (e.g., "09:30 AM")
 */
export function convertUTCToLocal(utcTime: string): string {
  const [hours, minutes] = utcTime.split(':').map(Number)
  
  // Create a date object with today's date and the UTC time
  const utcDate = new Date()
  utcDate.setUTCHours(hours, minutes, 0, 0)
  
  // Format to local time
  return utcDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Convert a UTC time string to local time with 24-hour format
 * @param utcTime - Time in UTC format (e.g., "14:30:00")
 * @returns Local time string in 24h format (e.g., "09:30")
 */
export function convertUTCToLocal24h(utcTime: string): string {
  const [hours, minutes] = utcTime.split(':').map(Number)
  
  // Create a date object with today's date and the UTC time
  const utcDate = new Date()
  utcDate.setUTCHours(hours, minutes, 0, 0)
  
  // Format to local time in 24h
  return utcDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Convert a time range from UTC to local
 * @param startTime - Start time in UTC (e.g., "14:00:00")
 * @param endTime - End time in UTC (e.g., "15:00:00")
 * @returns Formatted local time range (e.g., "9:00 AM - 10:00 AM PST")
 */
export function convertTimeRangeToLocal(startTime: string, endTime: string): string {
  const localStart = convertUTCToLocal(startTime)
  const localEnd = convertUTCToLocal(endTime)
  const timezone = getTimezoneAbbreviation()
  
  return `${localStart} - ${localEnd} ${timezone}`
}

/**
 * Convert a time range from UTC to local with timezone offset
 * @param startTime - Start time in UTC (e.g., "14:00:00")
 * @param endTime - End time in UTC (e.g., "15:00:00")
 * @returns Formatted local time range with offset (e.g., "9:00 AM - 10:00 AM (UTC-5)")
 */
export function convertTimeRangeToLocalWithOffset(startTime: string, endTime: string): string {
  const localStart = convertUTCToLocal(startTime)
  const localEnd = convertUTCToLocal(endTime)
  const offset = getTimezoneOffsetString()
  
  return `${localStart} - ${localEnd} (${offset})`
}

/**
 * Format a Date object to local time
 * @param date - Date object
 * @returns Formatted local time (e.g., "2:30 PM")
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a Date object to local date and time
 * @param date - Date object
 * @returns Formatted local date and time (e.g., "Nov 3, 2:30 PM")
 */
export function formatLocalDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Check if the user's timezone is different from UTC
 */
export function isNonUTCTimezone(): boolean {
  return getTimezoneOffset() !== 0
}

/**
 * Get a display-friendly timezone info string
 * @returns String like "Your timezone: PST (UTC-8)" or "UTC"
 */
export function getTimezoneDisplayString(): string {
  if (!isNonUTCTimezone()) {
    return 'UTC'
  }
  
  const abbr = getTimezoneAbbreviation()
  const offset = getTimezoneOffsetString()
  
  return `${abbr} (${offset})`
}


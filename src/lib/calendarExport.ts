// Calendar Export Utility - ICS Format for Google/Apple Calendar

import { PlannerEvent } from '@/types/planner';

// Generate a unique UID for calendar events
const generateUID = (eventId: string): string => {
  return `${eventId}@owambe-planner.app`;
};

// Format date to ICS format (YYYYMMDDTHHMMSS)
const formatICSDate = (dateString: string, time?: string): string => {
  const date = new Date(dateString);
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    date.setHours(12, 0, 0, 0); // Default to noon
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}T${hour}${minute}00`;
};

// Escape special characters in ICS values
const escapeICSValue = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// Generate ICS file content
export const generateICSContent = (event: PlannerEvent): string => {
  const uid = generateUID(event.id);
  const dtStart = formatICSDate(event.date, event.time);
  
  // Default event duration: 4 hours
  const endDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    endDate.setHours((hours || 0) + 4, minutes || 0, 0, 0);
  } else {
    endDate.setHours(16, 0, 0, 0);
  }
  const dtEnd = formatICSDate(endDate.toISOString());
  
  const now = new Date();
  const dtstamp = formatICSDate(now.toISOString());
  
  const location = [event.venue, event.location].filter(Boolean).join(', ');
  const description = event.description || `${event.title} - Planned with Owambe Planner`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Owambe Planner//Event Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSValue(event.title)}`,
    location ? `LOCATION:${escapeICSValue(location)}` : null,
    `DESCRIPTION:${escapeICSValue(description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return icsContent;
};

// Download ICS file
export const downloadICSFile = (event: PlannerEvent): void => {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate Google Calendar URL
export const generateGoogleCalendarURL = (event: PlannerEvent): string => {
  const startDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    startDate.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    startDate.setHours(12, 0, 0, 0);
  }
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 4);
  
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
  };
  
  const location = [event.venue, event.location].filter(Boolean).join(', ');
  const description = event.description || `Planned with Owambe Planner`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: description,
    location: location,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

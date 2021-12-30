import { dateToString } from './date.js';

export const recurEventToEvent = (recurEvent) => {
    const eventDate = dateToString(recurEvent.start);
    if (recurEvent.title === "Mittagessen") {
        return { 
            eventStart: `${eventDate}T12:00`,
            eventEnd: `${eventDate}T13:00`
        };
    } else {
        return { 
            eventStart: `${eventDate}T18:00`,
            eventEnd: `${eventDate}T19:00`
        };
    }
}
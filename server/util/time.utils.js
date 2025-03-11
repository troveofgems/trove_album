import {Temporal} from "@js-temporal/polyfill";

export const markTimestamp = () => Temporal.Now.instant();

export const temporalizeTimestamp = (
    timestampToTemporalize,
    formatOptions = {
        dateStyle: 'long',
        timeStyle: 'full'
    },
    defaultLocale = "en-US"
) => {
    const // Function Constants That Should Never Be Changed; Only Deprecated In Favor of Better Logic
        PAD = 2,
        PAD_POSITION = '0';

    let // At some point look into timestamp.toISOString() rather than the following... Note:
        /*
        * toISOString() does not currently work with the Temporal.PDT.from() method. Will run a few more
        * tests to see if I can't find a correct call to make and remove vars [year-datestring].
        *    //  2025-02-25T21:48:37.953Z
        *    // '2024-08-27T00:00:00'
        *    // '2025-01-25T11:38:14'
        * **/
        year = timestampToTemporalize.getFullYear(),
        month = timestampToTemporalize.getMonth().toString().padStart(PAD, PAD_POSITION),
        day = timestampToTemporalize.getDate().toString().padStart(PAD, PAD_POSITION),
        hours = timestampToTemporalize.getHours().toString().padStart(PAD, PAD_POSITION),
        minutes = timestampToTemporalize.getMinutes().toString().padStart(PAD, PAD_POSITION),
        seconds = timestampToTemporalize.getSeconds().toString().padStart(PAD, PAD_POSITION),
        dateString= `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
        temporalizedDate= Temporal.PlainDateTime.from(dateString);

    return temporalizedDate.toLocaleString(defaultLocale, formatOptions);
}
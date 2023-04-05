import * as path from "path";
import dir from "datadir";

const dataDir = path.join(dir("data") as string, "./entam");

async function exists(filename: string | URL): Promise<boolean> {
  try {
    await Deno.stat(filename);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      console.error(error);
      return false;
    }
  }
}

function getRelativeTimeString(relativeDate: Date) {
  const rtf = new Intl.RelativeTimeFormat(navigator.language, {
    numeric: "auto",
  });
  const deltaUnix = relativeDate.getTime() - new Date().getTime();
  const deltaSeconds = Math.round(deltaUnix / 1000);
  if (Math.abs(deltaSeconds) < 60) return rtf.format(deltaSeconds, "seconds");
  const deltaMinutes = Math.round(deltaSeconds / 60);
  if (Math.abs(deltaMinutes) < 60) return rtf.format(deltaMinutes, "minutes");
  const deltaHours = Math.round(deltaMinutes / 60);
  if (Math.abs(deltaHours) < 24) return rtf.format(deltaHours, "hours");
  const deltaDays = Math.round(deltaHours / 24);
  if (Math.abs(deltaDays) < 7) return rtf.format(deltaDays, "days");
  const deltaWeeks = Math.round(deltaDays / 7);
  if (Math.abs(deltaWeeks) < 4) return rtf.format(deltaWeeks, "weeks");
  const deltaMonths = Math.round(deltaWeeks / 4);
  if (Math.abs(deltaMonths) < 12) return rtf.format(deltaMonths, "months");
  const deltaYears = Math.round(deltaMonths / 12);
  return rtf.format(deltaYears, "years");
}

export { dataDir, exists, getRelativeTimeString };

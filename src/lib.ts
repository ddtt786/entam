export async function exists(filename: string | URL): Promise<boolean> {
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

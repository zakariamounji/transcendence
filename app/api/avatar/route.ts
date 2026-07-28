import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { cookies } from "next/headers"

const MAX_BYTES = 2 * 1024 * 1024

// the file is named after its type, never after what the browser called it
const extensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
}

function fail(message: string, status: number): Response {
  return Response.json({ message }, { status })
}

/**
 * Writes an uploaded picture into public/avatars and answers with the path it can be
 * read from. Nothing is written to the database here, the browser does that with
 * better-auth once it has the path.
 */
export async function POST(request: Request): Promise<Response> {

  // a signed out visitor has no business leaving files on the disk
  const store = await cookies()
  const session =
    store.get("__Secure-better-auth.session_token")?.value ??
    store.get("better-auth.session_token")?.value

  if (!session) {
    return fail("You have to be signed in to change your picture.", 401)
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return fail("Expected a picture under the file field.", 400)
  }

  const extension = extensions[file.type]

  if (!extension) {
    return fail("Only PNG, JPEG, WEBP and GIF pictures are accepted.", 415)
  }

  if (file.size > MAX_BYTES) {
    return fail("The picture cannot pass 2 MB.", 413)
  }

  const name = `${randomUUID()}.${extension}`
  const directory = join(process.cwd(), "public", "avatars")

  try {
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, name), Buffer.from(await file.arrayBuffer()))
  } catch {
    return fail("The picture could not be saved.", 500)
  }

  return Response.json({ path: `/avatars/${name}` })
}

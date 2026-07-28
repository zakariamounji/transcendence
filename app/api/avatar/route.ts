import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { MAX_BYTES } from "@/lib/avatar"
import { serverFetch } from "@/lib/server-fetch"
import type { ProfileInfo } from "@/interfaces"

const extensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
}

function fail(message: string, status: number): Response {
  return Response.json({ message }, { status })
}

export async function POST(request: Request): Promise<Response> {

  const userRes = await serverFetch("/user/me")
  const user: ProfileInfo = (await userRes.json()).data

  if (!user) {
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

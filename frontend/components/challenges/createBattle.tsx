import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"

export default function CreateBattlePrompt({
  challengeId
}: {
  challengeId: string
}): React.JSX.Element {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [mode, setMode] = useState<"DUO" | "SOLO" | "GROUP">("DUO")
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC")
  const [roomCode, setRoomCode] = useState("")

  const handleCreateBattle = async () => {

    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/battles/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        mode: mode,
        visibility: visibility,
        challengeId: challengeId,
        roomCode: roomCode
      })
    }).then(async (res) => {
      if (res.ok) {
        console.log(await res.json())
      } else {
        alert((await res.json()).message || "Failed to create battle")
      }
    }).finally(() => {
      router.refresh()
      setLoading(false)
      setOpen(false)
    })

  }

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>

        <DialogTrigger
          render={
          <Button
            className="flex-1 h-12 min-w-full! shrink-0"
            // onClick={handleCreateBattle}
          >
            <Play className="w-4 h-4 mr-2" />
            Create Battle
          </Button>
          }
        />

        <DialogContent className="sm:max-w-lg">

          <DialogHeader>
            <DialogTitle> Create Battle </DialogTitle>
            <DialogDescription>
              Make a new battle!
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>

            <Field>
              <Label> Mode </Label>
              
              <FieldGroup className="gap-3">
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-hard-disks-ljj-checkboxz"
                    name="finder-pref-9k2-hard-disks-ljj-checkboxz"
                    defaultChecked
                    onCheckedChange={(checked) => checked && setMode("SOLO")}
                    checked={mode === "SOLO"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-hard-disks-ljj-checkboxz"
                    className="font-normal"
                  >
                    SOLO (1 player)
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-external-disks-1yg-checkboxb"
                    name="finder-pref-9k2-external-disks-1yg-checkboxb"
                    onCheckedChange={(checked) => checked && setMode("DUO")}
                    checked={mode === "DUO"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-external-disks-1yg-checkboxb"
                    className="font-normal"
                  >
                    DUO (2 players)
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-cds-dvds-fzt-checkbox4"
                    name="finder-pref-9k2-cds-dvds-fzt-checkbox4"
                    onCheckedChange={(checked) => checked && setMode("GROUP")}
                    checked={mode === "GROUP"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox4"
                    className="font-normal"
                  >
                    GROUP (8 players)
                  </FieldLabel>
                </Field>
              </FieldGroup>

            </Field>

            <Field>
              <Label> Visibility </Label>

              <FieldGroup className="gap-3 grid grid-cols-2">
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-external-disks-1yg-checkbox6"
                    name="finder-pref-9k2-external-disks-1yg-checkbox6"
                    onCheckedChange={(checked) => checked && setVisibility("PUBLIC")}
                    checked={visibility === "PUBLIC"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-external-disks-1yg-checkbox6"
                    className="font-normal"
                  >
                    Public
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-cds-dvds-fzt-checkboxvr"
                    name="finder-pref-9k2-cds-dvds-fzt-checkboxvr"
                    onCheckedChange={(checked) => checked && setVisibility("PRIVATE")}
                    checked={visibility === "PRIVATE"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-cds-dvds-fzt-checkboxvr"
                    className="font-normal"
                  >
                    Private
                  </FieldLabel>
                </Field>
              </FieldGroup>

            </Field>

            { visibility === "PRIVATE" && (
              <Field>
                <FieldLabel htmlFor="input"> Room code </FieldLabel>
                <InputGroup className="h-auto">
                  <InputGroupInput
                    id="input"
                    placeholder="123456"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="h-10"
                />
              </InputGroup>
            </Field> )}

          </FieldGroup>

          <DialogFooter>
            <DialogClose className="h-11" render={
                <Button variant="outline" className="bg-gray-200 hover:bg-gray-200 hover:text-black text-black">
                  Cancel
                </Button>
              }
            />
            <Button className="h-11" onClick={handleCreateBattle} disabled={loading}>
              {loading ? "Creating..." : "Create battle"}
            </Button>
          </DialogFooter>

        </DialogContent>

      </form>
    </Dialog>
  )
}
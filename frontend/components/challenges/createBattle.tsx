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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { useId, useState } from "react"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"

export default function CreateBattlePrompt({
  challengeId
}: {
  challengeId: string
}): React.JSX.Element {

  const router = useRouter()

  // One prompt is rendered per challenge card, so the ids have to be per instance
  const fieldId = useId()

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
      if (!res.ok) {
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
                    id={`${fieldId}-mode-solo`}
                    name={`${fieldId}-mode-solo`}
                    onCheckedChange={(checked) => checked && setMode("SOLO")}
                    checked={mode === "SOLO"}
                  />
                  <FieldLabel
                    htmlFor={`${fieldId}-mode-solo`}
                    className="font-normal"
                  >
                    SOLO (1 player)
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`${fieldId}-mode-duo`}
                    name={`${fieldId}-mode-duo`}
                    onCheckedChange={(checked) => checked && setMode("DUO")}
                    checked={mode === "DUO"}
                  />
                  <FieldLabel
                    htmlFor={`${fieldId}-mode-duo`}
                    className="font-normal"
                  >
                    DUO (2 players)
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`${fieldId}-mode-group`}
                    name={`${fieldId}-mode-group`}
                    onCheckedChange={(checked) => checked && setMode("GROUP")}
                    checked={mode === "GROUP"}
                  />
                  <FieldLabel
                    htmlFor={`${fieldId}-mode-group`}
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
                    id={`${fieldId}-visibility-public`}
                    name={`${fieldId}-visibility-public`}
                    onCheckedChange={(checked) => checked && setVisibility("PUBLIC")}
                    checked={visibility === "PUBLIC"}
                  />
                  <FieldLabel
                    htmlFor={`${fieldId}-visibility-public`}
                    className="font-normal"
                  >
                    Public
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`${fieldId}-visibility-private`}
                    name={`${fieldId}-visibility-private`}
                    onCheckedChange={(checked) => checked && setVisibility("PRIVATE")}
                    checked={visibility === "PRIVATE"}
                  />
                  <FieldLabel
                    htmlFor={`${fieldId}-visibility-private`}
                    className="font-normal"
                  >
                    Private
                  </FieldLabel>
                </Field>
              </FieldGroup>

            </Field>

            { visibility === "PRIVATE" && (
              <Field>
                <FieldLabel htmlFor={`${fieldId}-room-code`}> Room code </FieldLabel>
                <InputGroup className="h-auto">
                  <InputGroupInput
                    id={`${fieldId}-room-code`}
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
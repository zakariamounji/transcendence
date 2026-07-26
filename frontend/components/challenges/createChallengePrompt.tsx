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

export default function CreateChallengePrompt(): React.JSX.Element {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState<string>("To uppercase a string in C")
  const [description, setDescription] = useState<string>("Create a program that takes a string as input and converts it to uppercase using C programming language.")
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY")
  const [language, setLanguage] = useState<string>("C")

  const [output, setOutput] = useState<string>("")
  const [input, setInput] = useState<string>("")

  const languagesList = [
    "CPP",
    "C"
  ]

  const handleCreateChallenge = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    e.preventDefault()
    setLoading(true)

    if (title.length < 6 || description.length < 10 || input.length < 1 || output.length < 1
      || !languagesList.includes(language) || !["EASY", "MEDIUM", "HARD"].includes(difficulty)
    ) {
      alert("Please fill in all fields correctly.")
      setLoading(false)
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        description,
        slug: title.toLowerCase().replace(/ /g, "-"),
        difficulty,
        language,
        expReward: 6,
        subject: input,
        expectedOutput: output,
      })
    })

    if (res.ok) {
      alert("Challenge created successfully!")
      setOpen(false)
      setTitle("To uppercase a string in C")
      setDescription("Create a program that takes a string as input and converts it to uppercase using C programming language.")
      setInput("")
      setOutput("")
      setDifficulty("EASY")
      setLanguage("C")

      router.refresh()
    } else {
      alert((await res.json()).message || "Failed to create challenge.")
    }

    setLoading(false)
  }

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>

        <DialogTrigger
          render={
            <Button
              className="w-full max-full h-12 rounded-md text-[13px] font-medium cursor-pointer border border-gray-800"
              variant="default"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={14}
                color="white"
                strokeWidth={1.8}
              />
              Create New Challenge
            </Button>
          }
        />

        <DialogContent className="sm:max-w-lg">

          <DialogHeader>
            <DialogTitle> Create Challenge </DialogTitle>
            <DialogDescription>
              Make a new challenge and share it with the world! You can always edit it later.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>

            <Field>
              <Label htmlFor="title"> Title </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description"> Description </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10"
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> Full description about the challenge </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field>
              <Label> Difficulty </Label>
              
              <FieldGroup className="gap-3">
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-hard-disks-ljj-checkbox"
                    name="finder-pref-9k2-hard-disks-ljj-checkbox"
                    defaultChecked
                    onCheckedChange={(checked) => checked && setDifficulty("EASY")}
                    checked={difficulty === "EASY"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
                    className="font-normal"
                  >
                    EASY
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-external-disks-1yg-checkbox"
                    name="finder-pref-9k2-external-disks-1yg-checkbox"
                    onCheckedChange={(checked) => checked && setDifficulty("MEDIUM")}
                    checked={difficulty === "MEDIUM"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
                    className="font-normal"
                  >
                    MEDIUM
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="finder-pref-9k2-cds-dvds-fzt-checkbox"
                    name="finder-pref-9k2-cds-dvds-fzt-checkbox"
                    onCheckedChange={(checked) => checked && setDifficulty("HARD")}
                    checked={difficulty === "HARD"}
                  />
                  <FieldLabel
                    htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
                    className="font-normal"
                  >
                    HARD
                  </FieldLabel>
                </Field>
              </FieldGroup>

            </Field>

            <Field>
              <Label> Languages </Label>

              <FieldGroup className="gap-3 grid grid-cols-2">
                {languagesList.map((lang) => (
                    <Field orientation="horizontal" key={lang}>
                      <Checkbox
                        id={`finder-pref-9k2-${lang}-checkbox`}
                        name={`finder-pref-9k2-${lang}-checkbox`}
                        onCheckedChange={() => setLanguage(lang)}
                        checked={lang === language}
                      />
                      <FieldLabel
                        htmlFor={`finder-pref-9k2-${lang}-checkbox`}
                        className="font-normal"
                      >
                        {lang}
                      </FieldLabel>
                    </Field>
                ))}
              </FieldGroup>

            </Field>

            <Field>
              <FieldLabel htmlFor="input"> Program Input </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="input"
                  placeholder="hello world"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-10"
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> INPUT </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription> Your program's input, info: the input just ONE argument </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="output"> Program Output </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="output"
                  placeholder="HELLO WORLD"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="h-10"
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> OUTPUT </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription> Your program's output that should be the result of the input </FieldDescription>
            </Field>

          </FieldGroup>

          <DialogFooter>
            <DialogClose className="h-11" render={
                <Button variant="outline" className="bg-gray-200 hover:bg-gray-200 hover:text-black text-black">
                  Cancel
                </Button>
              }
            />
            <Button className="h-11" onClick={handleCreateChallenge} disabled={loading}>
              {loading ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>

        </DialogContent>

      </form>
    </Dialog>
  )
}
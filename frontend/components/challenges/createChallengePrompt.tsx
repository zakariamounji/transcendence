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

// The backend caps the reward, so it is not something the creator gets to pick
const EXP_REWARD = 6

export default function CreateChallengePrompt(): React.JSX.Element {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
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
        expReward: EXP_REWARD,
        subject: input,
        expectedOutput: output,
      })
    })

    if (res.ok) {
      alert("Challenge created successfully!")
      setOpen(false)
      setTitle("")
      setDescription("")
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
              <Label htmlFor="create-challenge-title"> Title </Label>
              <Input
                id="create-challenge-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="create-challenge-description"> Description </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="create-challenge-description"
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
                    id="create-challenge-difficulty-easy"
                    name="create-challenge-difficulty-easy"
                    onCheckedChange={(checked) => checked && setDifficulty("EASY")}
                    checked={difficulty === "EASY"}
                  />
                  <FieldLabel
                    htmlFor="create-challenge-difficulty-easy"
                    className="font-normal"
                  >
                    EASY
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="create-challenge-difficulty-medium"
                    name="create-challenge-difficulty-medium"
                    onCheckedChange={(checked) => checked && setDifficulty("MEDIUM")}
                    checked={difficulty === "MEDIUM"}
                  />
                  <FieldLabel
                    htmlFor="create-challenge-difficulty-medium"
                    className="font-normal"
                  >
                    MEDIUM
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="create-challenge-difficulty-hard"
                    name="create-challenge-difficulty-hard"
                    onCheckedChange={(checked) => checked && setDifficulty("HARD")}
                    checked={difficulty === "HARD"}
                  />
                  <FieldLabel
                    htmlFor="create-challenge-difficulty-hard"
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
                        id={`create-challenge-language-${lang}`}
                        name={`create-challenge-language-${lang}`}
                        onCheckedChange={() => setLanguage(lang)}
                        checked={lang === language}
                      />
                      <FieldLabel
                        htmlFor={`create-challenge-language-${lang}`}
                        className="font-normal"
                      >
                        {lang}
                      </FieldLabel>
                    </Field>
                ))}
              </FieldGroup>

            </Field>

            <Field>
              <FieldLabel htmlFor="create-challenge-input"> Program Input </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="create-challenge-input"
                  placeholder="hello world"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-10"
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> INPUT </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription> Your program&apos;s input, info: the input is just ONE argument </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="create-challenge-output"> Program Output </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id="create-challenge-output"
                  placeholder="HELLO WORLD"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="h-10"
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> OUTPUT </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription> Your program&apos;s output, the expected result for that input </FieldDescription>
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
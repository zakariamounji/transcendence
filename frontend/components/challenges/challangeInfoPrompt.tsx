import type { Challenge } from "@/interfaces"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field"
import { Label } from "../ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../ui/input-group"
import { useId } from "react"

export default function ChallengeInfoPrompt({
  challenge
}: {
  challenge: Challenge
}): React.JSX.Element {

  // One prompt is rendered per challenge card, so the ids have to be per instance
  const fieldId = useId()

  return (
    <Dialog>
      <form>

        <DialogTrigger
          render={
            <Button
              variant="secondary"
              className="mt-2 w-full h-10 border border-border hover:bg-accent/50 hover:text-card-foreground transition-colors"
            >
              More details
            </Button>
          }
        />

        <DialogContent className="sm:max-w-lg">

          <DialogHeader>
            <DialogTitle> {challenge.title} </DialogTitle>
            <DialogDescription>
              {challenge.description}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>

            <Field>
              <Label> Difficulty </Label>
              <FieldDescription>
                {challenge.difficulty}
              </FieldDescription>
            </Field>

            <Field>
              <Label> Language </Label>
              <FieldDescription>
                {challenge.language}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${fieldId}-input`}> Program Input </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id={`${fieldId}-input`}
                  value={challenge.subject}
                  className="h-10"
                  disabled
                />
                <InputGroupAddon align="block-start">
                  <InputGroupText> INPUT </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription> Your program&apos;s input, info: the input is just ONE argument </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${fieldId}-output`}> Program Output </FieldLabel>
              <InputGroup className="h-auto">
                <InputGroupInput
                  id={`${fieldId}-output`}
                  value={challenge.expectedOutput}
                  className="h-10"
                  disabled
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
                  close
                </Button>
              }
            />
          </DialogFooter>

        </DialogContent>

      </form>
    </Dialog>
  )
}
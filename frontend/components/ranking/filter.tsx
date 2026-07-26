"use client"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { FilterAddIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Field, FieldGroup, FieldLabel } from "../ui/field"
import { Checkbox } from "../ui/checkbox"

export function FilterDrawer({
  setStatus,
  status,
  winRateFilter,
  setWinRateFilter
}: {
  setStatus: React.Dispatch<React.SetStateAction<"OFFLINE" | "ONLINE" | "IN_BATTLE" | null>>
  status: "OFFLINE" | "ONLINE" | "IN_BATTLE" | null
  winRateFilter: "HIGH" | "LOW" | null
  setWinRateFilter: React.Dispatch<React.SetStateAction<"HIGH" | "LOW" | null>>
}): React.JSX.Element {
  return (
    <Drawer showSwipeHandle>

      <DrawerTrigger
        render={<Button className="flex items-center justify-center h-11 w-11 rounded-sm bg-white cursor-pointer border hover:bg-white border-gray-400 hover:border-gray-300">
          <HugeiconsIcon
            icon={FilterAddIcon}
            size={18}
            color="black"
            strokeWidth={1.5}
          />
        </Button>}
      />

      <DrawerContent>

        <DrawerHeader>
          <DrawerTitle className="text-black"> Filter </DrawerTitle>
          <DrawerDescription> Select your preferences </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 p-4">
          <div className="rounded-md max-h-max bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full p-4 group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full">

            <p className="text-sm font-medium text-muted-foreground"> Status </p>

            <FieldGroup className="gap-2 flex items-center mt-3">
              <Field orientation="horizontal">
                <Checkbox
                  id="finder-pref-9k2-hard-disks-ljj-checkbox"
                  name="finder-pref-9k2-hard-disks-ljj-checkbox"
                  defaultChecked
                  onCheckedChange={() => setStatus(status === "OFFLINE" ? null : "OFFLINE")}
                  checked={status === "OFFLINE"}
                />
                <FieldLabel
                  htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
                  className="font-normal"
                >
                  OFFLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="finder-pref-9k2-external-disks-1yg-checkbox"
                  name="finder-pref-9k2-external-disks-1yg-checkbox"
                  onCheckedChange={() => setStatus(status === "ONLINE" ? null : "ONLINE")}
                  checked={status === "ONLINE"}
                />
                <FieldLabel
                  htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
                  className="font-normal"
                >
                  ONLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="finder-pref-9k2-cds-dvds-fzt-checkbox"
                  name="finder-pref-9k2-cds-dvds-fzt-checkbox"
                  onCheckedChange={() => setStatus(status === "IN_BATTLE" ? null : "IN_BATTLE")}
                  checked={status === "IN_BATTLE"}
                />
                <FieldLabel
                  htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
                  className="font-normal"
                >
                  IN_BATTLE
                </FieldLabel>
              </Field>
            </FieldGroup>

            <p className="text-sm font-medium text-muted-foreground mt-6"> Win & Loss </p>

            <FieldGroup className="gap-2 flex items-center mt-3">
              <Field orientation="horizontal">
                <Checkbox
                  id="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  name="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  defaultChecked
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "HIGH" ? null : "HIGH")}
                  checked={winRateFilter === "HIGH"}
                />
                <FieldLabel
                  htmlFor="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  className="font-normal"
                >
                  High Win
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="finder-pref-9k2er-external-disks-1yg-checkbox"
                  name="finder-pref-9k2er-external-disks-1yg-checkbox"
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "LOW" ? null : "LOW")}
                  checked={winRateFilter === "LOW"}
                />
                <FieldLabel
                  htmlFor="finder-pref-9k2er-external-disks-1yg-checkbox"
                  className="font-normal"
                >
                  High Loss
                </FieldLabel>
              </Field>
            </FieldGroup>

          </div>
        </div>

      </DrawerContent>

    </Drawer>
  )
}
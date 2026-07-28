"use client"
import { Button } from "@/components/ui/button"
import {
  Drawer,
<<<<<<< HEAD
  DrawerContent,
  DrawerDescription,
=======
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
>>>>>>> zmounji
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
<<<<<<< HEAD
                  id="ranking-filter-status-offline"
                  name="ranking-filter-status-offline"
=======
                  id="finder-pref-9k2-hard-disks-ljj-checkbox"
                  name="finder-pref-9k2-hard-disks-ljj-checkbox"
                  defaultChecked
>>>>>>> zmounji
                  onCheckedChange={() => setStatus(status === "OFFLINE" ? null : "OFFLINE")}
                  checked={status === "OFFLINE"}
                />
                <FieldLabel
<<<<<<< HEAD
                  htmlFor="ranking-filter-status-offline"
=======
                  htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
>>>>>>> zmounji
                  className="font-normal"
                >
                  OFFLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
<<<<<<< HEAD
                  id="ranking-filter-status-online"
                  name="ranking-filter-status-online"
=======
                  id="finder-pref-9k2-external-disks-1yg-checkbox"
                  name="finder-pref-9k2-external-disks-1yg-checkbox"
>>>>>>> zmounji
                  onCheckedChange={() => setStatus(status === "ONLINE" ? null : "ONLINE")}
                  checked={status === "ONLINE"}
                />
                <FieldLabel
<<<<<<< HEAD
                  htmlFor="ranking-filter-status-online"
=======
                  htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
>>>>>>> zmounji
                  className="font-normal"
                >
                  ONLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
<<<<<<< HEAD
                  id="ranking-filter-status-in-battle"
                  name="ranking-filter-status-in-battle"
=======
                  id="finder-pref-9k2-cds-dvds-fzt-checkbox"
                  name="finder-pref-9k2-cds-dvds-fzt-checkbox"
>>>>>>> zmounji
                  onCheckedChange={() => setStatus(status === "IN_BATTLE" ? null : "IN_BATTLE")}
                  checked={status === "IN_BATTLE"}
                />
                <FieldLabel
<<<<<<< HEAD
                  htmlFor="ranking-filter-status-in-battle"
=======
                  htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
>>>>>>> zmounji
                  className="font-normal"
                >
                  IN_BATTLE
                </FieldLabel>
              </Field>
            </FieldGroup>

<<<<<<< HEAD
            <p className="text-sm font-medium text-muted-foreground mt-6"> Win rate </p>
=======
            <p className="text-sm font-medium text-muted-foreground mt-6"> Win & Loss </p>
>>>>>>> zmounji

            <FieldGroup className="gap-2 flex items-center mt-3">
              <Field orientation="horizontal">
                <Checkbox
<<<<<<< HEAD
                  id="ranking-filter-win-rate-high"
                  name="ranking-filter-win-rate-high"
=======
                  id="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  name="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  defaultChecked
>>>>>>> zmounji
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "HIGH" ? null : "HIGH")}
                  checked={winRateFilter === "HIGH"}
                />
                <FieldLabel
<<<<<<< HEAD
                  htmlFor="ranking-filter-win-rate-high"
                  className="font-normal"
                >
                  Highest win rate
=======
                  htmlFor="finder-zxpref-9k2-hard-disks-ljj-checkbox"
                  className="font-normal"
                >
                  High Win
>>>>>>> zmounji
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
<<<<<<< HEAD
                  id="ranking-filter-win-rate-low"
                  name="ranking-filter-win-rate-low"
=======
                  id="finder-pref-9k2er-external-disks-1yg-checkbox"
                  name="finder-pref-9k2er-external-disks-1yg-checkbox"
>>>>>>> zmounji
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "LOW" ? null : "LOW")}
                  checked={winRateFilter === "LOW"}
                />
                <FieldLabel
<<<<<<< HEAD
                  htmlFor="ranking-filter-win-rate-low"
                  className="font-normal"
                >
                  Lowest win rate
=======
                  htmlFor="finder-pref-9k2er-external-disks-1yg-checkbox"
                  className="font-normal"
                >
                  High Loss
>>>>>>> zmounji
                </FieldLabel>
              </Field>
            </FieldGroup>

          </div>
        </div>

      </DrawerContent>

    </Drawer>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> zmounji

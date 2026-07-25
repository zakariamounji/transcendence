"use client"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
                  id="ranking-filter-status-offline"
                  name="ranking-filter-status-offline"
                  onCheckedChange={() => setStatus(status === "OFFLINE" ? null : "OFFLINE")}
                  checked={status === "OFFLINE"}
                />
                <FieldLabel
                  htmlFor="ranking-filter-status-offline"
                  className="font-normal"
                >
                  OFFLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="ranking-filter-status-online"
                  name="ranking-filter-status-online"
                  onCheckedChange={() => setStatus(status === "ONLINE" ? null : "ONLINE")}
                  checked={status === "ONLINE"}
                />
                <FieldLabel
                  htmlFor="ranking-filter-status-online"
                  className="font-normal"
                >
                  ONLINE
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="ranking-filter-status-in-battle"
                  name="ranking-filter-status-in-battle"
                  onCheckedChange={() => setStatus(status === "IN_BATTLE" ? null : "IN_BATTLE")}
                  checked={status === "IN_BATTLE"}
                />
                <FieldLabel
                  htmlFor="ranking-filter-status-in-battle"
                  className="font-normal"
                >
                  IN_BATTLE
                </FieldLabel>
              </Field>
            </FieldGroup>

            <p className="text-sm font-medium text-muted-foreground mt-6"> Win rate </p>

            <FieldGroup className="gap-2 flex items-center mt-3">
              <Field orientation="horizontal">
                <Checkbox
                  id="ranking-filter-win-rate-high"
                  name="ranking-filter-win-rate-high"
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "HIGH" ? null : "HIGH")}
                  checked={winRateFilter === "HIGH"}
                />
                <FieldLabel
                  htmlFor="ranking-filter-win-rate-high"
                  className="font-normal"
                >
                  Highest win rate
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="ranking-filter-win-rate-low"
                  name="ranking-filter-win-rate-low"
                  onCheckedChange={() => setWinRateFilter(winRateFilter === "LOW" ? null : "LOW")}
                  checked={winRateFilter === "LOW"}
                />
                <FieldLabel
                  htmlFor="ranking-filter-win-rate-low"
                  className="font-normal"
                >
                  Lowest win rate
                </FieldLabel>
              </Field>
            </FieldGroup>

          </div>
        </div>

      </DrawerContent>

    </Drawer>
  )
}

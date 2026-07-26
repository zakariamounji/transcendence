"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function BattleFilters({
  selectedModes,
  selectedLanguages,
  onModeChange,
  onLanguageChange
}: {
  selectedModes: string[]
  selectedLanguages: string[]
  onModeChange: (mode: string) => void
  onLanguageChange: (language: string) => void
}): React.JSX.Element {
  const modes = ["SOLO", "DUO", "GROUP"]
  const languages = ["C", "CPP"]

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Battle Mode Filter */}
        <div>
          <h3 className="font-semibold text-card-foreground mb-3 text-sm">Battle Mode</h3>
          <div className="space-y-2">
            {modes.map((mode) => (
              <div key={mode} className="flex items-center space-x-2">
                <Checkbox
                  id={`mode-${mode}`}
                  checked={selectedModes.includes(mode)}
                  onCheckedChange={() => onModeChange(mode)}
                />
                <Label
                  htmlFor={`mode-${mode}`}
                  className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  {mode === "SOLO" && "🏁 Solo"}
                  {mode === "DUO" && "👥 Duo"}
                  {mode === "GROUP" && "🎯 Group"}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <h3 className="font-semibold text-card-foreground mb-3 text-sm">Language</h3>
          <div className="space-y-2">
            {languages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language}`}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={() => onLanguageChange(language)}
                />
                <Label
                  htmlFor={`language-${language}`}
                  className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  {language === "C" && "⚙️ C"}
                  {language === "CPP" && "⚙️ C++"}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { wizardDataAtom } from "@/lib/stores/wizard-state";

export function DatesStep() {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);

  // Local state synced with Jotai
  const [birthDate, setBirthDate] = useState(wizardData.birthDate);
  const [deathDate, setDeathDate] = useState(wizardData.deathDate);
  const [age, setAge] = useState<string>(wizardData.age?.toString() ?? "");
  const [inMemoriam, setInMemoriam] = useState(wizardData.inMemoriam);

  // Sync local state to Jotai (debounced effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWizardData((prev) => ({
        ...prev,
        birthDate,
        deathDate,
        age: age ? Number.parseInt(age, 10) : null,
        inMemoriam,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [birthDate, deathDate, age, inMemoriam, setWizardData]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Dates</h2>
        <p className="text-muted-foreground">
          Enter life dates and memorial status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input
            id="birthDate"
            name="birthDate"
            onChange={(e) => setBirthDate(e.target.value)}
            type="date"
            value={birthDate}
          />
          <p className="text-muted-foreground text-xs">
            Or enter as text: &quot;January 15, 1945&quot;
          </p>
        </div>

        {/* Death Date */}
        <div className="space-y-2">
          <Label htmlFor="deathDate">Death Date</Label>
          <Input
            id="deathDate"
            name="deathDate"
            onChange={(e) => setDeathDate(e.target.value)}
            type="date"
            value={deathDate}
          />
        </div>

        {/* Age (optional override) */}
        <div className="space-y-2">
          <Label htmlFor="age">Age (optional)</Label>
          <Input
            id="age"
            max={150}
            min={0}
            name="age"
            onChange={(e) => setAge(e.target.value)}
            placeholder="Leave blank to calculate from dates"
            type="number"
            value={age}
          />
        </div>

        {/* In Memoriam */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-base" htmlFor="inMemoriam">
                In Memoriam
              </Label>
              <p className="text-muted-foreground text-sm">
                Display &quot;In Loving Memory&quot; badge on the memorial page
              </p>
            </div>
            <Switch
              checked={inMemoriam}
              id="inMemoriam"
              onCheckedChange={setInMemoriam}
            />
          </div>

          {inMemoriam && (
            <div className="mt-4 inline-block rounded-full bg-black/80 px-4 py-1 text-sm text-white">
              In Loving Memory
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

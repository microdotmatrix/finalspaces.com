"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wizardDataAtom } from "@/lib/stores/wizard-state";

export function LocationsStep() {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);

  // Local state synced with Jotai
  const [placeOfBirth, setPlaceOfBirth] = useState(wizardData.placeOfBirth);
  const [hometown, setHometown] = useState(wizardData.hometown);

  // Sync local state to Jotai (debounced effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWizardData((prev) => ({
        ...prev,
        placeOfBirth,
        hometown,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [placeOfBirth, hometown, setWizardData]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Locations</h2>
        <p className="text-muted-foreground">
          Add places that were meaningful in their life.
        </p>
      </div>

      <div className="space-y-6">
        {/* Place of Birth */}
        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input
            id="placeOfBirth"
            name="placeOfBirth"
            onChange={(e) => setPlaceOfBirth(e.target.value)}
            placeholder="City, State or Country"
            value={placeOfBirth}
          />
        </div>

        {/* Hometown */}
        <div className="space-y-2">
          <Label htmlFor="hometown">Hometown</Label>
          <Input
            id="hometown"
            name="hometown"
            onChange={(e) => setHometown(e.target.value)}
            placeholder="Where they called home"
            value={hometown}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { wizardDataAtom } from "@/lib/stores/wizard-state";
import { generateSlug } from "@/lib/utils/slug";

export function IdentityStep() {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);

  // Local state synced with Jotai
  const [name, setName] = useState(wizardData.name);
  const [firstName, setFirstName] = useState(wizardData.firstName);
  const [lastName, setLastName] = useState(wizardData.lastName);
  const [middleName, setMiddleName] = useState(wizardData.middleName);
  const [suffix, setSuffix] = useState(wizardData.suffix);
  const [nickname, setNickname] = useState(wizardData.nickname);
  const [useNicknameOnly, setUseNicknameOnly] = useState(
    wizardData.useNicknameOnly
  );

  const slugPreview = name ? generateSlug(name) : "";

  // Sync local state to Jotai (debounced effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWizardData((prev) => ({
        ...prev,
        name,
        firstName,
        lastName,
        middleName,
        suffix,
        nickname,
        useNicknameOnly,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    name,
    firstName,
    lastName,
    middleName,
    suffix,
    nickname,
    useNicknameOnly,
    setWizardData,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Identity</h2>
        <p className="text-muted-foreground">
          Enter the basic information for this memorial.
        </p>
      </div>

      <div className="space-y-6">
        {/* Memorial Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Memorial Name *</Label>
          <Input
            id="name"
            name="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Smith Memorial"
            required
            value={name}
          />
          {!name && (
            <p className="text-muted-foreground text-sm">
              Required to save draft
            </p>
          )}
          {slugPreview && (
            <p className="text-muted-foreground text-sm">
              URL: finalspace.com/m/
              <span className="font-mono">{slugPreview}</span>
            </p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              value={firstName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              value={lastName}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              name="middleName"
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="James"
              value={middleName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              name="suffix"
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Jr., Sr., III"
              value={suffix}
            />
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Johnny"
              value={nickname}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={useNicknameOnly}
              id="useNicknameOnly"
              onCheckedChange={setUseNicknameOnly}
            />
            <Label className="cursor-pointer" htmlFor="useNicknameOnly">
              Display nickname instead of full name
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

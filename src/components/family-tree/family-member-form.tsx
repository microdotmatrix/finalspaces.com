"use client";

import Image from "next/image";
import {
  type SubmitEventHandler,
  useEffect,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateFamilyMemberInput,
  FamilyMember,
  LinkedFinalSpace,
} from "@/lib/actions/family-actions";
import { searchFinalSpacesForLinking } from "@/lib/actions/family-actions";
import {
  getCategoryFromRelationshipType,
  getGenerationLevel,
  RELATIONSHIP_GROUPS,
  type RelationshipType,
  SPECIFIC_RELATIONSHIPS,
} from "@/lib/constants/family-relationships";

interface FamilyMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: FamilyMember | null;
  finalSpaceId: string;
  currentUserId?: string;
  onSubmit: (
    data: Omit<CreateFamilyMemberInput, "finalSpaceId">
  ) => void | Promise<void>;
}

type LinkMode = "none" | "search" | "manual";

interface RelationshipTypeSelectProps {
  value: RelationshipType | "";
  onChange: (value: RelationshipType) => void;
}

function RelationshipTypeSelect({
  value,
  onChange,
}: RelationshipTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Relationship Type *</Label>
      <Select
        onValueChange={(nextValue) => onChange(nextValue as RelationshipType)}
        value={value}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select relationship type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Ancestors</SelectLabel>
            {RELATIONSHIP_GROUPS.ancestor.map((r) => (
              <SelectItem key={r.type} value={r.type}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Descendants</SelectLabel>
            {RELATIONSHIP_GROUPS.descendant.map((r) => (
              <SelectItem key={r.type} value={r.type}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Siblings & Extended</SelectLabel>
            {RELATIONSHIP_GROUPS.lateral.map((r) => (
              <SelectItem key={r.type} value={r.type}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Spouse & In-Laws</SelectLabel>
            {RELATIONSHIP_GROUPS.spouse.map((r) => (
              <SelectItem key={r.type} value={r.type}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

interface SpecificRelationshipInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}

function SpecificRelationshipInput({
  value,
  onChange,
  suggestions,
}: SpecificRelationshipInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="relationship">Specific Relationship *</Label>
      <Input
        id="relationship"
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Mother, Uncle Bob"
        value={value}
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-full bg-muted px-2 py-0.5 text-xs transition-colors hover:bg-muted-foreground/20"
              key={suggestion}
              onClick={() => onChange(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  nickname: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
}

function NameFields({
  firstName,
  lastName,
  nickname,
  onFirstNameChange,
  onLastNameChange,
  onNicknameChange,
}: NameFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="John"
            value={firstName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Smith"
            value={lastName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="Johnny"
          value={nickname}
        />
      </div>
    </>
  );
}

interface YearFieldsProps {
  birthYear: string;
  deathYear: string;
  onBirthYearChange: (value: string) => void;
  onDeathYearChange: (value: string) => void;
}

function YearFields({
  birthYear,
  deathYear,
  onBirthYearChange,
  onDeathYearChange,
}: YearFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="birthYear">Birth Year</Label>
        <Input
          id="birthYear"
          max={2100}
          min={1800}
          onChange={(e) => onBirthYearChange(e.target.value)}
          placeholder="1950"
          type="number"
          value={birthYear}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deathYear">Death Year</Label>
        <Input
          id="deathYear"
          max={2100}
          min={1800}
          onChange={(e) => onDeathYearChange(e.target.value)}
          placeholder="Leave empty if living"
          type="number"
          value={deathYear}
        />
      </div>
    </div>
  );
}

interface PhotoUrlFieldProps {
  photoUrl: string;
  onPhotoUrlChange: (value: string) => void;
}

function PhotoUrlField({ photoUrl, onPhotoUrlChange }: PhotoUrlFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="photoUrl">Photo URL</Label>
      <Input
        id="photoUrl"
        onChange={(e) => onPhotoUrlChange(e.target.value)}
        placeholder="https://example.com/photo.jpg"
        type="url"
        value={photoUrl}
      />
      {photoUrl && (
        <div className="relative mt-2 size-16 overflow-hidden rounded-lg">
          <Image
            alt="Preview"
            className="object-cover"
            fill
            sizes="64px"
            src={photoUrl}
          />
        </div>
      )}
    </div>
  );
}

interface FinalSpaceLinkSectionProps {
  linkMode: LinkMode;
  onLinkModeChange: (mode: LinkMode) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: LinkedFinalSpace[];
  selectedFinalSpace: LinkedFinalSpace | null;
  onSelectFinalSpace: (space: LinkedFinalSpace | null) => void;
  isSearching: boolean;
}

function FinalSpaceLinkSection({
  linkMode,
  onLinkModeChange,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  selectedFinalSpace,
  onSelectFinalSpace,
  isSearching,
}: FinalSpaceLinkSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Link to FinalSpace</Label>
      <div className="flex gap-2">
        <Button
          onClick={() => onLinkModeChange("none")}
          size="sm"
          type="button"
          variant={linkMode === "none" ? "default" : "outline"}
        >
          None
        </Button>
        <Button
          onClick={() => onLinkModeChange("search")}
          size="sm"
          type="button"
          variant={linkMode === "search" ? "default" : "outline"}
        >
          Search
        </Button>
      </div>

      {linkMode === "search" && (
        <div className="mt-2 space-y-2">
          <Input
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by name..."
            value={searchQuery}
          />
          {isSearching && (
            <p className="text-muted-foreground text-sm">Searching...</p>
          )}
          {searchResults.length > 0 && (
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
              {searchResults.map((result) => (
                <button
                  className={`flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-accent ${
                    selectedFinalSpace?.id === result.id ? "bg-accent" : ""
                  }`}
                  key={result.id}
                  onClick={() => onSelectFinalSpace(result)}
                  type="button"
                >
                  {result.profilePictureUrl ? (
                    <Image
                      alt={result.name}
                      className="size-8 rounded-full object-cover"
                      height={32}
                      src={result.profilePictureUrl}
                      width={32}
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                      <Icon
                        className="size-4 text-muted-foreground"
                        icon="ph:user"
                      />
                    </div>
                  )}
                  <span className="text-sm">{result.name}</span>
                  {selectedFinalSpace?.id === result.id && (
                    <Icon
                      className="ml-auto size-4 text-primary"
                      icon="ph:check"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedFinalSpace && (
            <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2">
              <Icon className="size-4 text-primary" icon="ph:link-simple" />
              <span className="text-sm">
                Linked to: {selectedFinalSpace.name}
              </span>
              <Button
                className="ml-auto"
                onClick={() => onSelectFinalSpace(null)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Icon className="size-3" icon="ph:x" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FamilyMemberForm({
  open,
  onOpenChange,
  member,
  finalSpaceId,
  currentUserId,
  onSubmit,
}: FamilyMemberFormProps) {
  const isEditing = !!member;
  const [isPending, startTransition] = useTransition();

  // Form state
  const [relationshipType, setRelationshipType] = useState<
    RelationshipType | ""
  >(member?.relationshipType ?? "");
  const [relationship, setRelationship] = useState(member?.relationship ?? "");
  const [firstName, setFirstName] = useState(member?.firstName ?? "");
  const [lastName, setLastName] = useState(member?.lastName ?? "");
  const [nickname, setNickname] = useState(member?.nickname ?? "");
  const [birthYear, setBirthYear] = useState(
    member?.birthYear?.toString() ?? ""
  );
  const [deathYear, setDeathYear] = useState(
    member?.deathYear?.toString() ?? ""
  );
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl ?? "");

  // FinalSpace linking
  const [linkMode, setLinkMode] = useState<LinkMode>(
    member?.linkedFinalSpaceId ? "search" : "none"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LinkedFinalSpace[]>([]);
  const [selectedFinalSpace, setSelectedFinalSpace] =
    useState<LinkedFinalSpace | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Reset form when dialog opens/closes or member changes
  useEffect(() => {
    if (open) {
      setRelationshipType(member?.relationshipType ?? "");
      setRelationship(member?.relationship ?? "");
      setFirstName(member?.firstName ?? "");
      setLastName(member?.lastName ?? "");
      setNickname(member?.nickname ?? "");
      setBirthYear(member?.birthYear?.toString() ?? "");
      setDeathYear(member?.deathYear?.toString() ?? "");
      setPhotoUrl(member?.photoUrl ?? "");
      setLinkMode(member?.linkedFinalSpaceId ? "search" : "none");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFinalSpace(null);
    }
  }, [open, member]);

  // Search for FinalSpaces to link
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchFinalSpacesForLinking(
          searchQuery,
          currentUserId
        );
        if (!isCancelled) {
          setSearchResults(results.filter((r) => r.id !== finalSpaceId));
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, currentUserId, finalSpaceId]);

  // Get specific relationship suggestions based on type
  const relationshipSuggestions = relationshipType
    ? (SPECIFIC_RELATIONSHIPS[relationshipType] ?? [])
    : [];

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!(firstName.trim() && relationship.trim())) {
      toast.error("Please fill in required fields");
      return;
    }

    const category = relationshipType
      ? getCategoryFromRelationshipType(relationshipType)
      : "lateral";

    startTransition(async () => {
      await onSubmit({
        category,
        relationshipType: relationshipType || undefined,
        relationship: relationship.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        nickname: nickname.trim() || undefined,
        birthYear: birthYear ? Number.parseInt(birthYear, 10) : undefined,
        deathYear: deathYear ? Number.parseInt(deathYear, 10) : undefined,
        photoUrl: photoUrl || undefined,
        linkedFinalSpaceId: selectedFinalSpace?.id,
        generationLevel: relationshipType
          ? getGenerationLevel(relationshipType)
          : 0,
      });
      onOpenChange(false);
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Family Member" : "Add Family Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this family member."
              : "Add a new member to the family tree."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <RelationshipTypeSelect
            onChange={setRelationshipType}
            value={relationshipType}
          />

          <SpecificRelationshipInput
            onChange={setRelationship}
            suggestions={relationshipSuggestions}
            value={relationship}
          />

          <NameFields
            firstName={firstName}
            lastName={lastName}
            nickname={nickname}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onNicknameChange={setNickname}
          />

          <YearFields
            birthYear={birthYear}
            deathYear={deathYear}
            onBirthYearChange={setBirthYear}
            onDeathYearChange={setDeathYear}
          />

          <PhotoUrlField onPhotoUrlChange={setPhotoUrl} photoUrl={photoUrl} />

          <FinalSpaceLinkSection
            isSearching={isSearching}
            linkMode={linkMode}
            onLinkModeChange={setLinkMode}
            onSearchQueryChange={setSearchQuery}
            onSelectFinalSpace={setSelectedFinalSpace}
            searchQuery={searchQuery}
            searchResults={searchResults}
            selectedFinalSpace={selectedFinalSpace}
          />

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending && (
                <>
                  <Icon
                    className="mr-2 size-4 animate-spin"
                    icon="ph:spinner"
                  />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              )}
              {!isPending && isEditing && "Save Changes"}
              {!(isPending || isEditing) && "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

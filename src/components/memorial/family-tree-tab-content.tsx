"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FamilyMember } from "@/lib/actions/family-actions";
import { cn } from "@/lib/utils";
import {
  type FamilyFocus,
  type FamilyGranularity,
  filterFamilyMembers,
  getGenerationLabel,
  groupFamilyMembersByGeneration,
} from "@/lib/utils/family-tree-view";

type FamilyViewMode = "graph" | "collapsible";

interface FamilyTreeTabContentProps {
  canEdit: boolean;
  familyMembers: FamilyMember[];
  finalSpaceId: string;
  subjectName: string;
}

function getMemberDisplayName(member: FamilyMember): string {
  const fullName = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ");

  if (member.nickname) {
    return member.nickname;
  }

  return fullName || "Unknown";
}

function getMemberYears(member: FamilyMember): string | null {
  if (!(member.birthYear || member.deathYear)) {
    return null;
  }

  return `${member.birthYear ?? "?"} - ${member.deathYear ?? "present"}`;
}

interface FamilyMemberNodeProps {
  member: FamilyMember;
}

function FamilyMemberNode({ member }: FamilyMemberNodeProps) {
  const displayName = getMemberDisplayName(member);
  const memberYears = getMemberYears(member);

  return (
    <div className="flex w-40 flex-col items-center rounded-xl border bg-card p-3 text-center shadow-sm">
      <div className="relative mb-2 size-12 overflow-hidden rounded-lg bg-muted">
        {member.photoUrl ? (
          <Image
            alt={displayName}
            className="object-cover"
            fill
            sizes="48px"
            src={member.photoUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-6 text-muted-foreground" icon="ph:user" />
          </div>
        )}
      </div>

      <p className="w-full truncate font-medium text-sm">{displayName}</p>
      <p className="w-full truncate text-muted-foreground text-xs">
        {member.relationship}
      </p>
      {memberYears && (
        <p className="text-muted-foreground text-xs">{memberYears}</p>
      )}
    </div>
  );
}

interface GenerationRowProps {
  generationLevel: number;
  members: FamilyMember[];
}

function GenerationRow({ generationLevel, members }: GenerationRowProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-muted-foreground text-xs uppercase tracking-wider">
        {getGenerationLabel(generationLevel)}
      </p>
      <div className="flex flex-wrap items-start justify-center gap-3">
        {members.map((member) => (
          <FamilyMemberNode key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

interface FamilyGraphViewProps {
  members: FamilyMember[];
  subjectName: string;
}

function FamilyGraphView({ members, subjectName }: FamilyGraphViewProps) {
  const generationGroups = useMemo(
    () => groupFamilyMembersByGeneration(members),
    [members]
  );

  const ancestors = generationGroups.filter(
    (group) => group.generationLevel < 0
  );
  const sameGeneration = generationGroups.find(
    (group) => group.generationLevel === 0
  );
  const descendants = generationGroups.filter(
    (group) => group.generationLevel > 0
  );

  return (
    <div className="min-h-96 w-full overflow-auto rounded-xl border bg-muted/30 p-6">
      <div className="flex min-w-max flex-col items-center gap-8">
        {ancestors.map((group) => (
          <GenerationRow
            generationLevel={group.generationLevel}
            key={group.generationLevel}
            members={group.members}
          />
        ))}

        {ancestors.length > 0 && (
          <div aria-hidden="true" className="h-6 w-0.5 bg-border" />
        )}

        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Memorial Subject
          </p>
          <div className="flex w-40 flex-col items-center rounded-xl border-2 border-primary bg-primary/5 p-3 text-center shadow-sm">
            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-6 text-primary" icon="ph:star-fill" />
            </div>
            <p className="w-full truncate font-medium text-sm">{subjectName}</p>
            <p className="text-muted-foreground text-xs">Subject</p>
          </div>
        </div>

        {sameGeneration && sameGeneration.members.length > 0 && (
          <GenerationRow
            generationLevel={sameGeneration.generationLevel}
            members={sameGeneration.members}
          />
        )}

        {descendants.length > 0 && (
          <div aria-hidden="true" className="h-6 w-0.5 bg-border" />
        )}

        {descendants.map((group) => (
          <GenerationRow
            generationLevel={group.generationLevel}
            key={group.generationLevel}
            members={group.members}
          />
        ))}
      </div>
    </div>
  );
}

interface FamilyCollapsibleViewProps {
  members: FamilyMember[];
  subjectName: string;
}

function FamilyCollapsibleView({
  members,
  subjectName,
}: FamilyCollapsibleViewProps) {
  const generationGroups = useMemo(
    () => groupFamilyMembersByGeneration(members),
    [members]
  );

  return (
    <ScrollArea className="h-[420px] rounded-xl border bg-muted/20">
      <div className="space-y-3 p-4">
        <div className="rounded-lg border bg-card p-3">
          <p className="font-medium text-sm">Memorial Subject</p>
          <p className="text-muted-foreground text-sm">{subjectName}</p>
        </div>

        {generationGroups.map((group) => (
          <details
            className="rounded-lg border bg-card p-3"
            key={group.generationLevel}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-sm">
              <span>{getGenerationLabel(group.generationLevel)}</span>
              <span className="flex items-center gap-2 text-muted-foreground text-xs">
                {group.members.length}
                <Icon className="size-4" icon="ph:caret-down" />
              </span>
            </summary>

            <div className="mt-3 space-y-2">
              {group.members.map((member) => {
                const displayName = getMemberDisplayName(member);
                const memberYears = getMemberYears(member);

                return (
                  <div
                    className="rounded-md border bg-muted/40 p-3"
                    key={member.id}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {member.photoUrl ? (
                          <Image
                            alt={displayName}
                            className="object-cover"
                            fill
                            sizes="40px"
                            src={member.photoUrl}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Icon
                              className="size-5 text-muted-foreground"
                              icon="ph:user"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {displayName}
                        </p>
                        <p className="truncate text-muted-foreground text-xs">
                          {member.relationship}
                        </p>
                        {memberYears && (
                          <p className="text-muted-foreground text-xs">
                            {memberYears}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </ScrollArea>
  );
}

export function FamilyTreeTabContent({
  canEdit,
  familyMembers,
  finalSpaceId,
  subjectName,
}: FamilyTreeTabContentProps) {
  const [granularity, setGranularity] =
    useState<FamilyGranularity>("immediate");
  const [focus, setFocus] = useState<FamilyFocus>("all");
  const [viewMode, setViewMode] = useState<FamilyViewMode>("graph");

  useEffect(() => {
    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    setViewMode(isMobileViewport ? "collapsible" : "graph");
  }, []);

  const filteredMembers = useMemo(
    () => filterFamilyMembers(familyMembers, granularity, focus),
    [familyMembers, granularity, focus]
  );

  const editFamilyTreeHref = `/finalspaces/${finalSpaceId}/edit?tab=family`;

  if (familyMembers.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Icon
            className="size-6 text-primary"
            icon="ph:tree-structure-duotone"
          />
        </div>

        <h3 className="font-semibold text-lg">No Family Tree Yet</h3>

        {canEdit ? (
          <>
            <p className="text-muted-foreground text-sm">
              Start adding family members to build a shared family story.
            </p>
            <div className="pt-1">
              <Link
                className={cn(buttonVariants({ size: "sm" }))}
                href={editFamilyTreeHref}
              >
                <Icon className="mr-2 size-4" icon="ph:plus" />
                Add Family Members
              </Link>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Family stories and connections haven&apos;t been shared yet.
          </p>
        )}
      </div>
    );
  }

  let content = (
    <FamilyCollapsibleView
      members={filteredMembers}
      subjectName={subjectName}
    />
  );

  if (filteredMembers.length === 0) {
    content = (
      <div className="space-y-3 rounded-lg border border-dashed p-8 text-center">
        <h3 className="font-semibold">No matches for current filters</h3>
        <p className="text-muted-foreground text-sm">
          Try a broader detail setting or switch focus back to all
          relationships.
        </p>
        <div>
          <Button
            onClick={() => {
              setFocus("all");
              setGranularity("full");
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    );
  } else if (viewMode === "graph") {
    content = (
      <FamilyGraphView members={filteredMembers} subjectName={subjectName} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="family-granularity">Tree Detail</Label>
          <Select
            onValueChange={(value) =>
              setGranularity(value as FamilyGranularity)
            }
            value={granularity}
          >
            <SelectTrigger className="w-[180px]" id="family-granularity">
              <SelectValue placeholder="Select detail" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="extended">Extended</SelectItem>
              <SelectItem value="full">Full Tree</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="family-focus">Focus</Label>
          <Select
            onValueChange={(value) => setFocus(value as FamilyFocus)}
            value={focus}
          >
            <SelectTrigger className="w-[180px]" id="family-focus">
              <SelectValue placeholder="Select focus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Relationships</SelectItem>
              <SelectItem value="ancestors">Ancestors Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>View</Label>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              onClick={() => setViewMode("graph")}
              size="sm"
              variant={viewMode === "graph" ? "default" : "ghost"}
            >
              <Icon className="mr-1 size-4" icon="ph:tree-structure" />
              Graph
            </Button>
            <Button
              onClick={() => setViewMode("collapsible")}
              size="sm"
              variant={viewMode === "collapsible" ? "default" : "ghost"}
            >
              <Icon className="mr-1 size-4" icon="ph:list" />
              Collapsible
            </Button>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Showing {filteredMembers.length} of {familyMembers.length} family member
        {familyMembers.length === 1 ? "" : "s"}.
      </p>

      {content}
    </div>
  );
}

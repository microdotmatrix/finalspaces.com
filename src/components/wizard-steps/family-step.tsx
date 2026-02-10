"use client";

import { useAtomValue } from "jotai";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { EmptyFamilyState } from "@/components/family-tree/empty-family-state";
import { FamilyMemberCard } from "@/components/family-tree/family-member-card";
import { FamilyMemberForm } from "@/components/family-tree/family-member-form";
import { FamilyTreeCanvas } from "@/components/family-tree/family-tree-canvas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CreateFamilyMemberInput,
  createFamilyMember,
  deleteFamilyMember,
  type FamilyMember,
  getFamilyMembers,
  updateFamilyMember,
} from "@/lib/actions/family-actions";
import { draftIdAtom, wizardDataAtom } from "@/lib/stores/wizard-state";

type ViewMode = "tree" | "list";

function FamilyStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export function FamilyStep() {
  const finalSpaceId = useAtomValue(draftIdAtom);
  const wizardData = useAtomValue(wizardDataAtom);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Subject name from wizard data
  const subjectName =
    wizardData.nickname && wizardData.useNicknameOnly
      ? wizardData.nickname
      : wizardData.name ||
        [wizardData.firstName, wizardData.lastName].filter(Boolean).join(" ") ||
        "Memorial Subject";

  // Load family members
  useEffect(() => {
    if (!finalSpaceId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const data = await getFamilyMembers(finalSpaceId);
        if (!isCancelled) {
          setMembers(data);
        }
      } catch {
        if (!isCancelled) {
          toast.error("Failed to load family members");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMembers();
    return () => {
      isCancelled = true;
    };
  }, [finalSpaceId]);

  // Auto-switch to list view on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode("list");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddMember = (
    data: Omit<CreateFamilyMemberInput, "finalSpaceId">
  ) => {
    if (!finalSpaceId) {
      return;
    }

    startTransition(async () => {
      const result = await createFamilyMember({
        ...data,
        finalSpaceId,
      });

      if (result.success) {
        setMembers((prev) => [...prev, result.data]);
        toast.success("Family member added");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUpdateMember = (
    data: Omit<CreateFamilyMemberInput, "finalSpaceId">
  ) => {
    if (!editingMember) {
      return;
    }

    startTransition(async () => {
      const result = await updateFamilyMember({
        id: editingMember.id,
        ...data,
      });

      if (result.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? result.data : m))
        );
        setEditingMember(null);
        toast.success("Family member updated");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteMember = () => {
    if (!deletingMemberId) {
      return;
    }

    startTransition(async () => {
      const result = await deleteFamilyMember(deletingMemberId);

      if (result.success) {
        setMembers((prev) => prev.filter((m) => m.id !== deletingMemberId));
        setDeletingMemberId(null);
        toast.success("Family member removed");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSelectMember = (member: FamilyMember) => {
    setEditingMember(member);
  };

  const handleAddRelative = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  if (!finalSpaceId) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Family Tree</h2>
        <p className="text-muted-foreground">
          Save the memorial first to add family members.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <FamilyStepSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-2xl">Family Tree</h2>
          <p className="text-muted-foreground">
            Build a visual family tree with relationships and connections
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle - only show on larger screens */}
          <div className="hidden gap-1 rounded-lg border p-1 md:flex">
            <Button
              onClick={() => setViewMode("tree")}
              size="sm"
              variant={viewMode === "tree" ? "default" : "ghost"}
            >
              <Icon className="mr-1 size-4" icon="ph:tree-structure" />
              Tree
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
            >
              <Icon className="mr-1 size-4" icon="ph:list" />
              List
            </Button>
          </div>

          <Button onClick={() => setShowForm(true)}>
            <Icon className="mr-2 size-4" icon="ph:plus" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Content */}
      {members.length === 0 && (
        <EmptyFamilyState onAddFirst={() => setShowForm(true)} />
      )}
      {members.length > 0 && viewMode === "tree" && (
        <FamilyTreeCanvas
          members={members}
          onAddRelative={handleAddRelative}
          onSelectMember={handleSelectMember}
          subjectName={subjectName}
        />
      )}
      {members.length > 0 && viewMode === "list" && (
        <div className="space-y-2">
          {members.map((member) => (
            <FamilyMemberCard
              isPending={isPending}
              key={member.id}
              member={member}
              onDelete={(id) => setDeletingMemberId(id)}
              onEdit={handleSelectMember}
            />
          ))}
        </div>
      )}

      {/* Member count */}
      {members.length > 0 && (
        <p className="text-center text-muted-foreground text-sm">
          {members.length} family member{members.length === 1 ? "" : "s"}
        </p>
      )}

      {/* Add/Edit Form Dialog */}
      <FamilyMemberForm
        finalSpaceId={finalSpaceId}
        member={editingMember}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setEditingMember(null);
          }
        }}
        onSubmit={editingMember ? handleUpdateMember : handleAddMember}
        open={showForm || !!editingMember}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeletingMemberId(null)}
        open={!!deletingMemberId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this family member from the tree?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleDeleteMember}
            >
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { wizardDataAtom } from "@/lib/stores/wizard-state";

type Quote = { text: string; author?: string };

export function BioStep() {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);

  // Local state synced with Jotai
  const [bioText, setBioText] = useState(wizardData.bioText);
  const [lifeHighlights, setLifeHighlights] = useState(
    wizardData.lifeHighlights
  );
  const [quotes, setQuotes] = useState<Quote[]>(wizardData.quotesJson);

  // Sync local state to Jotai (debounced effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWizardData((prev) => ({
        ...prev,
        bioText,
        lifeHighlights,
        quotesJson: quotes,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [bioText, lifeHighlights, quotes, setWizardData]);

  const addQuote = useCallback(() => {
    setQuotes((prev) => [...prev, { text: "", author: "" }]);
  }, []);

  const removeQuote = useCallback((index: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuote = useCallback(
    (index: number, field: keyof Quote, value: string) => {
      setQuotes((prev) =>
        prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
      );
    },
    []
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Biography</h2>
        <p className="text-muted-foreground">
          Share their story, highlights, and memorable quotes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bio Text */}
        <div className="space-y-2">
          <Label htmlFor="bioText">Biography</Label>
          <Textarea
            className="min-h-[200px]"
            id="bioText"
            name="bioText"
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Share their life story, achievements, and what made them special..."
            value={bioText}
          />
          <p className="text-muted-foreground text-xs">
            {bioText.length.toLocaleString()} / 10,000 characters
          </p>
        </div>

        {/* Life Highlights */}
        <div className="space-y-2">
          <Label htmlFor="lifeHighlights">Life Highlights</Label>
          <Textarea
            className="min-h-[120px]"
            id="lifeHighlights"
            name="lifeHighlights"
            onChange={(e) => setLifeHighlights(e.target.value)}
            placeholder="Key moments, achievements, or milestones..."
            value={lifeHighlights}
          />
        </div>

        {/* Quotes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Favorite Quotes</Label>
            <Button
              onClick={addQuote}
              size="sm"
              type="button"
              variant="outline"
            >
              <Icon className="mr-1 size-4" icon="mdi:plus" />
              Add Quote
            </Button>
          </div>

          {quotes.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              No quotes added yet. Add quotes they loved or were known for.
            </p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote, index) => (
                <div className="space-y-3 rounded-lg border p-4" key={index}>
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-muted-foreground text-sm">
                      Quote {index + 1}
                    </span>
                    <Button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeQuote(index)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Icon className="size-4" icon="mdi:trash-can-outline" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      className="min-h-[80px]"
                      onChange={(e) =>
                        updateQuote(index, "text", e.target.value)
                      }
                      placeholder="Enter the quote..."
                      value={quote.text}
                    />
                    <Input
                      onChange={(e) =>
                        updateQuote(index, "author", e.target.value)
                      }
                      placeholder="Author (optional)"
                      value={quote.author || ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

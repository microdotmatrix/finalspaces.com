import { type RefObject, useEffect, useRef, useState } from "react";
import { useEffectWithTarget } from "@/hooks/use-effect-with-target";
import type { BasicTarget } from "@/lib/create-effect-with-target";
import { getTargetElement } from "@/lib/create-effect-with-target";

type CallbackType = (entry: IntersectionObserverEntry) => void;

export interface Options {
  rootMargin?: string;
  threshold?: number | number[];
  root?: BasicTarget<Element>;
  callback?: CallbackType;
}

export function useInViewport(
  target: BasicTarget | BasicTarget[],
  options?: Options
) {
  const { callback, ...option } = options || {};

  const [state, setState] = useState<boolean>();
  const [ratio, setRatio] = useState<number>();

  useEffectWithTarget(
    () => {
      const targets = Array.isArray(target) ? target : [target];
      const els = targets
        .map((element) => getTargetElement(element))
        .filter(Boolean);

      if (!els.length) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setRatio(entry.intersectionRatio);
            setState(entry.isIntersecting);
            callback?.(entry);
          }
        },
        {
          ...option,
          root: getTargetElement(options?.root),
        }
      );

      for (const el of els) {
        observer.observe(el || document.body);
      }

      return () => {
        observer.disconnect();
      };
    },
    [options?.rootMargin, options?.threshold, callback],
    target
  );

  return [state, ratio] as const;
}

export function useScrollIntoView<T extends HTMLDivElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: "smooth" });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}

import { isBrowser, isEqual, isFunction } from "es-toolkit";
import type {
  DependencyList,
  EffectCallback,
  RefObject,
  useEffect,
  useLayoutEffect,
} from "react";
import { useRef } from "react";
import { useUnmount } from "@/hooks/use-unmount";

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | RefObject<TargetValue<T>>;

export function getTargetElement<T extends TargetType>(
  target: BasicTarget<T>,
  defaultElement?: T
) {
  if (!isBrowser) {
    return;
  }

  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetValue<T>;

  if (isFunction(target)) {
    targetElement = target();
  } else if ("current" in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}

export function createEffectWithTarget(
  useEffectType: typeof useEffect | typeof useLayoutEffect
) {
  /**
   *
   * @param effect
   * @param deps
   * @param target target should compare ref.current vs ref.current, dom vs dom, ()=>dom vs ()=>dom
   */
  const useEffectWithTarget = (
    effect: EffectCallback,
    deps: DependencyList,
    target: BasicTarget<TargetType> | BasicTarget<TargetType>[]
  ) => {
    const hasInitRef = useRef(false);

    const lastElementRef = useRef<TargetValue<TargetType>[]>([]);
    const lastDepsRef = useRef<DependencyList>([]);

    const unLoadRef = useRef<(() => void) | undefined>(undefined);

    const runEffect = () => {
      const cleanup = effect();
      unLoadRef.current = typeof cleanup === "function" ? cleanup : undefined;
    };

    useEffectType(() => {
      const targets = Array.isArray(target) ? target : [target];
      const els = targets.map((item) => getTargetElement(item));

      // init run
      if (!hasInitRef.current) {
        hasInitRef.current = true;
        lastElementRef.current = els;
        lastDepsRef.current = deps;

        runEffect();
        return;
      }

      const nextEffectDeps = [els, deps];
      const lastEffectDeps = [lastElementRef.current, lastDepsRef.current];
      if (isEqual(lastEffectDeps, nextEffectDeps)) {
        return;
      }

      unLoadRef.current?.();

      lastElementRef.current = els;
      lastDepsRef.current = deps;
      runEffect();
    });

    useUnmount(() => {
      unLoadRef.current?.();
      // for react-refresh
      hasInitRef.current = false;
    });
  };

  return useEffectWithTarget;
}

import { useEffectWithTarget } from "@/hooks/use-effect-with-target";
import { useLatest } from "@/hooks/use-latest";
import type { BasicTarget } from "@/lib/create-effect-with-target";
import { getTargetElement } from "@/lib/create-effect-with-target";

type noop = (...p: unknown[]) => void;

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

interface Options<T extends Target = Target> {
  target?: T;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  enable?: boolean;
}

function useEventListener(
  eventName: string | string[],
  handler: noop,
  options: Options = {}
) {
  const { enable = true } = options;

  const handlerRef = useLatest(handler);

  useEffectWithTarget(
    () => {
      if (!enable) {
        return;
      }

      const targetElement = getTargetElement(options.target, window);
      if (!targetElement?.addEventListener) {
        return;
      }

      const eventListener = (event: Event) => handlerRef.current(event);

      const eventNameArray = Array.isArray(eventName) ? eventName : [eventName];

      for (const event of eventNameArray) {
        targetElement.addEventListener(event, eventListener, {
          capture: options.capture,
          once: options.once,
          passive: options.passive,
        });
      }

      return () => {
        for (const event of eventNameArray) {
          targetElement.removeEventListener(event, eventListener, {
            capture: options.capture,
          });
        }
      };
    },
    [eventName, options.capture, options.once, options.passive, enable],
    options.target
  );
}

export { useEventListener };

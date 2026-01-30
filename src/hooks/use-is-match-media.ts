import { useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { isBrowser } from "@/lib/utils";

export function useIsMatchMedia(mediaQueryString: string) {
  const [isMatch, setIsMatch] = useState(() => {
    if (!isBrowser) {
      return false;
    }
    return window.matchMedia(mediaQueryString).matches;
  });

  useIsomorphicLayoutEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryString);

    setIsMatch(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      (mediaQueryList as MediaQueryList).addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        // Fallback for older browsers
        (mediaQueryList as MediaQueryList).removeListener(listener);
      }
    };
  }, [mediaQueryString]);

  return isMatch;
}

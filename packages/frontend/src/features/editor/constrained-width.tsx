import type React from "react";
import { useEffect, useRef } from "react";
import { useEditorStore } from "@/context/editor-store";
import { cn } from "@/lib/utils";

export default function ConstrainedWidth(
  props: {
    noConstrain?: boolean;
  } & React.ComponentProps<"div">,
) {
  const { className, noConstrain, ...rest } = props;
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      useEditorStore.setState({ width: element.getBoundingClientRect().width });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      {...rest}
      ref={elementRef}
      className={cn("", className)}
      style={
        noConstrain
          ? undefined
          : ({
              width: "100%",
              maxWidth: "100%",
              "--editor-max-width": "100%",
            } as React.CSSProperties)
      }
    >
      {props.children}
    </div>
  );
}

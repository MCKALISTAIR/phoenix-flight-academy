import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a <Tabs> provider");
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { value: controlledValue, defaultValue = "", onValueChange, className, children, ...props },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (val: string) => {
        if (!isControlled) {
          setUncontrolledValue(val);
        }
        onValueChange?.(val);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider
        value={{
          value: activeValue,
          onValueChange: handleValueChange,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, children, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const triggers = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
          '[role="tab"]:not([disabled])',
        ),
      );
      if (!triggers.length) return;

      const activeEl = document.activeElement as HTMLButtonElement | null;
      let currentIndex = triggers.findIndex(
        (el) => el === activeEl || el.getAttribute("data-state") === "active",
      );
      if (activeEl && triggers.indexOf(activeEl) !== -1) {
        currentIndex = triggers.indexOf(activeEl);
      }

      let nextIndex = currentIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = triggers.length - 1;
      }

      if (nextIndex !== currentIndex && triggers[nextIndex]) {
        triggers[nextIndex].focus();
        triggers[nextIndex].click();
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabsContext();
    const isSelected = activeValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        data-state={isSelected ? "active" : "inactive"}
        data-value={value}
        tabIndex={isSelected ? 0 : -1}
        onClick={(e) => {
          onClick?.(e);
          onValueChange(value);
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isSelected = activeValue === value;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isSelected ? "active" : "inactive"}
        tabIndex={0}
        hidden={!forceMount && !isSelected}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

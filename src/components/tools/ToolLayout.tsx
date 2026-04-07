import React from "react";

export default function ToolLayout({
  preview,
  options,
  action,
}: {
  preview: React.ReactNode;
  options?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative">
      {/* Left: Preview Panel */}
      <div className="flex-1 w-full min-w-0">{preview}</div>

      {/* Right: Sticky Action Panel */}
      <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-6 pb-8 lg:pb-0">
        {options}
        
        {action && (
          <div className="w-full">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

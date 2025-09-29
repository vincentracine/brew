import { useFloating } from "@floating-ui/react";
import { useState } from "react";
import { offset, flip, shift } from "@floating-ui/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { cn } from "@/utils/cn";
import { specificationCollection } from "../collection";
import { useLiveGetSpecification } from "../hooks/useLiveGetSpecification";

export const IconPicker = ({
  specificationId,
  defaultIcon = "💡",
  className = "",
}: {
  specificationId: string;
  defaultIcon?: string;
  className?: string;
}) => {
  const { data: specification } = useLiveGetSpecification(specificationId);
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(10), flip(), shift()],
  });

  const handleEmojiSelect = (emoji: { native: string }) => {
    if (!specification) return;
    setIsOpen(false);
    specificationCollection.update(specificationId, (draft) => {
      draft.emoji = emoji.native;
    });
  };

  if (!specification) {
    return null;
  }

  return (
    <>
      <span
        className={cn("flex-shrink-0", className)}
        ref={refs.setReference}
        onClick={() => setIsOpen(!isOpen)}
      >
        {specification.emoji || defaultIcon}
      </span>
      {isOpen && (
        <div ref={refs.setFloating} style={floatingStyles} className="z-50">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </>
  );
};

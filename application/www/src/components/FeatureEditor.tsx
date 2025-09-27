import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { FloatingElement } from "./floating-element";
import { Toolbar } from "./tiptap-ui-primitive/toolbar";
import { ButtonGroup } from "./tiptap-ui-primitive/button-group";
import { MarkButton } from "./tiptap-ui/mark-button";
import { useEffect, useState } from "react";
import type { Specification } from "@/features/specifications/dtos";
import { useUpdateSpecification } from "@/features/specifications/queries";

interface FeatureEditorProps {
  specification: Specification;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const FeatureEditor = ({ specification }: FeatureEditorProps) => {
  const { mutate: updateSpecification, isPending: isUpdating } =
    useUpdateSpecification();
  const currentDraftContent = specification.draft_content || "";
  const [content, setContent] = useState<string>(currentDraftContent);
  const debouncedContent = useDebounce(content, 1000);
  const [isEditingName, setIsEditingName] = useState(false);
  const [featureName, setFeatureName] = useState(specification.name);

  const tiptapEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: "Start writing your feature specification here...",
      }),
    ],
    content: specification.draft_content,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
    },
  });

  useEffect(() => {
    if (debouncedContent === currentDraftContent) return; // No change, don't save
    updateSpecification({
      ...specification,
      draft_content: debouncedContent,
    });
  }, [specification, debouncedContent, updateSpecification]);

  // Update editor content when feature changes
  useEffect(() => {
    if (tiptapEditor && currentDraftContent !== undefined) {
      const currentContent = tiptapEditor.getHTML();
      if (currentContent !== currentDraftContent) {
        tiptapEditor.commands.setContent(currentDraftContent);
        setContent(currentDraftContent);
      }
    }
  }, [currentDraftContent, tiptapEditor]);

  // Update local feature name when feature changes
  useEffect(() => {
    setFeatureName(specification.name);
  }, [specification.name]);

  const handleNameDoubleClick = () => {
    setIsEditingName(true);
  };

  const handleNameBlur = async () => {
    if (featureName.trim() === "") {
      setFeatureName(specification.name); // Reset to original if empty
      setIsEditingName(false);
      return;
    }

    if (featureName.trim() !== specification.name) {
      try {
        updateSpecification({
          ...specification,
          name: featureName.trim(),
        });
      } catch {
        setFeatureName(specification.name);
      }
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setFeatureName(specification.name);
      setIsEditingName(false);
    }
  };

  const publishFeature = async () => {
    updateSpecification({
      ...specification,
      content: specification.draft_content || "",
    });
  };

  if (!tiptapEditor) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto max-w-6xl px-12">
      <div className="flex flex-row justify-between items-center mb-8">
        <div className="w-fit -mx-2">
          {isEditingName ? (
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="text-2xl font-bold text-gray-900 bg-active w-auto p-2 rounded-xl focus:outline-none"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold text-gray-900 hover:bg-active w-auto p-2 rounded-xl cursor-pointer transition-colors"
              onDoubleClick={handleNameDoubleClick}
              title="Double-click to edit"
            >
              {specification.name}
            </h1>
          )}
          {specification.summary && (
            <p className="text-gray-600 mt-2">{specification.summary}</p>
          )}
        </div>
        <div>
          <button
            onClick={publishFeature}
            className="bg-light hover:bg-active text-gray-900 px-4 py-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isUpdating ||
              specification.draft_content === specification.content
            }
          >
            {isUpdating ? "Applying changes..." : "Apply changes"}
          </button>
        </div>
      </div>

      <EditorContext.Provider value={{ editor: tiptapEditor }}>
        <EditorContent
          editor={tiptapEditor}
          className="h-full overflow-y-auto"
          role="presentation"
        />

        <FloatingElement editor={tiptapEditor}>
          <Toolbar variant="floating">
            <ButtonGroup>
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <MarkButton type="code" />
            </ButtonGroup>
          </Toolbar>
        </FloatingElement>
      </EditorContext.Provider>
    </div>
  );
};

export default FeatureEditor;

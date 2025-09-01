import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { FloatingElement } from "./floating-element";
import { Toolbar } from "./tiptap-ui-primitive/toolbar";
import { ButtonGroup } from "./tiptap-ui-primitive/button-group";
import { MarkButton } from "./tiptap-ui/mark-button";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Feature } from "@/lib/api";

interface FeatureEditorProps {
  feature: Feature;
  onUpdate: (feature: Feature) => void;
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

const FeatureEditor = ({ feature, onUpdate }: FeatureEditorProps) => {
  const [content, setContent] = useState(feature.draft_content || "");
  const [isSaving, setIsSaving] = useState(false);
  const debouncedContent = useDebounce(content, 1000);
  const [isEditingName, setIsEditingName] = useState(false);
  const [featureName, setFeatureName] = useState(feature.name);

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
    content: feature.draft_content,
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

  // Auto-save effect with debounce
  const saveContent = useCallback(
    async (contentToSave: string) => {
      if (contentToSave === feature.draft_content) return; // No change, don't save

      setIsSaving(true);
      try {
        const updatedFeature = await api.updateFeature(feature.id, {
          draft_content: contentToSave,
        });
        onUpdate(updatedFeature);
      } catch (error) {
        console.error("Error saving feature content:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [feature.id, feature.draft_content, onUpdate]
  );

  useEffect(() => {
    if (debouncedContent !== feature.draft_content) {
      saveContent(debouncedContent);
    }
  }, [debouncedContent, saveContent, feature.draft_content]);

  // Update editor content when feature changes
  useEffect(() => {
    if (tiptapEditor && feature.draft_content !== undefined) {
      const currentContent = tiptapEditor.getHTML();
      if (currentContent !== feature.draft_content) {
        tiptapEditor.commands.setContent(feature.draft_content || "");
        setContent(feature.draft_content || "");
      }
    }
  }, [feature.draft_content, tiptapEditor]);

  // Update local feature name when feature changes
  useEffect(() => {
    setFeatureName(feature.name);
  }, [feature.name]);

  const handleNameDoubleClick = () => {
    setIsEditingName(true);
  };

  const handleNameBlur = async () => {
    if (featureName.trim() === "") {
      setFeatureName(feature.name); // Reset to original if empty
      setIsEditingName(false);
      return;
    }

    if (featureName.trim() !== feature.name) {
      try {
        const updatedFeature = await api.updateFeature(feature.id, {
          name: featureName.trim(),
        });
        onUpdate(updatedFeature);
      } catch (error) {
        console.error("Error updating feature name:", error);
        setFeatureName(feature.name); // Reset on error
      }
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setFeatureName(feature.name);
      setIsEditingName(false);
    }
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
      <div className="mb-8 w-fit -mx-2">
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
            {feature.name}
          </h1>
        )}
        {feature.summary && (
          <p className="text-gray-600 mt-2">{feature.summary}</p>
        )}
        {isSaving && <p className="text-sm text-blue-600 mt-2">Saving...</p>}
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

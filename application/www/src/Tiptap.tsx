import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { FloatingElement } from "./components/floating-element";
import { Toolbar } from "./components/tiptap-ui-primitive/toolbar";
import { ButtonGroup } from "./components/tiptap-ui-primitive/button-group";
import { MarkButton } from "./components/tiptap-ui/mark-button";

const Tiptap = () => {
  const tiptapEditor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, Link],
    content:
      "<h1>Product Specification</h1><p>Start writing your product specification here. Try selecting some text to see the floating menu appear!</p><p>You can format your text with <strong>bold</strong>, <em>italic</em>, and other formatting options.</p>",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
  });

  if (!tiptapEditor) {
    return null;
  }

  return (
    <div className="relative h-full">
      <EditorContext.Provider value={{ editor: tiptapEditor }}>
        <EditorContent
          editor={tiptapEditor}
          className="h-full p-8 overflow-y-auto"
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

export default Tiptap;

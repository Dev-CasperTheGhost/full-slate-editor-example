import type { SlateEditor } from "~/components/editor/Editor";
import isUrl from "is-url";
import { Editor, Transforms, Element as SlateElement, Range } from "slate";
import { ElementType, LinkElement } from "~/components/editor/types";

export function withLinks(editor: SlateEditor) {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => [ElementType.Link].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain").replace(/\n/g, "");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
}

export function wrapLink(editor: SlateEditor, url: string) {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: ElementType.Link,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
}

export function unwrapLink(editor: SlateEditor) {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ElementType.Link,
  });
}

export function isLinkActive(editor: SlateEditor) {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ElementType.Link,
  });
  return !!link;
}

import { Editor, Transforms, Range, Point, Element as SlateElement } from "slate";
import type { SlateEditor } from "../../components/editor/Editor";
import { ElementType } from "../../components/editor/types";

type SHORTCUTS = typeof SHORTCUTS[keyof typeof SHORTCUTS];
const SHORTCUTS = {
  "*": ElementType.ListItem,
  "-": ElementType.ListItem,
  "+": ElementType.ListItem,
  "1.": ElementType.NumberedList,
  "[]": ElementType.CheckListItem,
  ">": ElementType.Blockquote,
  "#": ElementType.H1,
  "##": ElementType.H2,
  "###": ElementType.H3,
  "---": ElementType.Delimiter,
} as const;

export function withShortcuts(editor: SlateEditor) {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) as keyof typeof SHORTCUTS;
      const type = SHORTCUTS[beforeText] as SHORTCUTS | undefined;

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties = {
          type,
        };

        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: (n) => Editor.isBlock(editor, n),
        });

        if (type === ElementType.ListItem) {
          Transforms.wrapNodes(
            editor,
            { type: ElementType.BulletedList, children: [] },
            {
              match: (n) =>
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ElementType.ListItem,
            },
          );
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== ElementType.Paragraph &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: ElementType.Paragraph });

          if (block.type === ElementType.ListItem) {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === ElementType.BulletedList,
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
}

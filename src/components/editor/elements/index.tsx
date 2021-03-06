import { ElementType, SlateElements, TextAlignment } from "~/components/editor/types";
import type { RenderElementProps } from "slate-react";
import { CheckListItemElement } from "./CheckListItemElement";
import { LinkElement } from "./LinkElement";
import classNames from "classnames";
import { HorizontalLineElement } from "./HorizontalLineElement";

type ComponentItem = (
  props: RenderElementProps & { textAlign: TextAlignment | null; element: SlateElements },
) => JSX.Element;

const components: Record<string, ComponentItem> = {
  [ElementType.Blockquote]: ({ children, attributes, textAlign }) => (
    <blockquote
      {...attributes}
      className={classNames("border-l-[3px] dark:border-[#3f3f3f] pl-2", textAlign)}
    >
      {children}
    </blockquote>
  ),
  [ElementType.BulletedList]: ({ children, attributes }) => <ul {...attributes}>{children}</ul>,
  [ElementType.H1]: ({ children, attributes, textAlign }) => (
    <h1 {...attributes} className={classNames("text-3xl font-semibold", textAlign)}>
      {children}
    </h1>
  ),
  [ElementType.H2]: ({ children, attributes, textAlign }) => (
    <h2 {...attributes} className={classNames("text-2xl font-semibold", textAlign)}>
      {children}
    </h2>
  ),
  [ElementType.H3]: ({ children, attributes, textAlign }) => (
    <h3 {...attributes} className={classNames("text-xl font-semibold", textAlign)}>
      {children}
    </h3>
  ),
  [ElementType.ListItem]: ({ children, attributes }) => (
    <li {...attributes} data-list-item="true">
      {children}
    </li>
  ),
  [ElementType.CheckListItem]: ({ children, attributes, element }) => (
    <CheckListItemElement {...({ children, attributes, element } as any)} />
  ),
  [ElementType.NumberedList]: ({ children, attributes }) => <ol {...attributes}>{children}</ol>,
  [ElementType.Link]: ({ children, attributes, element, textAlign }) => (
    <LinkElement {...{ attributes, children, element, textAlign }} />
  ),
  [ElementType.HorizontalLine]: ({ attributes, children, element }) => (
    <HorizontalLineElement {...{ attributes, children, element }} />
  ),
};

export function EditorElement({ attributes, children, element }: RenderElementProps) {
  const textAlign = "align" in element ? (element.align as TextAlignment) : null;
  const component = components[element.type] as ComponentItem | undefined;

  if (component) {
    return component({ children, attributes, element, textAlign });
  }

  return (
    <p className={classNames(textAlign)} {...attributes}>
      {children}
    </p>
  );
}

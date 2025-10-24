import { Text } from 'slate';
import escapeHtml from 'escape-html';

const serialize = (node: any): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    return string;
  }

  const children = node.children.map((n: any) => serialize(n)).join('');

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`;
    default:
      return children;
  }
};

export const serializeSlateValue = (value: any): string => {
  try {
    const parsed = JSON.parse(value);
    return serialize({ children: parsed });
  } catch (e) {
    return `<p>${escapeHtml(value)}</p>`;
  }
};

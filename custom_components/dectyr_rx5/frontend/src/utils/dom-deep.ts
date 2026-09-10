/** Lovelace lives under home-assistant / hui-root shadow trees — light-DOM querySelectorAll misses it. */

export function queryDeep(selector: string, root: ParentNode = document): Element[] {
  const found: Element[] = [];
  const visit = (node: ParentNode): void => {
    node.querySelectorAll(selector).forEach((el) => found.push(el));
    node.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) {
        visit(el.shadowRoot);
      }
    });
  };
  visit(root);
  return found;
}

import {
  TemplateTreeComponent,
  TemplateTreeElement,
  isComponentTemplate,
} from '../model';

/**
 * обёртка компонента в div
 */
export function addElementParent(
  template: TemplateTreeElement | TemplateTreeComponent
): TemplateTreeElement {
  if (!isComponentTemplate(template)) return template;
  return {
    name: ['xhtml', 'div'],
    props: {},
    children: [template],
  };
}

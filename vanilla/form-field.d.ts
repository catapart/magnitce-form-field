declare class FormFieldElement extends HTMLElement {
    static parser: DOMParser;
    static singleTemplateDOM?: Document;
    static groupTemplateDOM?: Document;
    constructor();
    renderIntoTemplate(): void;
    getLabel(input: HTMLElement): string;
    static toTitleCase(value: string): string;
    static observedAttributes: string[];
    attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string): void;
    connectedCallback(): void;
}

export { FormFieldElement };

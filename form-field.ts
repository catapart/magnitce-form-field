const COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(`form-field { display: var(--form-field-display, contents) }`);

const singleTemplate = `<label class="container">
<slot class="field-label" name="field-label"></slot>
<slot class="prefix" name="prefix"></slot>
<slot class="light"></slot>
<slot class="postfix" name="postfix"></slot>
</label>`;
const groupTemplate = `<div class="container">
<slot class="field-label" name="field-label"></slot>
<label class="option">
    <slot class="prefix" name="prefix"></slot>
    <slot class="light"></slot>
    <slot class="postfix" name="postfix"></slot>
    <span class="label"></span>
</label>
</div>`;

const COMPONENT_TAG_NAME = 'form-field';
export class FormFieldElement extends HTMLElement
{

    static parser: DOMParser = new DOMParser();
    static singleTemplateDOM?: Document;
    static groupTemplateDOM?: Document;


    constructor()
    {
        super();

    }

    renderIntoTemplate()
    {
        if(this.hasAttribute('initialized')) { return; }

        const inputSelector = this.getAttribute('input-selector') || 'input,select,textarea';        
        const groupElements = [...this.querySelectorAll(inputSelector)].filter(item => !item.classList.contains('enabled-checkbox'));

        const fieldLabel = this.querySelector('[slot="field-label"]');
        if(fieldLabel != null) { fieldLabel.remove(); }

        const prefix = this.querySelector('[slot="prefix"]');
        if(prefix != null) { prefix.remove(); }
        const postfix = this.querySelector('[slot="postfix"]');
        if(postfix != null) { postfix.remove(); }

        if(groupElements.length > 1)
        {
            if(FormFieldElement.groupTemplateDOM == null)
            {
                FormFieldElement.groupTemplateDOM = FormFieldElement.parser.parseFromString(groupTemplate, 'text/html');
            }

            const inputs = [...this.querySelectorAll(inputSelector)];
            const otherElements = [...this.querySelectorAll(`:scope > :not(${inputSelector})`)];

            this.innerHTML = '';
            this.classList.add('group');

            const containerTemplate = FormFieldElement.groupTemplateDOM.querySelector('.container')!;
            const containerFragment = containerTemplate.cloneNode(true);
            this.append(containerFragment);
            
            const containerClone = this.querySelector('.container')!;
            const optionTemplate = this.querySelector('.option')!;
            optionTemplate.remove();
            for(let i = 0; i < inputs.length; i++)
            {
                const optionClone = optionTemplate.cloneNode(true);
                containerClone.append(optionClone);
                const lightDOMChildrenSlot = this.querySelector('.light')!;
                const label = this.getLabel(inputs[i] as HTMLElement);
                lightDOMChildrenSlot.parentElement!.querySelector('.label')!.textContent = label;
                if(prefix != null)
                {
                    const prefixSlots = [...this.querySelectorAll('.prefix')] as HTMLElement[];
                    for(let i = 0; i < prefixSlots.length; i++)
                    {
                        const slot = prefixSlots[i];
                        const newPrefix = prefix.cloneNode(true);
                        (newPrefix as HTMLElement).classList.add('prefix');
                        slot.parentElement!.replaceChild(newPrefix, slot);
                    }
                }                
                lightDOMChildrenSlot.parentElement!.replaceChild(inputs[i], lightDOMChildrenSlot);
                if(postfix != null)
                {
                    const postfixSlots = [...this.querySelectorAll('.postfix')] as HTMLElement[];
                    for(let i = 0; i < postfixSlots.length; i++)
                    {
                        const slot = postfixSlots[i];
                        const newPostfix = postfix.cloneNode(true);
                        (newPostfix as HTMLElement).classList.add('postfix');
                        slot.parentElement!.replaceChild(newPostfix, slot);
                    }
                }
                
            }
            this.append(...otherElements);
        }
        else
        {
            if(FormFieldElement.singleTemplateDOM == null)
            {
                FormFieldElement.singleTemplateDOM = FormFieldElement.parser.parseFromString(singleTemplate, 'text/html');
            }

            const fieldTemplate = FormFieldElement.singleTemplateDOM.querySelector('.container')!;
            let input = this.querySelector(inputSelector);
            if(input == null)
            {
                input = document.createElement('input');
                (input as HTMLInputElement).placeholder = this.getAttribute('placeholder') ?? "";
                (input as HTMLInputElement).value = this.getAttribute('value') ?? "";
                (input as HTMLInputElement).name = this.getAttribute('name') ?? "";
            }
            if(input != null)
            {
                const otherElements = [...this.querySelectorAll(`:scope > :not(${inputSelector})`)];

                this.append(fieldTemplate.cloneNode(true));
                const postfixSlot = this.querySelector('.postfix');
                const prefixSlot = this.querySelector('.prefix');
                const lightDOMChildrenSlot = this.querySelector('.light')!;
                if(prefix != null && prefixSlot != null)
                {
                    prefix.classList.add('prefix');
                    prefixSlot.parentElement!.replaceChild(prefix, prefixSlot);
                } 
                lightDOMChildrenSlot.parentElement!.replaceChild(input, lightDOMChildrenSlot);
                if(postfix != null && postfixSlot != null)
                {
                    postfix.classList.add('postfix');
                    postfixSlot.parentElement!.replaceChild(postfix, postfixSlot);
                }

                this.append(...otherElements);
            }
        }

        const fieldLabelSlot = this.querySelector('.field-label');
        if(fieldLabel != null && fieldLabelSlot != null)
        {
            fieldLabel.classList.add('field-label');
            fieldLabelSlot.parentElement!.replaceChild(fieldLabel, fieldLabelSlot);
        }
        else if(fieldLabelSlot != null)
        {
            const labelElement = document.createElement('span');
            labelElement.classList.add('field-label');
            fieldLabelSlot?.replaceWith(labelElement);
        }
        
        const labelValue = this.getAttribute('label');
        const label = this.querySelector('.field-label');
        if(label != null && labelValue != null)
        {
            if(this.hasAttribute('optional'))
            {
                const optionalTitle = this.getAttribute('optional-title');
                const inputs = [...this.querySelectorAll(inputSelector)];
                const optionalCheckbox = document.createElement('input');
                optionalCheckbox.type = 'checkbox';
                optionalCheckbox.classList.add('enabled-checkbox');
                if(optionalTitle != null) { optionalCheckbox.setAttribute('title', optionalTitle); }
                const optionalClass = this.getAttribute('optional-class') ?? 'option-true';
                optionalCheckbox.addEventListener('change', () =>
                {
                    this.setAttribute('optional-value', optionalCheckbox.checked == true ? "true" : "false");
                    for(let i = 0; i < inputs.length; i++)
                    {
                        const input = inputs[i];
                        input.toggleAttribute('disabled', !optionalCheckbox.checked);
                    }

                    const elements = new Set([this,
                        this.querySelector('.container'),
                        this.querySelector('.field-label'),
                        optionalCheckbox,
                        this.querySelector('.field-label span'),
                        ...inputs
                    ]);
                    for(const element of elements)
                    {
                        if(element == null) { continue; }
                        element.classList.toggle(optionalClass, optionalCheckbox.checked);
                        element.part.toggle(optionalClass, optionalCheckbox.checked);
                    }
                });
                const text = document.createElement('span');
                text.textContent = labelValue;
                label.append(optionalCheckbox, text);
        
                const optionalValue = this.getAttribute('optional-value') == 'true' ? true : false;
                optionalCheckbox.checked = optionalValue;
                for(let i = 0; i < inputs.length; i++)
                {
                    const input = inputs[i];
                    input.toggleAttribute('disabled', !optionalCheckbox.checked);
                    input.classList.toggle(optionalClass, optionalCheckbox.checked);
                    input.part.toggle(optionalClass, optionalCheckbox.checked);
                }
            }
            else
            {
                label.textContent = labelValue;
            }
        }

        this.toggleAttribute('initialized', true);
    }

    getLabel(input: HTMLElement)
    {
        if(input.dataset.label != null)
        {
            return input.dataset.label;
        }
        const value = (input.getAttribute('value') ?? "");
        return FormFieldElement.toTitleCase(value);
    }

    static toTitleCase(value: string)
    {
        return value.substring(0, 1).toUpperCase() + value // uppercase first letter
            .replace(/([A-Z]+)/g, " $1") // add space before uppercase letters
            .replace(/-([A-Za-z])/g, " $1") // replace dash with space
            .replace(/([A-Z][a-z])/g, " $1") // put space between any uppercase followed by lowercase
            .replace(/ ([a-z])/g, match => `${match.toUpperCase()}`) // replace all lowercase preceded by a space with their uppercase
            .substring(1) // drop first character
            .trim(); // remove whitespace
    }

    static observedAttributes = [ 'label', 'value', 'placeholder', 'name', 'optional-value', 'disabled' ];
    attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string) 
    {
        if(attributeName == "label")
        {
            const label = this.querySelector('.field-label');
            if(label != null) { label.textContent = newValue; }            
        }
        else if(attributeName == "value")
        {
            const inputSelector = this.getAttribute('input-selector') || 'input,select,textarea';   
            const inputs = [...this.querySelectorAll(inputSelector)] as HTMLElement[];

            if(inputs.length > 1 
            || (inputs.length == 1 && inputs[0].classList.contains('enabled-checkbox')))
            { return; } // prevent setting multiple input values or layout input value

            (inputs[0] as HTMLInputElement).value = newValue;
        }
        else if(attributeName == "optional-value")
        {
            const checkbox = this.querySelector<HTMLInputElement>('.enabled-checkbox');            
            const optionalValue = newValue == 'true' ? true : false;
            if(checkbox != null) { checkbox.checked = optionalValue; }            
        }
        else if(attributeName == "disabled")
        {
            const isDisabled = newValue != null;
            const inputSelector = this.getAttribute('input-selector') || 'input,select,textarea';   
            const inputs = [...this.querySelectorAll(inputSelector)] as HTMLElement[];
            for(let i = 0; i < inputs.length; i++)
            {
                const input = inputs[i];
                if(input.classList.contains('enabled-checkbox')) { continue; }
                if(isDisabled) { input.toggleAttribute('disabled', true); }
                else { input.removeAttribute('disabled'); }
            }
            const checkbox = this.querySelector<HTMLInputElement>('.enabled-checkbox');            
            if(checkbox != null) { checkbox.checked = !isDisabled; }            
        }
        else if(attributeName == "placeholder")
        {
            const inputSelector = this.getAttribute('input-selector') || 'input,select,textarea';   
            const inputs = [...this.querySelectorAll(inputSelector)] as HTMLElement[];
            for(let i = 0; i < inputs.length; i++)
            {
                const input = inputs[i];
                if(input.classList.contains('enabled-checkbox')) { continue; }
                (input as HTMLInputElement).placeholder = newValue;
            }          
        }
        else if(attributeName == "name")
        {
            const inputSelector = this.getAttribute('input-selector') || 'input,select,textarea';   
            const inputs = [...this.querySelectorAll(inputSelector)] as HTMLElement[];
            for(let i = 0; i < inputs.length; i++)
            {
                const input = inputs[i];
                if(input.classList.contains('enabled-checkbox')) { continue; }
                (input as HTMLInputElement).name = newValue;
            }           
        }
    }

    connectedCallback()
    {
        let parent = this.getRootNode() as Document|ShadowRoot;
        parent.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
        this.renderIntoTemplate();        
    }

}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, FormFieldElement);
}
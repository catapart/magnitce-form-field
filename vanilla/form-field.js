// form-field.ts
var COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(`form-field { display: var(--form-field-display, contents) }`);
var singleTemplate = `<label class="container">
<span class="field-label"></span>
<slot class="prefix" name="prefix"></slot>
<slot class="light"></slot>
<slot class="postfix" name="postfix"></slot>
</label>`;
var groupTemplate = `<div class="container">
<span class="field-label"></span>
<label class="option">
    <slot class="prefix" name="prefix"></slot>
    <slot class="light"></slot>
    <slot class="postfix" name="postfix"></slot>
    <span class="label"></span>
</label>
</div>`;
var COMPONENT_TAG_NAME = "form-field";
var FormFieldElement = class _FormFieldElement extends HTMLElement {
  static parser = new DOMParser();
  static singleTemplateDOM;
  static groupTemplateDOM;
  constructor() {
    super();
  }
  renderIntoTemplate() {
    if (this.hasAttribute("initialized")) {
      return;
    }
    const inputSelector = this.getAttribute("input-selector") || "input,select,textarea";
    const groupElements = [...this.querySelectorAll(inputSelector)];
    const prefix = this.querySelector('[slot="prefix"]');
    if (prefix != null) {
      prefix.remove();
    }
    const postfix = this.querySelector('[slot="postfix"]');
    if (postfix != null) {
      postfix.remove();
    }
    if (groupElements.length > 1) {
      if (_FormFieldElement.groupTemplateDOM == null) {
        _FormFieldElement.groupTemplateDOM = _FormFieldElement.parser.parseFromString(groupTemplate, "text/html");
      }
      const inputs = [...this.querySelectorAll(inputSelector)];
      const otherElements = [...this.querySelectorAll(`:scope > :not(${inputSelector})`)];
      this.innerHTML = "";
      this.classList.add("group");
      const containerTemplate = _FormFieldElement.groupTemplateDOM.querySelector(".container");
      const containerFragment = containerTemplate.cloneNode(true);
      this.append(containerFragment);
      const containerClone = this.querySelector(".container");
      const optionTemplate = this.querySelector(".option");
      optionTemplate.remove();
      for (let i = 0; i < inputs.length; i++) {
        const optionClone = optionTemplate.cloneNode(true);
        containerClone.append(optionClone);
        const lightDOMChildrenSlot = this.querySelector(".light");
        const label2 = this.getLabel(inputs[i]);
        lightDOMChildrenSlot.parentElement.querySelector(".label").textContent = label2;
        if (prefix != null) {
          const prefixSlots = [...this.querySelectorAll(".prefix")];
          for (let i2 = 0; i2 < prefixSlots.length; i2++) {
            const slot = prefixSlots[i2];
            const newPrefix = prefix.cloneNode(true);
            newPrefix.classList.add("prefix");
            slot.parentElement.replaceChild(newPrefix, slot);
          }
        }
        lightDOMChildrenSlot.parentElement.replaceChild(inputs[i], lightDOMChildrenSlot);
        if (postfix != null) {
          const postfixSlots = [...this.querySelectorAll(".postfix")];
          for (let i2 = 0; i2 < postfixSlots.length; i2++) {
            const slot = postfixSlots[i2];
            const newPostfix = postfix.cloneNode(true);
            newPostfix.classList.add("postfix");
            slot.parentElement.replaceChild(newPostfix, slot);
          }
        }
      }
      this.append(...otherElements);
    } else {
      if (_FormFieldElement.singleTemplateDOM == null) {
        _FormFieldElement.singleTemplateDOM = _FormFieldElement.parser.parseFromString(singleTemplate, "text/html");
      }
      const fieldTemplate = _FormFieldElement.singleTemplateDOM.querySelector(".container");
      let input = this.querySelector(inputSelector);
      if (input == null) {
        input = document.createElement("input");
        input.placeholder = this.getAttribute("placeholder") ?? "";
        input.value = this.getAttribute("value") ?? "";
      }
      if (input != null) {
        const otherElements = [...this.querySelectorAll(`:scope > :not(${inputSelector})`)];
        this.append(fieldTemplate.cloneNode(true));
        const postfixSlot = this.querySelector(".postfix");
        const prefixSlot = this.querySelector(".prefix");
        const lightDOMChildrenSlot = this.querySelector(".light");
        if (prefix != null && prefixSlot != null) {
          prefix.classList.add("prefix");
          prefixSlot.parentElement.replaceChild(prefix, prefixSlot);
        }
        lightDOMChildrenSlot.parentElement.replaceChild(input, lightDOMChildrenSlot);
        if (postfix != null && postfixSlot != null) {
          postfix.classList.add("postfix");
          postfixSlot.parentElement.replaceChild(postfix, postfixSlot);
        }
        this.append(...otherElements);
      }
    }
    const labelValue = this.getAttribute("label");
    const label = this.querySelector(".field-label");
    if (label != null && labelValue != null) {
      if (this.hasAttribute("optional")) {
        const optionalTitle = this.getAttribute("optional-title");
        const inputs = [...this.querySelectorAll(inputSelector)];
        const optionalCheckbox = document.createElement("input");
        optionalCheckbox.type = "checkbox";
        optionalCheckbox.classList.add("enabled-checkbox");
        if (optionalTitle != null) {
          optionalCheckbox.setAttribute("title", optionalTitle);
        }
        optionalCheckbox.addEventListener("change", () => {
          this.setAttribute("optional-value", optionalCheckbox.checked == true ? "true" : "false");
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (optionalCheckbox.checked == true) {
              input.removeAttribute("disabled");
            } else {
              input.toggleAttribute("disabled", true);
            }
          }
        });
        const text = document.createElement("span");
        text.textContent = labelValue;
        label.append(optionalCheckbox, text);
        const optionalValue = this.getAttribute("optional-value") == "true" ? true : false;
        optionalCheckbox.checked = optionalValue;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          if (optionalCheckbox.checked == true) {
            input.removeAttribute("disabled");
          } else {
            input.setAttribute("disabled", "disabled");
          }
        }
      } else {
        label.textContent = labelValue;
      }
    }
    this.toggleAttribute("initialized", true);
  }
  getLabel(input) {
    if (input.dataset.label != null) {
      return input.dataset.label;
    }
    const value = input.getAttribute("value") ?? "";
    return _FormFieldElement.toTitleCase(value);
  }
  static toTitleCase(value) {
    return value.substring(0, 1).toUpperCase() + value.replace(/([A-Z]+)/g, " $1").replace(/-([A-Za-z])/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/ ([a-z])/g, (match) => `${match.toUpperCase()}`).substring(1).trim();
  }
  static observedAttributes = ["label", "value", "placeholder", "optional-value", "disabled"];
  attributeChangedCallback(attributeName, _oldValue, newValue) {
    if (attributeName == "label") {
      const label = this.querySelector(".field-label");
      if (label != null) {
        label.textContent = newValue;
      }
    } else if (attributeName == "value") {
      const inputSelector = this.getAttribute("input-selector") || "input,select,textarea";
      const inputs = [...this.querySelectorAll(inputSelector)];
      if (inputs.length > 1 || inputs.length == 1 && inputs[0].classList.contains("enabled-checkbox")) {
        return;
      }
      inputs[0].value = newValue;
    } else if (attributeName == "optional-value") {
      const checkbox = this.querySelector(".enabled-checkbox");
      const optionalValue = newValue == "true" ? true : false;
      if (checkbox != null) {
        checkbox.checked = optionalValue;
      }
    } else if (attributeName == "disabled") {
      const isDisabled = newValue != null;
      const inputSelector = this.getAttribute("input-selector") || "input,select,textarea";
      const inputs = [...this.querySelectorAll(inputSelector)];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.classList.contains("enabled-checkbox")) {
          continue;
        }
        if (isDisabled) {
          input.toggleAttribute("disabled", true);
        } else {
          input.removeAttribute("disabled");
        }
      }
      const checkbox = this.querySelector(".enabled-checkbox");
      if (checkbox != null) {
        checkbox.checked = !isDisabled;
      }
    } else if (attributeName == "placeholder") {
      const isDisabled = newValue != null;
      const inputSelector = this.getAttribute("input-selector") || "input,select,textarea";
      const inputs = [...this.querySelectorAll(inputSelector)];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.classList.contains("enabled-checkbox")) {
          continue;
        }
        input.placeholder = newValue;
      }
      const checkbox = this.querySelector(".enabled-checkbox");
      if (checkbox != null) {
        checkbox.checked = !isDisabled;
      }
    }
  }
  connectedCallback() {
    let parent = this.getRootNode();
    parent.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
    this.renderIntoTemplate();
  }
};
if (customElements.get(COMPONENT_TAG_NAME) == null) {
  customElements.define(COMPONENT_TAG_NAME, FormFieldElement);
}
export {
  FormFieldElement
};

# `<form-field>` Element
A custom `HTMLElement` that wraps inputs with a practical layout and common interaction functionality.

Package size: ~6kb minified, ~10kb verbose.

## Quick Reference
```html
<form>
<form-field label="No Input" placeholder="This form-field has no inputs"></form-field>
<form-field label="Custom Text Input">
    <input type="text" name="custom-text" placeholder="This input is defined in the html" />
</form-field>
</form>
<script type="module" src="/path/to/form-field[.min].js"></script>
```

## Demos
https://catapart.github.io/magnitce-form-field/demo/

## Support
- Firefox
- Chrome
- Edge
- <s>Safari</s> (Has not been tested; should be supported, based on custom element support)

## Getting Started
 1. [Install/Reference the library](#referenceinstall)

### Reference/Install
#### HTML Import (not required for vanilla js/ts; alternative to import statement)
```html
<script type="module" src="/path/to/form-field[.min].js"></script>
```
#### npm
```cmd
npm install @magnit-ce/form-field
```

### Import
#### Vanilla js/ts
```js
import "/path/to/form-field[.min].js"; // if you didn't reference from a <script>, reference with an import like this

import { FormFieldElement } from "/path/to/form-field[.min].js";
```
#### npm
```js
import "@magnit-ce/form-field"; // if you didn't reference from a <script>, reference with an import like this

import { FormFieldElement } from "@magnit-ce/form-field";
```

---
---
---

## Overview
The `<form-field>` element is a convenience element with the intention of cutting down on boilerplate. While the browser default functionality for putting inputs inside of `<label>` elements are great, actually writing the wrapper, plus the field title scaffolding, plus any input grouping, plus controls for enabling and disabling the input(s) - it all adds up to a lot of html. Especially if it is handwritten.

By using attributes and well-established patterns, the `<form-field>` element provides common-sense conveniences for writing forms.

# Inputs and Customization
The `<form-field>` element will use a `querySelector` call to find any inputs in its content by querying for the value of the `input-selector` attribute.  
By default, this property's value is `input,select,textarea`, which will determine that any child element that is an `<input>`, a `<select>`, or a `<textarea>` element will be interpreted by the `<form-field>` element as its "input".

The `input-selector` attribute can be changed to select any arbitrary element types, which can be useful for custom element inputs, or custom components/controls that provide a form field value. For example, these `<form-field>` elements will each recognize their *(fictional)* child component as their "input"s.
```html
<form-field input-selector="ReactDropdown">
    <ReactDropdown />
</form-field>
<form-field input-selector=".react-dropdown">
    <ReactDropdown class="react-dropdown" />
</form-field>
```

## Single Input vs Input Groups
The `<form-field>` element includes two different template types that are selected based on whether the element is given a single [input](#inputs-and-customization) as a child, or multiple [input](#inputs-and-customization)s as children.

Input groups are often useful for things like checkbox options or radio buttons. In addition to those use-cases, the `<form-field>` element allows for multiple  inputs of any type (`<input type="text">`, or `<select>`, for example) to be grouped together in a single field, as well.

Regardless of input type, the `<form-field>` element includes the field's label as a group name, but also translates any of the inputs' `value` attributes into a title-cased version of that value which is added after the input, to match the most common presentation of radio/checkbox inputs. For cases where the input's value is inappropriate as its title, adding a `data-label` attribute to the input will override that input's title with the exact string value of the `data-label` attribute.

The `<form-field>` element provides each input with its own label so that clicking the input's title text will activate/focus the input. If there is only a single input, the label will act as the field's container element. If there are multiple inputs, the labels are collected into a parent container.

## Templates
The `<form-field>` element uses one of two templates to render its content, depending on whether there is a single input, or mutlipel inputs. These templates can be overridden in javascript by setting the `<form-field>` element's `static` `singleTemplateDOM` and `groupTemplateDOM` properties.

For a single input template, the template must include an element with a class of `container`, that includes a `<slot class="light"></slot>` element. That element defines where the input will be placed within the template.

For a multiple-input template, the "container" must be included but rather than having the "light slot" be included as direct child, the slot must be inside of an element with a class of `option`. The "option" element will be used as a template (within a template) for each provided input. 

## Attributes
|Attribute Name|Description|
|-|-|
|`label`|Sets the text content of the title for the input.|
|`value`|Sets the value for a single input. Does not have an effect if multiple inputs are used.|
|`placholder`|Sets the placholder attribute for each input the `<form-field>` manages.|
|`name`|Sets the name attribute for each input the `<form-field>` manages.|
|`optional`|When present, adds a checkbox to the `<form-field>`'s title which, when checked, toggles the child inputs' `disabled` attributes.|
|`optional-title`|A value that is set as the `title` attribute's value for the checkbox that toggles whether inputs are enabled.|
|`optional-value`|Sets the checked state of the checkbox that toggles whether inputs are enabled.|
|`input-selector`|The string that will be used as an element query for finding inputs in the `<form-field>` element's children. Default value: `input,select,textarea`|
|`disabled`|Toggles each child input's `disabled` attribute to match the `<form-field>` element.|
|`initialized`|When present, indicates that the `<form-field>` element has been initialized and prevents re-initializing the same element. Added automatically after initialization.|


## Layout Elements
The `<form-field>` element does not make use of the shadowDOM. Each of the elements it injects for layout are given classes that allow the `<form-field>` element to query for them and provide the expected functionality.

Each of these layout elements, along with their identifying class names, are listed below:
|Class Name|Element Description|Element Type
|-|-|-|
|`label`|A `<label>` element that acts as a container and provides click functionality for invoking the nested input.|`HTMLLabelElement`|
|`input`|The input that invokes the browser functionality like launching a file browser. Hidden by default.|`HTMLInputElement[type="file"]`|
|`field`|The container for the placeholder, the preview, and the labels. This part includes everything that is not the "Clear" and "View Document" links.|`HTMLSpanElement`|
|`icon`|An icon that represents a file.|`HTMLSpanElement`|
|`status`|A container for either the placeholder text, or the filename of the selected file.|`HTMLSpanElement`|
|`filename`|Displays the filename of the selected file. Hidden when there is no selection.|`HTMLSpanElement`|
|`placeholder`|Displays the placeholder text. Hidden when a selection has been made.|`HTMLSpanElement`|
|`clear`|A link that clears the input, if a selection has been made.|`HTMLAnchorElement`|
|`view-link`|A link that opens the selected file in a new browser context (tab/window).|`HTMLAnchorElement`|

## Slots
The `<form-field>` element includes `<slot>` elements as a way to manage its templated content. These `<slot>`s are not being used for their custom element functionality, but rather as placeholders for the expected content.

Like other layout elements, each slot is given a class name that identifies it. The `light` slot is where the [child input element will be placed](#templates). The `prefix` slot is injected before each of the child input elements, and the `postfix` slot is injected after each of them.

Unlike default `<slot>` functionality, a single slot may only be replaced by a single element. For the `light` slot, this is not an issue because multiple inputs are treated differently by the `<form-field>` element. For the `prefix` and `postfix` slots, though, only the first element provided with that slot name will be used as the `prefix` or `postfix` respectively.  
*(To workaround this, add multiple elements to a div, give that div a the slot attribute you are targeting, and set its display style to `contents`.)*

By default, slots have a display property of `contents` which means they are treated as non-entities by the DOM renderer.

Each of the `<form-field>` element's slots are listed below:
|Slot Name|Description|Default
|-|-|-|
|`light`|The target input element.|`HTMLInputElement[type="text"]`|
|`prefix`|An element directly before the target input element, or before each of the input elements.|`[empty]`|
|`postfix`|An element directly after the target input element, or after each of the input elements.|`[empty]`|

## Styling
The `<form-field>` element can be styled with CSS, normally. It does not make use of the shadowDOM, and each of its layout elements are given class names to identify them to the element.

By default, the `<form-field>` element has a `display` style of `contents`. This means that the `.container` element is the most useful to target for editing styles. The `.container` element can be seen as the "top level" element, since any element with a display of `contents` is ignored by the DOM renderer and its contents are treated as if they were injected at the same level of that element.

Each class used by the `<form-field>` element is listed below:
|Class Name|Description
|-|-|
|`container`|For single inputs, the label that wraps the input and title. For multiple inputs, a `<div>` that wraps each input's parent `<label>`.|
|`field-label`|The element the displays the field's title.|
|`option`|A container `<label>` element for each input when multiple inputs are provided.|
|`prefix`|An element directly before the target input element, or before each of the input elements.|
|`light`|The target input element.|
|`postfix`|An element directly after the target input element, or after each of the input elements.|
|`label`|When multiple inputs are provided, this element appears after each input and display's that input's title.|
|`enabled-checkbox`|The checkbox that is added when the `optional` attribute is provided.|
|`group`|This class is added to the `form-field` element whenever multiple inputs are provided. Intended for convenience when running a dynamic query.|

In this example, the `.field-label` element is being selected for styling:
```css
form-field .field-label
{
    /* styling */
}
```
For a list of all layout classes, see the [layout](#layout-elements) section.

Here is an example of styling the form-field's display based on its input's validity state:
```css
form-field .container:has(:invalid)
{
    border-color: red;
}
```

## License
This library is in the public domain. You do not need permission, nor do you need to provide attribution, in order to use, modify, reproduce, publish, or sell it or any works using it or derived from it.
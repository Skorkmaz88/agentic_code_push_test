export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  errorMessage?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  validationState?: 'success' | 'error' | 'warning';
  onChange?: (value: string, event: Event) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}

export class Input {
  private container: HTMLDivElement;
  private input: HTMLInputElement;
  private label?: HTMLLabelElement;
  private errorElement?: HTMLDivElement;
  private helpElement?: HTMLDivElement;
  private props: InputProps;
  private inputId: string;

  constructor(props: InputProps) {
    this.props = props;
    this.inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    this.container = this.createElement();
  }

  private createElement(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = this.getContainerClassName();

    // Create label if provided
    if (this.props.label) {
      this.label = this.createLabel();
      container.appendChild(this.label);
    }

    // Create input
    this.input = this.createInput();
    container.appendChild(this.input);

    // Create help text if provided
    if (this.props.helpText && !this.props.errorMessage) {
      this.helpElement = this.createHelpText();
      container.appendChild(this.helpElement);
    }

    // Create error message if provided
    if (this.props.errorMessage) {
      this.errorElement = this.createErrorMessage();
      container.appendChild(this.errorElement);
    }

    return container;
  }

  private getContainerClassName(): string {
    const baseClass = 'input-field';
    const validation = this.props.validationState ? `input-field--${this.props.validationState}` : '';
    const disabled = this.props.disabled ? 'input-field--disabled' : '';
    const custom = this.props.className || '';

    return [baseClass, validation, disabled, custom]
      .filter(Boolean)
      .join(' ');
  }

  private createLabel(): HTMLLabelElement {
    const label = document.createElement('label');
    label.htmlFor = this.inputId;
    label.className = 'input-field__label';
    label.textContent = this.props.label!;

    if (this.props.required) {
      const requiredSpan = document.createElement('span');
      requiredSpan.className = 'input-field__required';
      requiredSpan.textContent = ' *';
      requiredSpan.setAttribute('aria-label', 'required');
      label.appendChild(requiredSpan);
    }

    return label;
  }

  private createInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = this.props.type || 'text';
    input.id = this.inputId;
    input.className = 'input-field__input';
    
    if (this.props.name) input.name = this.props.name;
    if (this.props.placeholder) input.placeholder = this.props.placeholder;
    if (this.props.value !== undefined) input.value = this.props.value;
    if (this.props.defaultValue) input.defaultValue = this.props.defaultValue;
    if (this.props.autoComplete) input.autocomplete = this.props.autoComplete;
    
    input.required = this.props.required || false;
    input.disabled = this.props.disabled || false;
    input.readOnly = this.props.readonly || false;

    // Set ARIA attributes
    if (this.props.errorMessage) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${this.inputId}-error`);
    } else if (this.props.helpText) {
      input.setAttribute('aria-describedby', `${this.inputId}-help`);
    }

    // Add event listeners
    if (this.props.onChange) {
      input.addEventListener('input', (e) => {
        this.props.onChange!(input.value, e);
      });
    }

    if (this.props.onBlur) {
      input.addEventListener('blur', this.props.onBlur);
    }

    if (this.props.onFocus) {
      input.addEventListener('focus', this.props.onFocus);
    }

    return input;
  }

  private createHelpText(): HTMLDivElement {
    const help = document.createElement('div');
    help.id = `${this.inputId}-help`;
    help.className = 'input-field__help';
    help.textContent = this.props.helpText!;
    return help;
  }

  private createErrorMessage(): HTMLDivElement {
    const error = document.createElement('div');
    error.id = `${this.inputId}-error`;
    error.className = 'input-field__error';
    error.textContent = this.props.errorMessage!;
    error.setAttribute('role', 'alert');
    return error;
  }

  public render(): HTMLDivElement {
    return this.container;
  }

  public getValue(): string {
    return this.input.value;
  }

  public setValue(value: string): void {
    this.input.value = value;
  }

  public focus(): void {
    this.input.focus();
  }

  public blur(): void {
    this.input.blur();
  }

  public updateProps(newProps: Partial<InputProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // Re-create container with new props
    const oldContainer = this.container;
    this.container = this.createElement();
    
    // Replace in DOM if container is already attached
    if (oldContainer.parentNode) {
      oldContainer.parentNode.replaceChild(this.container, oldContainer);
    }
  }

  public setValidationState(state: 'success' | 'error' | 'warning', message?: string): void {
    if (state === 'error' && message) {
      this.updateProps({ validationState: state, errorMessage: message });
    } else {
      this.updateProps({ validationState: state, errorMessage: undefined });
    }
  }
}
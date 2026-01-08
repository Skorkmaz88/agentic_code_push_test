export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent) => void;
  children: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export class Button {
  private element: HTMLButtonElement;
  private props: ButtonProps;
  private spinner?: HTMLElement;

  constructor(props: ButtonProps) {
    this.props = props;
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = this.props.type || 'button';
    button.className = this.getClassName();
    button.disabled = this.props.disabled || this.props.loading || false;
    
    // Set accessibility attributes
    button.setAttribute('aria-disabled', (this.props.disabled || this.props.loading).toString());
    
    if (this.props.loading) {
      button.setAttribute('aria-busy', 'true');
      this.createSpinner();
      button.appendChild(this.spinner!);
    } else {
      button.textContent = this.props.children;
    }

    // Add event listener
    if (this.props.onClick && !this.props.disabled && !this.props.loading) {
      button.addEventListener('click', this.props.onClick);
    }

    return button;
  }

  private getClassName(): string {
    const baseClass = 'btn';
    const variant = `btn--${this.props.variant || 'primary'}`;
    const size = `btn--${this.props.size || 'medium'}`;
    const disabled = this.props.disabled ? 'btn--disabled' : '';
    const loading = this.props.loading ? 'btn--loading' : '';
    const custom = this.props.className || '';

    return [baseClass, variant, size, disabled, loading, custom]
      .filter(Boolean)
      .join(' ');
  }

  private createSpinner(): void {
    this.spinner = document.createElement('span');
    this.spinner.className = 'btn__spinner';
    this.spinner.setAttribute('aria-hidden', 'true');
    
    // Simple text spinner - can be replaced with SVG
    this.spinner.textContent = '⟳';
  }

  public render(): HTMLButtonElement {
    return this.element;
  }

  public updateProps(newProps: Partial<ButtonProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // Re-create element with new props
    const oldElement = this.element;
    this.element = this.createElement();
    
    // Replace in DOM if element is already attached
    if (oldElement.parentNode) {
      oldElement.parentNode.replaceChild(this.element, oldElement);
    }
  }

  public setLoading(loading: boolean): void {
    this.updateProps({ loading });
  }

  public setDisabled(disabled: boolean): void {
    this.updateProps({ disabled });
  }
}
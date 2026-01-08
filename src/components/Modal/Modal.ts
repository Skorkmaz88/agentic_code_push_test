export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: HTMLElement | HTMLElement[] | string;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

export class Modal {
  private portal?: HTMLDivElement;
  private backdrop?: HTMLDivElement;
  private modal?: HTMLDivElement;
  private header?: HTMLDivElement;
  private body?: HTMLDivElement;
  private closeButton?: HTMLButtonElement;
  private props: ModalProps;
  private previousFocusedElement?: HTMLElement;
  private focusableElements: HTMLElement[] = [];

  constructor(props: ModalProps) {
    this.props = props;
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.trapFocus = this.trapFocus.bind(this);
    
    if (props.isOpen) {
      this.show();
    }
  }

  private createElement(): void {
    // Create portal
    this.portal = document.createElement('div');
    this.portal.className = 'modal-portal';
    
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    
    if (this.props.closeOnBackdropClick !== false) {
      this.backdrop.addEventListener('click', this.handleBackdropClick);
    }

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = this.getModalClassName();
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    
    if (this.props.title) {
      this.modal.setAttribute('aria-labelledby', 'modal-title');
    }

    // Create header if title or close button needed
    if (this.props.title || this.props.showCloseButton !== false) {
      this.header = this.createHeader();
      this.modal.appendChild(this.header);
    }

    // Create body
    this.body = this.createBody();
    this.modal.appendChild(this.body);

    // Assemble structure
    this.backdrop.appendChild(this.modal);
    this.portal.appendChild(this.backdrop);
  }

  private getModalClassName(): string {
    const baseClass = 'modal';
    const size = `modal--${this.props.size || 'medium'}`;
    const custom = this.props.className || '';

    return [baseClass, size, custom].filter(Boolean).join(' ');
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'modal__header';

    if (this.props.title) {
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.className = 'modal__title';
      title.textContent = this.props.title;
      header.appendChild(title);
    }

    if (this.props.showCloseButton !== false) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'modal__close';
      this.closeButton.setAttribute('aria-label', 'Close modal');
      this.closeButton.innerHTML = '✕';
      this.closeButton.addEventListener('click', () => this.props.onClose());
      header.appendChild(this.closeButton);
    }

    return header;
  }

  private createBody(): HTMLDivElement {
    const body = document.createElement('div');
    body.className = 'modal__body';

    if (this.props.children) {
      if (typeof this.props.children === 'string') {
        body.innerHTML = this.props.children;
      } else if (Array.isArray(this.props.children)) {
        this.props.children.forEach(child => body.appendChild(child));
      } else {
        body.appendChild(this.props.children);
      }
    }

    return body;
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.props.closeOnEscape !== false) {
      this.props.onClose();
    }
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.backdrop) {
      this.props.onClose();
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modal) return [];

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(this.modal.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled')) as HTMLElement[];
  }

  public show(): void {
    if (!this.portal) {
      this.createElement();
    }

    // Store previously focused element
    this.previousFocusedElement = document.activeElement as HTMLElement;

    // Add to DOM
    document.body.appendChild(this.portal!);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Set up event listeners
    if (this.props.closeOnEscape !== false) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
    
    document.addEventListener('keydown', this.trapFocus);

    // Focus management
    this.focusableElements = this.getFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    } else if (this.modal) {
      this.modal.focus();
    }

    // Add animation class
    requestAnimationFrame(() => {
      this.portal?.classList.add('modal-portal--open');
    });
  }

  public hide(): void {
    if (!this.portal) return;

    // Remove animation class
    this.portal.classList.remove('modal-portal--open');

    // Wait for animation to complete
    setTimeout(() => {
      // Remove event listeners
      document.removeEventListener('keydown', this.handleEscapeKey);
      document.removeEventListener('keydown', this.trapFocus);

      // Remove from DOM
      if (this.portal?.parentNode) {
        document.body.removeChild(this.portal);
      }

      // Restore document scroll
      document.body.style.overflow = '';

      // Restore focus
      if (this.previousFocusedElement) {
        this.previousFocusedElement.focus();
      }
    }, 200); // Match CSS animation duration
  }

  public updateProps(newProps: Partial<ModalProps>): void {
    const wasOpen = this.props.isOpen;
    this.props = { ...this.props, ...newProps };

    if (wasOpen && !this.props.isOpen) {
      this.hide();
    } else if (!wasOpen && this.props.isOpen) {
      this.show();
    } else if (this.props.isOpen) {
      // Re-render if modal is open
      this.hide();
      setTimeout(() => this.show(), 200);
    }
  }

  public updateContent(children: HTMLElement | HTMLElement[] | string): void {
    if (!this.body) return;

    this.body.innerHTML = '';

    if (typeof children === 'string') {
      this.body.innerHTML = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => this.body.appendChild(child));
    } else {
      this.body.appendChild(children);
    }

    // Update focusable elements
    this.focusableElements = this.getFocusableElements();
  }

  public destroy(): void {
    this.hide();
    this.portal = undefined;
    this.backdrop = undefined;
    this.modal = undefined;
    this.header = undefined;
    this.body = undefined;
    this.closeButton = undefined;
  }
}
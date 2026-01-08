export interface CardProps {
  title?: string;
  children?: HTMLElement | HTMLElement[] | string;
  footer?: HTMLElement | string;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
  onClick?: (event: MouseEvent) => void;
  hoverable?: boolean;
}

export class Card {
  private container: HTMLDivElement;
  private header?: HTMLDivElement;
  private body: HTMLDivElement;
  private footer?: HTMLDivElement;
  private props: CardProps;

  constructor(props: CardProps) {
    this.props = props;
    this.container = this.createElement();
  }

  private createElement(): HTMLDivElement {
    const card = document.createElement('div');
    card.className = this.getClassName();

    // Add click handler if provided
    if (this.props.onClick) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', this.props.onClick);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      
      // Add keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.props.onClick!(e as any);
        }
      });
    }

    // Create header if title is provided
    if (this.props.title) {
      this.header = this.createHeader();
      card.appendChild(this.header);
    }

    // Create body
    this.body = this.createBody();
    card.appendChild(this.body);

    // Create footer if provided
    if (this.props.footer) {
      this.footer = this.createFooter();
      card.appendChild(this.footer);
    }

    return card;
  }

  private getClassName(): string {
    const baseClass = 'card';
    const variant = `card--${this.props.variant || 'default'}`;
    const hoverable = this.props.hoverable || this.props.onClick ? 'card--hoverable' : '';
    const custom = this.props.className || '';

    return [baseClass, variant, hoverable, custom]
      .filter(Boolean)
      .join(' ');
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'card__header';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = this.props.title!;

    header.appendChild(title);
    return header;
  }

  private createBody(): HTMLDivElement {
    const body = document.createElement('div');
    body.className = 'card__body';

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

  private createFooter(): HTMLDivElement {
    const footer = document.createElement('div');
    footer.className = 'card__footer';

    if (typeof this.props.footer === 'string') {
      footer.innerHTML = this.props.footer;
    } else {
      footer.appendChild(this.props.footer!);
    }

    return footer;
  }

  public render(): HTMLDivElement {
    return this.container;
  }

  public updateContent(children: HTMLElement | HTMLElement[] | string): void {
    // Clear existing content
    this.body.innerHTML = '';

    if (typeof children === 'string') {
      this.body.innerHTML = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => this.body.appendChild(child));
    } else {
      this.body.appendChild(children);
    }
  }

  public updateTitle(title: string): void {
    if (!this.header) {
      this.props.title = title;
      this.header = this.createHeader();
      this.container.insertBefore(this.header, this.body);
    } else {
      const titleElement = this.header.querySelector('.card__title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    this.props.title = title;
  }

  public updateFooter(footer: HTMLElement | string): void {
    if (!this.footer) {
      this.props.footer = footer;
      this.footer = this.createFooter();
      this.container.appendChild(this.footer);
    } else {
      this.footer.innerHTML = '';
      if (typeof footer === 'string') {
        this.footer.innerHTML = footer;
      } else {
        this.footer.appendChild(footer);
      }
    }
    this.props.footer = footer;
  }

  public updateProps(newProps: Partial<CardProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // Re-create container with new props
    const oldContainer = this.container;
    this.container = this.createElement();
    
    // Replace in DOM if container is already attached
    if (oldContainer.parentNode) {
      oldContainer.parentNode.replaceChild(this.container, oldContainer);
    }
  }

  public setVariant(variant: 'default' | 'elevated' | 'bordered'): void {
    this.props.variant = variant;
    this.container.className = this.getClassName();
  }

  public setHoverable(hoverable: boolean): void {
    this.props.hoverable = hoverable;
    this.container.className = this.getClassName();
  }
}
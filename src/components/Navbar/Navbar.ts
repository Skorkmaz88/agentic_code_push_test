export interface MenuItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: string;
}

export interface User {
  name: string;
  email?: string;
  avatar?: string;
}

export interface NavbarProps {
  brand?: string;
  brandHref?: string;
  menuItems?: MenuItem[];
  user?: User;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onUserAction?: (action: string) => void;
  className?: string;
  showSearch?: boolean;
}

export class Navbar {
  private container: HTMLElement;
  private brand?: HTMLElement;
  private nav?: HTMLElement;
  private menuToggle?: HTMLButtonElement;
  private mobileMenu?: HTMLDivElement;
  private searchInput?: HTMLInputElement;
  private userDropdown?: HTMLDivElement;
  private props: NavbarProps;
  private isMobileMenuOpen = false;
  private isUserDropdownOpen = false;

  constructor(props: NavbarProps) {
    this.props = props;
    this.container = this.createElement();
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const navbar = document.createElement('nav');
    navbar.className = this.getClassName();
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Main navigation');

    // Create brand section
    if (this.props.brand) {
      this.brand = this.createBrand();
      navbar.appendChild(this.brand);
    }

    // Create desktop navigation
    if (this.props.menuItems && this.props.menuItems.length > 0) {
      this.nav = this.createDesktopNav();
      navbar.appendChild(this.nav);
    }

    // Create search if enabled
    if (this.props.showSearch && this.props.onSearch) {
      const searchContainer = this.createSearch();
      navbar.appendChild(searchContainer);
    }

    // Create user section
    if (this.props.user) {
      const userSection = this.createUserSection();
      navbar.appendChild(userSection);
    }

    // Create mobile menu toggle
    if (this.props.menuItems && this.props.menuItems.length > 0) {
      this.menuToggle = this.createMobileToggle();
      navbar.appendChild(this.menuToggle);

      // Create mobile menu
      this.mobileMenu = this.createMobileMenu();
      navbar.appendChild(this.mobileMenu);
    }

    return navbar;
  }

  private getClassName(): string {
    const baseClass = 'navbar';
    const custom = this.props.className || '';
    return [baseClass, custom].filter(Boolean).join(' ');
  }

  private createBrand(): HTMLElement {
    const brand = document.createElement('div');
    brand.className = 'navbar__brand';

    if (this.props.brandHref) {
      const link = document.createElement('a');
      link.href = this.props.brandHref;
      link.className = 'navbar__brand-link';
      link.textContent = this.props.brand!;
      brand.appendChild(link);
    } else {
      brand.textContent = this.props.brand!;
    }

    return brand;
  }

  private createDesktopNav(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'navbar__nav navbar__nav--desktop';

    const list = document.createElement('ul');
    list.className = 'navbar__nav-list';

    this.props.menuItems!.forEach(item => {
      const listItem = document.createElement('li');
      listItem.className = 'navbar__nav-item';

      const link = document.createElement('a');
      link.href = item.href;
      link.className = `navbar__nav-link ${item.active ? 'navbar__nav-link--active' : ''}`;
      link.textContent = item.label;

      if (item.active) {
        link.setAttribute('aria-current', 'page');
      }

      listItem.appendChild(link);
      list.appendChild(listItem);
    });

    nav.appendChild(list);
    return nav;
  }

  private createSearch(): HTMLDivElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'navbar__search';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'search';
    this.searchInput.className = 'navbar__search-input';
    this.searchInput.placeholder = 'Search...';
    this.searchInput.setAttribute('aria-label', 'Search');

    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'navbar__search-button';
    searchButton.setAttribute('aria-label', 'Submit search');
    searchButton.innerHTML = '🔍';

    searchContainer.appendChild(this.searchInput);
    searchContainer.appendChild(searchButton);

    // Add event listeners
    const handleSearch = () => {
      if (this.props.onSearch && this.searchInput) {
        this.props.onSearch(this.searchInput.value);
      }
    };

    searchButton.addEventListener('click', handleSearch);
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });

    return searchContainer;
  }

  private createUserSection(): HTMLDivElement {
    const userSection = document.createElement('div');
    userSection.className = 'navbar__user';

    const userButton = document.createElement('button');
    userButton.className = 'navbar__user-button';
    userButton.setAttribute('aria-haspopup', 'true');
    userButton.setAttribute('aria-expanded', 'false');

    // User avatar or initial
    const avatar = document.createElement('div');
    avatar.className = 'navbar__user-avatar';
    
    if (this.props.user!.avatar) {
      const img = document.createElement('img');
      img.src = this.props.user!.avatar;
      img.alt = this.props.user!.name;
      avatar.appendChild(img);
    } else {
      avatar.textContent = this.props.user!.name.charAt(0).toUpperCase();
    }

    const userName = document.createElement('span');
    userName.className = 'navbar__user-name';
    userName.textContent = this.props.user!.name;

    userButton.appendChild(avatar);
    userButton.appendChild(userName);

    // Create dropdown
    this.userDropdown = document.createElement('div');
    this.userDropdown.className = 'navbar__user-dropdown';
    this.userDropdown.setAttribute('role', 'menu');

    const dropdownItems = [
      { label: 'Profile', action: 'profile' },
      { label: 'Settings', action: 'settings' },
      { label: 'Logout', action: 'logout' }
    ];

    dropdownItems.forEach(item => {
      const dropdownItem = document.createElement('button');
      dropdownItem.className = 'navbar__user-dropdown-item';
      dropdownItem.setAttribute('role', 'menuitem');
      dropdownItem.textContent = item.label;
      
      dropdownItem.addEventListener('click', () => {
        if (item.action === 'logout' && this.props.onLogout) {
          this.props.onLogout();
        } else if (this.props.onUserAction) {
          this.props.onUserAction(item.action);
        }
        this.closeUserDropdown();
      });

      this.userDropdown.appendChild(dropdownItem);
    });

    userSection.appendChild(userButton);
    userSection.appendChild(this.userDropdown);

    // Add click handler for user button
    userButton.addEventListener('click', () => {
      this.toggleUserDropdown();
    });

    return userSection;
  }

  private createMobileToggle(): HTMLButtonElement {
    const toggle = document.createElement('button');
    toggle.className = 'navbar__mobile-toggle';
    toggle.setAttribute('aria-label', 'Toggle mobile menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '☰';

    toggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    return toggle;
  }

  private createMobileMenu(): HTMLDivElement {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'navbar__mobile-menu';
    mobileMenu.setAttribute('aria-hidden', 'true');

    if (this.props.menuItems) {
      const list = document.createElement('ul');
      list.className = 'navbar__mobile-list';

      this.props.menuItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'navbar__mobile-item';

        const link = document.createElement('a');
        link.href = item.href;
        link.className = `navbar__mobile-link ${item.active ? 'navbar__mobile-link--active' : ''}`;
        link.textContent = item.label;

        listItem.appendChild(link);
        list.appendChild(listItem);
      });

      mobileMenu.appendChild(list);
    }

    return mobileMenu;
  }

  private setupEventListeners(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (this.userDropdown && !this.container.contains(e.target as Node)) {
        this.closeUserDropdown();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeUserDropdown();
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    });
  }

  private toggleMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  private openMobileMenu(): void {
    if (!this.mobileMenu || !this.menuToggle) return;

    this.isMobileMenuOpen = true;
    this.mobileMenu.classList.add('navbar__mobile-menu--open');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
  }

  private closeMobileMenu(): void {
    if (!this.mobileMenu || !this.menuToggle) return;

    this.isMobileMenuOpen = false;
    this.mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
  }

  private toggleUserDropdown(): void {
    if (this.isUserDropdownOpen) {
      this.closeUserDropdown();
    } else {
      this.openUserDropdown();
    }
  }

  private openUserDropdown(): void {
    if (!this.userDropdown) return;

    this.isUserDropdownOpen = true;
    this.userDropdown.classList.add('navbar__user-dropdown--open');
    
    const userButton = this.container.querySelector('.navbar__user-button');
    userButton?.setAttribute('aria-expanded', 'true');
  }

  private closeUserDropdown(): void {
    if (!this.userDropdown) return;

    this.isUserDropdownOpen = false;
    this.userDropdown.classList.remove('navbar__user-dropdown--open');
    
    const userButton = this.container.querySelector('.navbar__user-button');
    userButton?.setAttribute('aria-expanded', 'false');
  }

  public render(): HTMLElement {
    return this.container;
  }

  public setActiveMenuItem(href: string): void {
    if (!this.props.menuItems) return;

    // Update props
    this.props.menuItems = this.props.menuItems.map(item => ({
      ...item,
      active: item.href === href
    }));

    // Update DOM
    const links = this.container.querySelectorAll('.navbar__nav-link, .navbar__mobile-link');
    links.forEach(link => {
      const linkElement = link as HTMLAnchorElement;
      if (linkElement.href.endsWith(href)) {
        linkElement.classList.add('navbar__nav-link--active', 'navbar__mobile-link--active');
        linkElement.setAttribute('aria-current', 'page');
      } else {
        linkElement.classList.remove('navbar__nav-link--active', 'navbar__mobile-link--active');
        linkElement.removeAttribute('aria-current');
      }
    });
  }

  public updateUser(user: User): void {
    this.props.user = user;
    
    // Re-create user section
    const oldUserSection = this.container.querySelector('.navbar__user');
    if (oldUserSection) {
      const newUserSection = this.createUserSection();
      this.container.replaceChild(newUserSection, oldUserSection);
    }
  }

  public destroy(): void {
    // Remove event listeners
    document.removeEventListener('click', this.closeUserDropdown);
    document.removeEventListener('keydown', this.closeUserDropdown);
  }
}
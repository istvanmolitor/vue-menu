import type { Component } from 'vue'

/**
 * Menu item configuration interface
 * Supports multi-level nested menu items
 */
export interface MenuItemConfig {
  /** Unique identifier for the menu item */
  id?: string

  /** Display title */
  title: string

  /** Route path (optional for parent items) */
  path?: string

  /** Icon component from lucide-vue-next */
  icon?: Component

  /** Child menu items for multi-level menus */
  children?: MenuItemConfig[]

  /** Display order (lower numbers appear first) */
  order?: number

  /** Required permission to view this menu item (optional) */
  permission?: string

  /** Additional metadata */
  meta?: Record<string, any>
}

/**
 * Package menu configuration
 * Used for registering package menus with the menu registry
 */
export interface PackageMenuConfig {
  /** Package name */
  packageName: string

  /** Menu configuration */
  menu: MenuItemConfig
}

/**
 * Menu Builder Class
 * Builders extend this class to construct menu items dynamically
 */
export class MenuBuilder {
  /**
   * Build the menu structure
   * @param menu - Current menu configuration
   * @param menuName - Name of the menu being built
   * @returns Updated menu configuration
   */
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    return menu
  }

  /**
   * Add a menu item to the configuration
   * @param menu - Target menu configuration
   * @param item - Item to add
   */
  addMenuItem(menu: MenuItemConfig, item: MenuItemConfig): void {
    if (!menu.children) {
      menu.children = []
    }
    menu.children.push(item)
  }
}

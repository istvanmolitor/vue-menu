import type { MenuItemConfig } from '../types/menu'
import { menuRegistry } from './menuRegistry'

/**
 * Get a menu by name
 * @param menuName - Name of the menu to get
 * @returns Menu configuration or undefined if not found
 */
export function getMenu(menuName: string): MenuItemConfig | undefined {
  return menuRegistry.getMenu(menuName)
}

/**
 * Get all registered menu names
 * @returns Array of menu names
 */
export function getMenuNames(): string[] {
  return menuRegistry.getMenuNames()
}

/**
 * Find a menu item by ID within a menu
 * @param menu - Menu to search in
 * @param id - Menu item ID to search for
 * @returns Menu item or undefined if not found
 */
export function findMenuItemById(menu: MenuItemConfig, id: string): MenuItemConfig | undefined {
  function search(item: MenuItemConfig): MenuItemConfig | undefined {
    if (item.id === id) {
      return item
    }

    if (item.children) {
      for (const child of item.children) {
        const found = search(child)
        if (found) {
          return found
        }
      }
    }

    return undefined
  }

  return search(menu)
}

import { MenuBuilder, type MenuItemConfig } from '../types/menu'
import { reactive, ref } from 'vue'

/**
 * Trigger to force menu updates
 * Increment this to invalidate all menu caches
 */
export const menuUpdateTrigger = ref(0)

/**
 * Menu Registry
 * Manages registration and retrieval of menu builders
 */
class MenuRegistry {
  private builders: MenuBuilder[] = []
  private menuCache: Map<string, MenuItemConfig> = reactive(new Map())

  /**
   * Register a menu builder
   * @param builder - Menu builder instance
   */
  register(builder: MenuBuilder): void {
    this.builders.push(builder)

    // Invalidate all caches as a new builder might affect any menu
    this.menuCache.clear()

    // Trigger menu update
    menuUpdateTrigger.value++
  }

  /**
   * Unregister a builder
   * @param builder - Menu builder instance to unregister
   */
  unregister(builder: MenuBuilder): boolean {
    const index = this.builders.indexOf(builder)
    if (index !== -1) {
      this.builders.splice(index, 1)
      this.menuCache.clear()
      menuUpdateTrigger.value++
      return true
    }
    return false
  }

  /**
   * Get a built menu by name
   * All registered builders will be called to build the menu
   * @param menuName - Name of the menu
   * @returns Built menu configuration
   */
  getMenu(menuName: string): MenuItemConfig {
    // Check cache first
    if (this.menuCache.has(menuName)) {
      return this.menuCache.get(menuName)!
    }

    // Start with empty menu structure
    let menu: MenuItemConfig = {
      id: menuName,
      title: menuName,
      children: []
    }

    // Let each builder build the menu
    this.builders.forEach((builder) => {
      menu = builder.build(menu, menuName)
    })

    // Sort menu items recursively
    this.sortMenuItems(menu)

    // Cache the built menu
    this.menuCache.set(menuName, menu)

    return menu
  }

  /**
   * Sort menu items recursively based on their order property
   * @param menu - Menu item to sort children of
   */
  private sortMenuItems(menu: MenuItemConfig): void {
    if (menu.children && menu.children.length > 0) {
      menu.children.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      })

      // Recursively sort children of children
      menu.children.forEach((child) => this.sortMenuItems(child))
    }
  }

  /**
   * Get all registered builder names/types (for debugging)
   * @returns Array of builder descriptions
   */
  getBuilderCount(): number {
    return this.builders.length
  }

  /**
   * Get all menu names
   * Note: Since builders are no longer tied to specific menus during registration,
   * this might not be exhaustive if menus are requested dynamically.
   * @returns Array of registered menu names from cache
   */
  getMenuNames(): string[] {
    return Array.from(this.menuCache.keys())
  }

  /**
   * Clear all registered builders
   */
  clear(): void {
    this.builders = []
    this.menuCache.clear()
  }

  /**
   * Get the number of registered builders
   */
  get size(): number {
    return this.builders.length
  }
}

// Export a singleton instance
export const menuRegistry = new MenuRegistry()

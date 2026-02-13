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
  private builders: Map<string, MenuBuilder[]> = new Map()
  private menuCache: Map<string, MenuItemConfig> = reactive(new Map())

  /**
   * Register a menu builder
   * @param menuName - Name of the menu
   * @param builder - Menu builder instance
   */
  register(menuName: string, builder: MenuBuilder): void {
    if (!this.builders.has(menuName)) {
      this.builders.set(menuName, [])
    }
    this.builders.get(menuName)!.push(builder)

    // Invalidate cache for this menu
    this.menuCache.delete(menuName)

    // Trigger menu update
    menuUpdateTrigger.value++
  }

  /**
   * Unregister all builders for a menu
   * @param menuName - Name of the menu to unregister
   */
  unregister(menuName: string): boolean {
    this.menuCache.delete(menuName)
    return this.builders.delete(menuName)
  }

  /**
   * Get a built menu by name
   * All registered builders for this menu will be called to build the menu
   * @param menuName - Name of the menu
   * @returns Built menu configuration or undefined if no builders registered
   */
  getMenu(menuName: string): MenuItemConfig | undefined {
    // Check cache first
    if (this.menuCache.has(menuName)) {
      return this.menuCache.get(menuName)
    }

    const builders = this.builders.get(menuName)

    if (!builders || builders.length === 0) {
      return undefined
    }

    // Start with empty menu structure
    let menu: MenuItemConfig = {
      id: menuName,
      title: menuName,
      children: []
    }

    // Let each builder build the menu
    builders.forEach((builder) => {
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
   * Get all menu names
   * @returns Array of registered menu names
   */
  getMenuNames(): string[] {
    return Array.from(this.builders.keys())
  }

  /**
   * Clear all registered builders
   */
  clear(): void {
    this.builders.clear()
    this.menuCache.clear()
  }

  /**
   * Get the number of registered menus
   */
  get size(): number {
    return this.builders.size
  }
}

// Export a singleton instance
export const menuRegistry = new MenuRegistry()


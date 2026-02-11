import { computed, type ComputedRef } from 'vue'
import { getMenu } from '../config/menuInitializer'
import { menuUpdateTrigger } from '../config/menuRegistry'
import type { MenuItemConfig } from '../types/menu'

/**
 * Composable for accessing a specific menu in components
 * @param menuName - Name of the menu to access
 * @returns Object with menu-related computed properties and methods
 */
export function useMenu(menuName: string) {
  /**
   * The menu configuration
   * Watches menuUpdateTrigger to re-evaluate when menus are registered
   */
  const menu: ComputedRef<MenuItemConfig | undefined> = computed(() => {
    // Access trigger to create dependency
    menuUpdateTrigger.value
    return getMenu(menuName)
  })

  /**
   * Menu items (children of the menu root)
   */
  const menuItems: ComputedRef<MenuItemConfig[]> = computed(() => {
    return menu.value?.children ?? []
  })

  /**
   * Check if a menu item has children
   */
  const hasChildren = (item: MenuItemConfig): boolean => {
    return !!item.children && item.children.length > 0
  }

  /**
   * Filter menu items by permission (if user has permission system)
   * This is a placeholder - implement based on your permission system
   */
  const filterByPermission = (items: MenuItemConfig[], userPermissions?: string[]): MenuItemConfig[] => {
    if (!userPermissions) return items

    return items.filter(item => {
      if (!item.permission) return true
      return userPermissions.includes(item.permission)
    })
  }

  return {
    menu,
    menuItems,
    hasChildren,
    filterByPermission
  }
}

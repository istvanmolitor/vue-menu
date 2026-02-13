import { menuRegistry } from '../config/menuRegistry'
import { getMenu, getMenuNames, findMenuItemById } from '../config/menuInitializer'
import type { MenuItemConfig } from '../types/menu'

/**
 * Menu Debug Utilities
 * Helper functions for debugging and testing the menu registry
 */

/**
 * Print all registered menus to console
 */
export function debugMenuRegistry(): void {
  console.group('🔍 Menu Registry Debug')
  console.log('Total registered builders:', menuRegistry.getBuilderCount())
  console.log('Menus in cache:', menuRegistry.size)

  const menuNames = getMenuNames()
  menuNames.forEach((menuName, index) => {
    const menu = getMenu(menuName)
    if (!menu) return

    console.group(`${index + 1}. ${menuName}`)
    console.log('ID:', menu.id)
    console.log('Title:', menu.title)
    console.log('Children:', menu.children?.length ?? 0)

    if (menu.children && menu.children.length > 0) {
      console.group('Children:')
      menu.children.forEach((child, childIndex) => {
        console.log(`${childIndex + 1}. ${child.title} (order: ${child.order ?? 'N/A'})`)
        if (child.children) {
          child.children.forEach((subChild, subIndex) => {
            console.log(`  ${subIndex + 1}. ${subChild.title} → ${subChild.path}`)
          })
        }
      })
      console.groupEnd()
    }

    console.groupEnd()
  })

  console.groupEnd()
}

/**
 * Validate menu configuration
 * Checks for common issues like duplicate IDs, missing paths, etc.
 */
export function validateMenus(): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const menuNames = getMenuNames()

  menuNames.forEach(menuName => {
    const menu = getMenu(menuName)
    if (!menu) {
      errors.push(`Menu "${menuName}" is registered but returns undefined`)
      return
    }

    const seenIds = new Set<string>()

    function validateItem(item: MenuItemConfig, path: string[] = []): void {
      const currentPath = [...path, item.id].join(' > ')

      // Check for duplicate IDs
      if (seenIds.has(item.id)) {
        errors.push(`Duplicate menu ID: "${item.id}" at ${currentPath}`)
      } else {
        seenIds.add(item.id)
      }

      // Check if item with children has no path (expected)
      if (item.children && item.children.length > 0 && item.path) {
        warnings.push(`Menu item "${item.id}" has both children and a path. This might be intentional.`)
      }

      // Check if leaf item has no path
      if (!item.children && !item.path) {
        warnings.push(`Menu item "${item.id}" has no children and no path at ${currentPath}`)
      }

      // Validate children
      if (item.children) {
        item.children.forEach(child => validateItem(child, [...path, item.id]))
      }
    }

    validateItem(menu)
  })

  const valid = errors.length === 0

  if (valid) {
    console.log('✅ Menu validation passed')
  } else {
    console.error('❌ Menu validation failed')
  }

  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} warning(s) found`)
  }

  return { valid, errors, warnings }
}

/**
 * Get a tree representation of a menu structure
 */
export function getMenuTree(menuName: string): string {
  const menu = getMenu(menuName)
  if (!menu) {
    return `Menu "${menuName}" not found`
  }

  let tree = `Menu: ${menuName}\n`

  function buildTree(item: MenuItemConfig, level = 0): string {
    const indent = '  '.repeat(level)
    const icon = item.icon ? '📁' : '📄'
    let line = `${indent}${icon} ${item.title}`

    if (item.path) {
      line += ` → ${item.path}`
    }

    line += ` (order: ${item.order ?? 'N/A'})\n`

    if (item.children) {
      item.children.forEach(child => {
        line += buildTree(child, level + 1)
      })
    }

    return line
  }

  tree += buildTree(menu)
  return tree
}

/**
 * Search menus by title
 */
export function searchMenusByTitle(searchTerm: string): Array<{ menuName: string, item: MenuItemConfig }> {
  const results: Array<{ menuName: string, item: MenuItemConfig }> = []
  const lowerSearch = searchTerm.toLowerCase()

  const menuNames = getMenuNames()

  menuNames.forEach(menuName => {
    const menu = getMenu(menuName)
    if (!menu) return

    function search(item: MenuItemConfig): void {
      if (item.title.toLowerCase().includes(lowerSearch)) {
        results.push({ menuName, item })
      }

      if (item.children) {
        item.children.forEach(child => search(child))
      }
    }

    search(menu)
  })

  return results
}

/**
 * Export menu structure as JSON
 */
export function exportMenusAsJSON(): string {
  const menus: Record<string, MenuItemConfig | undefined> = {}

  const menuNames = getMenuNames()
  menuNames.forEach(menuName => {
    menus[menuName] = getMenu(menuName)
  })

  return JSON.stringify(menus, null, 2)
}

/**
 * Get statistics about the menu registry
 */
export function getMenuStats(): {
  totalMenus: number
  totalItems: number
  maxDepth: number
  itemsWithIcons: number
  itemsWithPermissions: number
} {
  let totalItems = 0
  let itemsWithIcons = 0
  let itemsWithPermissions = 0
  let maxDepth = 0

  function analyze(item: MenuItemConfig, depth = 1): void {
    totalItems++
    maxDepth = Math.max(maxDepth, depth)

    if (item.icon) itemsWithIcons++
    if (item.permission) itemsWithPermissions++

    if (item.children) {
      item.children.forEach(child => analyze(child, depth + 1))
    }
  }

  const menuNames = getMenuNames()
  menuNames.forEach(menuName => {
    const menu = getMenu(menuName)
    if (menu) {
      analyze(menu)
    }
  })

  return {
    totalMenus: menuNames.length,
    totalItems,
    maxDepth,
    itemsWithIcons,
    itemsWithPermissions
  }
}

// Make debug utilities available in browser console in development
if (import.meta.env.DEV) {
  (window as any).__menuDebug = {
    debug: debugMenuRegistry,
    validate: validateMenus,
    tree: (menuName: string) => {
      const tree = getMenuTree(menuName)
      console.log(tree)
      return tree
    },
    search: searchMenusByTitle,
    export: exportMenusAsJSON,
    stats: getMenuStats,
    find: (menuName: string, id: string) => {
      const menu = getMenu(menuName)
      return menu ? findMenuItemById(menu, id) : undefined
    },
    getMenu: getMenu,
    getMenuNames: getMenuNames,
    registry: menuRegistry
  }

  console.log('💡 Menu debug utilities available: window.__menuDebug')
}

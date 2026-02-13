// Menu system
export { menuRegistry, menuUpdateTrigger } from './config/menuRegistry'
export { getMenu, getMenuNames, findMenuItemById } from './config/menuInitializer'

// Composables
export { useMenu } from './composables/useMenu'

// Debug utilities (only use in development)
export { debugMenuRegistry, validateMenus, getMenuTree, searchMenusByTitle, exportMenusAsJSON, getMenuStats } from './lib/menuDebug'

// Types
export type { MenuItemConfig, PackageMenuConfig } from './types/menu'
export { MenuBuilder } from './types/menu'

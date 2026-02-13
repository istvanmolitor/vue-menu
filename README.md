# Menu Package

Menu system for registering and managing application menus with support for multi-level nested structures.

## Features

- **Menu Registry**: Central registry for managing menu builders
- **Menu Builders**: Interface for dynamically constructing menu items
- **Composables**: Vue 3 composables for accessing menus in components
- **Debug Utilities**: Tools for debugging and validating menu structures
- **TypeScript Support**: Full type safety with TypeScript

## Usage

### Registering a Menu

```typescript
import { menuRegistry, type MenuBuilder, type MenuItemConfig } from '@menu/index'
import { Users } from 'lucide-vue-next'

class UserMenuBuilder implements MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    const userSection: MenuItemConfig = {
      id: 'users',
      title: 'Users',
      icon: Users,
      order: 10,
      children: [
        {
          id: 'user-list',
          title: 'User List',
          path: '/users',
          order: 10
        }
      ]
    }

    if (!menu.children) {
      menu.children = []
    }
    menu.children.push(userSection)

    return menu
  }
}

// Register the builder
menuRegistry.register(new UserMenuBuilder())
```

### Using Menu in Components

```vue
<script setup lang="ts">
import { useMenu } from '@menu/index'

const { menu, menuItems, hasChildren } = useMenu('main-menu')
</script>

<template>
  <nav>
    <div v-for="item in menuItems" :key="item.id">
      <RouterLink v-if="!hasChildren(item)" :to="item.path">
        {{ item.title }}
      </RouterLink>
    </div>
  </nav>
</template>
```

### Debug Utilities

```typescript
import { debugMenuRegistry, validateMenus } from '@menu/index'

// Debug all menus
debugMenuRegistry()

// Validate menu structure
const { valid, errors, warnings } = validateMenus()
```

## API

### menuRegistry

- `register(builder: MenuBuilder)`: Register a menu builder
- `unregister(builder: MenuBuilder)`: Unregister a builder
- `getMenu(menuName: string)`: Get a built menu by name
- `getMenuNames()`: Get all menu names that have been built and cached
- `clear()`: Clear all registered builders

### Functions

- `getMenu(menuName: string)`: Get a menu by name
- `getMenuNames()`: Get all registered menu names
- `findMenuItemById(menu: MenuItemConfig, id: string)`: Find a menu item by ID

### useMenu Composable

- `menu`: Computed ref to the menu configuration
- `menuItems`: Computed ref to menu items (children)
- `hasChildren(item: MenuItemConfig)`: Check if item has children
- `filterByPermission(items: MenuItemConfig[], userPermissions?: string[])`: Filter items by permission

## Types

- `MenuItemConfig`: Menu item configuration interface
- `MenuBuilder`: Interface for menu builders
- `PackageMenuConfig`: Package menu configuration

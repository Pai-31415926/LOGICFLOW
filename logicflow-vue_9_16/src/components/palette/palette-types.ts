// src/components/palette/palette-types.ts

export interface PaletteItem {
  type: string
  label: string
  icon?: string
  properties?: Record<string, any>
}

export interface PaletteGroup {
  key: string
  name: string
  items: PaletteItem[]
}

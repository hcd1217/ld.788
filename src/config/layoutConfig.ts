// Layout configuration constants
export const LAYOUT_CONFIG = {
  // AppShell dimensions
  HEADER_HEIGHT: 60,
  NAVBAR_WIDTH_EXPANDED: 300,
  NAVBAR_WIDTH_COLLAPSED: 0,
  // Adjusted for consistency - should match actual navbar width (not 265px)
  MAIN_PADDING_LEFT_EXPANDED: 250,
  MAIN_PADDING_LEFT_COLLAPSED: 0,

  // Navbar internal dimensions
  NAVBAR_ACTUAL_WIDTH: 250, // The actual width set on the navbar

  // Icon and text sizes
  NAV_ICON_SIZE: 20,
  USER_MENU_ICON_SIZE: 14,
  CARET_ICON_SIZE: 16,
  DUMMY_INDICATOR_SIZE: 10,

  // Other UI constants
  USER_MENU_WIDTH: 200,
} as const;

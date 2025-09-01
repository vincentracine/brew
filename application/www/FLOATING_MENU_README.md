# Tiptap Floating Menu

This project now includes a Notion-style floating menu for the Tiptap editor that appears when text is selected.

## Features

The floating menu provides the following formatting options:

- **Bold** - Makes selected text bold
- **Italic** - Makes selected text italic
- **Underline** - Underlines selected text
- **Code** - Converts selected text to inline code
- **Blockquote** - Converts selected text to a blockquote
- **Bullet List** - Converts selected text to a bullet list
- **Numbered List** - Converts selected text to a numbered list
- **Link** - Adds a link to selected text

## How It Works

1. **Text Selection**: Select any text in the editor
2. **Menu Appearance**: A floating toolbar appears above the selected text
3. **Formatting**: Click any formatting button to apply the style
4. **Active States**: Buttons show active states (blue background) when the format is applied

## Technical Implementation

### Dependencies Added

- `@tiptap/extension-floating-menu` - Core floating menu functionality
- `@tiptap/extension-underline` - Underline text formatting
- `@tiptap/extension-link` - Link functionality
- `@floating-ui/dom` - Positioning and interaction handling

### Components

- **FloatingMenu.tsx** - The floating toolbar component with formatting buttons
- **Tiptap.tsx** - Updated editor with floating menu integration

### Key Features

- **Smart Positioning**: Menu automatically positions itself relative to text selection
- **Conditional Display**: Only shows when text is selected and not in code blocks
- **Responsive Design**: Clean, modern UI with hover effects and active states
- **Accessibility**: Tooltips and proper button labeling

## Usage

1. Start the development server: `npm run dev`
2. Navigate to the editor page
3. Select any text in the editor
4. Use the floating menu to format your selection

## Customization

The floating menu can be easily customized by:

- Adding new formatting options to the `formatButtons` array
- Modifying the styling classes in the component
- Adjusting the positioning logic in the `shouldShow` callback
- Adding new Tiptap extensions for additional functionality

## Browser Compatibility

The floating menu uses modern web APIs and should work in all modern browsers that support:

- CSS Grid and Flexbox
- ES6+ JavaScript features
- CSS transitions and transforms

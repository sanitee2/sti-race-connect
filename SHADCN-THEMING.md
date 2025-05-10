# Shadcn UI Theming Guide

This document provides guidelines on how to use shadcn/ui components with consistent theming throughout the application.

## Overview

All shadcn components have been configured to use CSS variables from `src/app/globals.css` through the tailwind configuration. This ensures a consistent look and feel across the entire application.

## Installing New Components

To add a new shadcn component with the proper theming, use the following npm script instead of the default shadcn CLI:

```bash
npm run ui:add [component-name]
```

For example:

```bash
npm run ui:add tooltip
npm run ui:add dialog
npm run ui:add dropdown-menu
```

This script ensures that all components use the proper CSS variables from your application's theme.

## Theme Colors

When using shadcn components, prefer using the following Tailwind classes to maintain consistent styling:

| Category   | Classes                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background | `bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-destructive`                                                                                              |
| Text       | `text-foreground`, `text-card-foreground`, `text-popover-foreground`, `text-primary-foreground`, `text-secondary-foreground`, `text-muted-foreground`, `text-accent-foreground`, `text-destructive-foreground` |
| Border     | `border-border`, `border-input`                                                                                                                                                                                |
| Ring       | `ring-ring`                                                                                                                                                                                                    |

## Example Usage

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Example() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Card content</p>
        <Button className="bg-primary text-primary-foreground">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Dark Mode Support

The theme supports dark mode through CSS variables. The application will automatically switch between light and dark themes based on the `dark` class on the `html` element.

## Customizing the Theme

To customize the theme:

1. Update the CSS variables in `src/app/globals.css`
2. Maintain the same variable names to ensure compatibility with shadcn components
3. If you need additional colors, extend the theme in `tailwind.config.js`

## Best Practices

1. **Use theme variables**: Always use theme-based classes like `bg-primary` instead of hardcoded colors like `bg-blue-500`
2. **Be consistent**: Use the same styling patterns across all components
3. **Check dark mode**: Always test your UI in both light and dark modes
4. **Avoid inline styles**: Use Tailwind classes or CSS variables for styling

By following these guidelines, you will maintain a consistent look and feel across your entire application.

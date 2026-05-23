# Assets Folder

This folder contains images and SVG icons used throughout your blog.

## Structure

- **images/**: Profile pictures, article images, and other photo content
  - All image formats supported (jpg, png, webp, etc.)
  - Profile pictures are automatically displayed as circular images beside author names

- **icons/**: SVG icons that can be used as reusable components
  - Store icons as SVG files here

## Usage in Articles

### Profile Picture

Add a `profileImage` field to your markdown frontmatter to display a circular profile picture beside your author name:

```yaml
---
title: My Article
author: Your Name
profileImage: /assets/images/my-profile.jpg
---
```

### Images in Article Content

Reference images in your markdown content:

```markdown
# My Article

![Alt text](/assets/images/my-image.jpg)
```

## Build Process

All files in this folder are automatically copied to the `dist/assets/` folder during the build process. The dev server watches for changes and will automatically rebuild when you add or modify files here.

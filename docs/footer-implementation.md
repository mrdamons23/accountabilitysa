# Standardized Footer Implementation Guide

This document provides instructions for implementing the standardized Accountability SA footer across all pages.

## Overview

The standardized footer has been designed to maintain consistency across the website while providing:

- Organizational information
- Navigation links
- Contact information
- Newsletter signup
- Copyright and legal links

The footer is implemented as a separate HTML file that is loaded dynamically with jQuery, making it easy to update across the entire site.

## Implementation Steps

Follow these steps to implement the standardized footer on any page:

### 1. Include Required CSS & JavaScript

In the `<head>` section, include:

```html
<link rel="stylesheet" href="css/footer.css">
```

Before the closing `</body>` tag, include:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="js/footer.js"></script>
```

### 2. Add Footer Placeholder

Replace your existing footer HTML with a placeholder div:

```html
<div id="footer-placeholder"></div>
```

### 3. Add JavaScript to Load Footer

Before the closing `</body>` tag, add:

```html
<script>
    $(function() {
        $("#footer-placeholder").load("footer.html");
    });
</script>
```

If you're also using the standardized header, combine them:

```html
<script>
    $(function() {
        $("#header-placeholder").load("header.html", function() {
            if (typeof initializeHeader === 'function') {
                initializeHeader();
            }
        });
        $("#footer-placeholder").load("footer.html");
    });
</script>
```

## Complete Example

Here's a complete example of the implementation:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title | Accountability SA</title>
    <!-- Include required CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/footer.css">
    <!-- Other page-specific CSS -->
</head>
<body>
    <!-- Header placeholder -->
    <div id="header-placeholder"></div>
    
    <!-- Page content goes here -->
    <main>
        <!-- Content -->
    </main>
    
    <!-- Footer placeholder -->
    <div id="footer-placeholder"></div>
    
    <!-- JavaScript includes -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="js/main.js"></script>
    <script src="js/header.js"></script>
    <script src="js/footer.js"></script>
    <!-- Page-specific JavaScript -->
    
    <!-- Load header and footer -->
    <script>
        $(function() {
            $("#header-placeholder").load("header.html", function() {
                if (typeof initializeHeader === 'function') {
                    initializeHeader();
                }
            });
            $("#footer-placeholder").load("footer.html");
        });
    </script>
</body>
</html>
```

## Customizing the Footer

The standardized footer is designed to be maintained in a single location (`footer.html`). If you need to make changes to the footer:

1. Edit the `footer.html` file to update content, links, etc.
2. If styling changes are needed, edit `css/footer.css`
3. For functional changes, update `js/footer.js`

All pages using the standardized footer will automatically receive the updates.

## Troubleshooting

If the footer is not appearing:

1. Ensure jQuery is properly loaded before your script that loads the footer
2. Check browser console for any errors
3. Verify that the path to `footer.html` is correct (it should be in the root directory)
4. Make sure `footer.css` and `footer.js` are correctly linked

## Support

For questions or assistance with the standardized footer, contact the web development team. 
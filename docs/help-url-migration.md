# Help URL Migration Guide

This guide explains how to migrate hardcoded help.mingdao.com URLs to use the centralized helpUrls.js configuration.

## Background

The application contains many hardcoded URLs to help documentation, which presents several issues:
- If the help documentation domain changes, we need to update URLs in many files
- We can't easily track which help documentation pages are referenced in the codebase
- There's inconsistent handling of URL replacements for custom help sites

## Solution

We've created a centralized configuration in `src/common/helpUrls.js` that:
1. Defines all help URLs in a single place
2. Provides helper functions to generate the correct URLs
3. Handles domain replacement if a custom help site is configured

## Migration Steps

### 1. First, analyze the codebase

Run the migration script to identify files that need updating:

```bash
node CI/scripts/migrateHelpUrls.js
```

This will generate a `helpUrlMigrationGuide.md` file with specific instructions for each file.

### 2. Import the helper functions

Add this import to the top of files that need to be updated:

```javascript
import { getHelpUrl } from 'src/common/helpUrls';
```

### 3. Replace hardcoded URLs

Replace hardcoded URLs with calls to `getHelpUrl`:

```javascript
// Before
<a href="https://help.mingdao.com/worksheet/title-field">Help</a>

// After
<a href={getHelpUrl('worksheet', 'titleField')}>Help</a>
```

### 4. Using with the Support component

If you're using the Support component, you can either:

1. Continue using the hardcoded URL (the component handles domain replacement internally):
```javascript
<Support href="https://help.mingdao.com/worksheet/title-field" text="Help" type={3} />
```

2. Or use the helper function for better maintainability:
```javascript
<Support href={getHelpUrl('worksheet', 'titleField')} text="Help" type={3} />
```

## Adding New Help URLs

If you need to link to a help page that isn't in the configuration yet:

1. Add it to the appropriate section in `src/common/helpUrls.js`:
```javascript
worksheet: {
  // Existing entries...
  newHelpTopic: '/worksheet/new-help-topic',
},
```

2. Then use it in your code:
```javascript
getHelpUrl('worksheet', 'newHelpTopic')
```

## Testing

When testing, make sure that:
1. The links work correctly with the default help domain
2. The links work correctly if `md.global.Config.HelpUrl` is set to a different domain

## Examples

See `/src/examples/FixedHelpUrlExample.jsx` for complete examples of proper usage.
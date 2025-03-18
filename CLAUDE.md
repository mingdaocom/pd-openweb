# CLAUDE.md - niio-openweb Coding Assistant Guide

## Build Commands
- Start development: `yarn start` or `npm start`
- Build for release: `yarn release` or `npm run release`
- Publish: `yarn publish` or `npm run publish`
- Translation: `yarn trans` or `npm run trans`
- Build PO to JS: `yarn buildPoToJs` or `npm run buildPoToJs`

## Code Style Guidelines
- **Formatting**: Use Prettier with 120 char width, trailing commas, single quotes
- **ESLint**: ESLint is configured, max line length is 160 characters
- **Quotes**: Use single quotes for strings, avoid escaping when possible
- **Component Structure**: Follow React component ordering - type annotations, static methods, lifecycle methods, other methods, render
- **Tech Stack**: React 18, Redux, Webpack 5, Gulp, Less for styling, Ant Design
- **Path Aliases**: Use configured path aliases for `worksheet/*` and `ming-ui/*`
- **Naming Convention**: Use camelCase for variables/functions, PascalCase for components
- **Error Handling**: Custom error handling with detailed logging

## Project Structure
- `/src` - Source code
- `/CI` - Build configuration
- `/locale` - Internationalization
- `/staticfiles` - Static assets
- `/docker` - Docker configuration
- `/html-templates` - HTML templates

Follow the [front-end coding specification](https://github.com/mdfe/style-guide) for more detailed guidelines.
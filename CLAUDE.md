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
  - `/api` - API client code organized by feature/module
  - `/common` - Global styles, methods, and preprocessing logic
  - `/components` - Reusable UI components across the application
  - `/ming-ui` - Custom UI component library with basic UI elements
  - `/pages` - Main application modules (admin, worksheets, chat, etc.)
  - `/redux` - Redux store configuration
  - `/router` - Application routing
  - `/socket` - Real-time communication setup
  - `/util` - Global utility functions
- `/CI` - Build configuration and continuous integration tools
- `/locale` - Internationalization files (en, ja, zh_Hans, zh_Hant)
- `/staticfiles` - Static assets (images, fonts, templates)
- `/docker` - Docker configuration for containerization
- `/html-templates` - HTML entry points for different application sections

## Application Features
- **Worksheet Management**: Form creation, management and sharing
- **Task Management**: Todo lists and task tracking
- **Document Management**: File storage and sharing system
- **Team Communication**: Chat functionality
- **Calendars**: Scheduling and calendar management
- **Admin Panel**: User and organization management
- **Public Forms**: Shareable forms with public access
- **Mobile Support**: Responsive interfaces for mobile access
- **Statistics & Reporting**: Data visualization and reporting tools

## Development Notes
- The application supports multiple languages with translation files in the locale directory
- Multiple authentication methods are supported (SSO, third-party integrations)
- Custom widgets can be extended for worksheet functionality
- Socket integration enables real-time updates throughout the app

Follow the [front-end coding specification](https://github.com/mdfe/style-guide) for more detailed guidelines.
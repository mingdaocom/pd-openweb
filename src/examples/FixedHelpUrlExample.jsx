/**
 * Example of how to properly use the centralized helpUrls.js configuration
 * This shows how to migrate hardcoded URLs to use the helper functions.
 */

import React from 'react';
import { getHelpUrl } from '../common/helpUrls';

// BEFORE MIGRATION:
// The component uses a hardcoded URL directly
export function BeforeExample() {
  return (
    <a href="https://help.mingdao.com/worksheet/title-field" target="_blank" rel="noopener noreferrer">
      Learn more about title fields
    </a>
  );
}

// AFTER MIGRATION:
// The component uses the getHelpUrl helper function
export function AfterExample() {
  return (
    <a href={getHelpUrl('worksheet', 'titleField')} target="_blank" rel="noopener noreferrer">
      Learn more about title fields
    </a>
  );
}

// EXAMPLE WITH SUPPORT COMPONENT:
// If you're using the Support component, it already has URL replacement logic built in
import { Support } from '../ming-ui/components/Support';

export function SupportComponentExample() {
  return (
    <Support 
      type={3} 
      href="https://help.mingdao.com/worksheet/title-field" 
      text="Learn more about title fields" 
    />
  );
}

// However, the Support component can also be updated to use the getHelpUrl function:
export function ImprovedSupportComponentExample() {
  return (
    <Support 
      type={3} 
      href={getHelpUrl('worksheet', 'titleField')} 
      text="Learn more about title fields" 
    />
  );
}

// This allows the Support component to benefit from the centralized URL system
// while still maintaining its compatibility with md.global.Config.HelpUrl for backwards compatibility.
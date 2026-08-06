import jQuery from './jquery.min';

if (typeof window !== 'undefined') {
  window.jQuery = jQuery;
  window.$ = jQuery;
}

export default jQuery;

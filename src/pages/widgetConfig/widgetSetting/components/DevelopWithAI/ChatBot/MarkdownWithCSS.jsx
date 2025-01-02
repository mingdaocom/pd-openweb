import React from 'react';
import styled, { keyframes } from 'styled-components';

const borderBeamAnimation = keyframes`
  100% {
    offset-distance: 100%;
  }
`;

export const MarkdownWithCSS = styled.div`
  /* light */
   {
    color-scheme: light;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    margin: 0;
    color: #1f2328;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji';
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    scroll-behavior: auto !important;
  }

  .octicon {
    display: inline-block;
    fill: currentColor;
    vertical-align: text-bottom;
  }

  h1:hover .anchor .octicon-link:before,
  h2:hover .anchor .octicon-link:before,
  h3:hover .anchor .octicon-link:before,
  h4:hover .anchor .octicon-link:before,
  h5:hover .anchor .octicon-link:before,
  h6:hover .anchor .octicon-link:before {
    width: 16px;
    height: 16px;
    content: ' ';
    display: inline-block;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
    mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
  }

  details,
  figcaption,
  figure {
    display: block;
  }

  summary {
    display: list-item;
  }

  [hidden] {
    display: none !important;
  }

  a {
    background-color: transparent;
    color: #0969da;
    text-decoration: none;
  }

  abbr[title] {
    border-bottom: none;
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }

  b,
  strong {
    font-weight: 600;
  }

  dfn {
    font-style: italic;
  }

  h1 {
    margin: 0.67em 0;
    font-weight: 600;
    padding-bottom: 0.3em;
    font-size: 2em;
    border-bottom: 1px solid #d1d9e0b3;
  }

  mark {
    background-color: #fff8c5;
    color: #1f2328;
  }

  small {
    font-size: 90%;
  }

  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sub {
    bottom: -0.25em;
  }

  sup {
    top: -0.5em;
  }

  img {
    border-style: none;
    max-width: 100%;
    box-sizing: content-box;
  }

  code,
  kbd,
  pre,
  samp {
    font-family: monospace;
    font-size: 1em;
  }

  figure {
    margin: 1em 2.5rem;
  }

  hr {
    box-sizing: content-box;
    overflow: hidden;
    background: transparent;
    border-bottom: 1px solid #d1d9e0b3;
    height: 0.25em;
    padding: 0;
    margin: 1.5rem 0;
    background-color: #d1d9e0;
    border: 0;
  }

  input {
    font: inherit;
    margin: 0;
    overflow: visible;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button;
    appearance: button;
  }

  [type='checkbox'],
  [type='radio'] {
    box-sizing: border-box;
    padding: 0;
  }

  [type='number']::-webkit-inner-spin-button,
  [type='number']::-webkit-outer-spin-button {
    height: auto;
  }

  [type='search']::-webkit-search-cancel-button,
  [type='search']::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  ::-webkit-input-placeholder {
    color: inherit;
    opacity: 0.54;
  }

  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    appearance: button;
    font: inherit;
  }

  a:hover {
    text-decoration: underline;
  }

  ::placeholder {
    color: #59636e;
    opacity: 1;
  }

  hr::before {
    display: table;
    content: '';
  }

  hr::after {
    display: table;
    clear: both;
    content: '';
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    display: block;
    width: max-content;
    max-width: 100%;
    overflow: auto;
  }

  td,
  th {
    padding: 0;
  }

  details summary {
    cursor: pointer;
  }

  a:focus,
  [role='button']:focus,
  input[type='radio']:focus,
  input[type='checkbox']:focus {
    outline: 2px solid #0969da;
    outline-offset: -2px;
    box-shadow: none;
  }

  a:focus:not(:focus-visible),
  [role='button']:focus:not(:focus-visible),
  input[type='radio']:focus:not(:focus-visible),
  input[type='checkbox']:focus:not(:focus-visible) {
    outline: solid 1px transparent;
  }

  a:focus-visible,
  [role='button']:focus-visible,
  input[type='radio']:focus-visible,
  input[type='checkbox']:focus-visible {
    outline: 2px solid #0969da;
    outline-offset: -2px;
    box-shadow: none;
  }

  a:not([class]):focus,
  a:not([class]):focus-visible,
  input[type='radio']:focus,
  input[type='radio']:focus-visible,
  input[type='checkbox']:focus,
  input[type='checkbox']:focus-visible {
    outline-offset: 0;
  }

  kbd {
    display: inline-block;
    padding: 0.25rem;
    font: 11px ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    line-height: 10px;
    color: #1f2328;
    vertical-align: middle;
    background-color: #f6f8fa;
    border: solid 1px #d1d9e0b3;
    border-bottom-color: #d1d9e0b3;
    border-radius: 6px;
    box-shadow: inset 0 -1px 0 #d1d9e0b3;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.2rem;
    margin-bottom: 0.8rem;
    font-weight: 600;
    line-height: 1.25;
  }

  h2 {
    font-weight: 600;
    padding-bottom: 0.3em;
    font-size: 1.3em;
    border-bottom: 1px solid #d1d9e0b3;
  }

  h3 {
    font-weight: 600;
    font-size: 1.2em;
  }

  h4 {
    font-weight: 600;
    font-size: 1.1em;
  }

  h5 {
    font-weight: 600;
    font-size: 1em;
  }

  h6 {
    font-weight: 600;
    font-size: 0.6em;
    color: #59636e;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  blockquote {
    margin: 0;
    padding: 0 1em;
    color: #59636e;
    border-left: 0.25em solid #d1d9e0;
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 1em;
  }

  ol ol,
  ul ol {
    list-style-type: lower-roman;
  }

  ul ul ol,
  ul ol ol,
  ol ul ol,
  ol ol ol {
    list-style-type: lower-alpha;
  }

  dd {
    margin-left: 0;
  }

  tt,
  code,
  samp {
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    font-size: 12px;
  }

  pre {
    margin-top: 0;
    margin-bottom: 0;
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    font-size: 12px;
    word-wrap: normal;
    overflow: hidden;
  }

  .octicon {
    display: inline-block;
    overflow: visible !important;
    vertical-align: text-bottom;
    fill: currentColor;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
  }

  .mr-2 {
    margin-right: 0.5rem !important;
  }

  .markdown-body::before {
    display: table;
    content: '';
  }

  .markdown-body::after {
    display: table;
    clear: both;
    content: '';
  }

  > *:first-child {
    margin-top: 0 !important;
  }

  > *:last-child {
    margin-bottom: 0 !important;
  }

  a:not([href]) {
    color: inherit;
    text-decoration: none;
  }

  .absent {
    color: #d1242f;
  }

  .anchor {
    float: left;
    padding-right: 0.25rem;
    margin-left: -20px;
    line-height: 1;
  }

  .anchor:focus {
    outline: none;
  }

  p,
  blockquote,
  ul,
  ol,
  dl,
  table,
  pre,
  details {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  blockquote > :first-child {
    margin-top: 0;
  }

  blockquote > :last-child {
    margin-bottom: 0;
  }

  h1 .octicon-link,
  h2 .octicon-link,
  h3 .octicon-link,
  h4 .octicon-link,
  h5 .octicon-link,
  h6 .octicon-link {
    color: #1f2328;
    vertical-align: middle;
    visibility: hidden;
  }

  h1:hover .anchor,
  h2:hover .anchor,
  h3:hover .anchor,
  h4:hover .anchor,
  h5:hover .anchor,
  h6:hover .anchor {
    text-decoration: none;
  }

  h1:hover .anchor .octicon-link,
  h2:hover .anchor .octicon-link,
  h3:hover .anchor .octicon-link,
  h4:hover .anchor .octicon-link,
  h5:hover .anchor .octicon-link,
  h6:hover .anchor .octicon-link {
    visibility: visible;
  }

  h1 tt,
  h1 code,
  h2 tt,
  h2 code,
  h3 tt,
  h3 code,
  h4 tt,
  h4 code,
  h5 tt,
  h5 code,
  h6 tt,
  h6 code {
    padding: 0 0.2em;
    font-size: inherit;
  }

  summary h1,
  summary h2,
  summary h3,
  summary h4,
  summary h5,
  summary h6 {
    display: inline-block;
  }

  summary h1 .anchor,
  summary h2 .anchor,
  summary h3 .anchor,
  summary h4 .anchor,
  summary h5 .anchor,
  summary h6 .anchor {
    margin-left: -40px;
  }

  summary h1,
  summary h2 {
    padding-bottom: 0;
    border-bottom: 0;
  }

  ul.no-list,
  ol.no-list {
    padding: 0;
    list-style-type: none;
  }

  ol[type='a s'] {
    list-style-type: lower-alpha;
  }

  ol[type='A s'] {
    list-style-type: upper-alpha;
  }

  ol[type='i s'] {
    list-style-type: lower-roman;
  }

  ol[type='I s'] {
    list-style-type: upper-roman;
  }

  ol[type='1'] {
    list-style-type: decimal;
  }

  div > ol:not([type]) {
    list-style-type: decimal;
  }

  ul ul,
  ul ol,
  ol ol,
  ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

  li > p {
    margin-top: 1rem;
  }

  li + li {
    margin-top: 0.25em;
  }

  dl {
    padding: 0;
  }

  dl dt {
    padding: 0;
    margin-top: 1rem;
    font-size: 1em;
    font-style: italic;
    font-weight: 600;
  }

  dl dd {
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  table th {
    font-weight: 600;
  }

  table th,
  table td {
    padding: 6px 13px;
    border: 1px solid #d1d9e0;
  }

  table td > :last-child {
    margin-bottom: 0;
  }

  table tr {
    background-color: #ffffff;
    border-top: 1px solid #d1d9e0b3;
  }

  table tr:nth-child(2n) {
    background-color: #f6f8fa;
  }

  table img {
    background-color: transparent;
  }

  img[align='right'] {
    padding-left: 20px;
  }

  img[align='left'] {
    padding-right: 20px;
  }

  .emoji {
    max-width: none;
    vertical-align: text-top;
    background-color: transparent;
  }

  span.frame {
    display: block;
    overflow: hidden;
  }

  span.frame > span {
    display: block;
    float: left;
    width: auto;
    padding: 7px;
    margin: 13px 0 0;
    overflow: hidden;
    border: 1px solid #d1d9e0;
  }

  span.frame span img {
    display: block;
    float: left;
  }

  span.frame span span {
    display: block;
    padding: 5px 0 0;
    clear: both;
    color: #1f2328;
  }

  span.align-center {
    display: block;
    overflow: hidden;
    clear: both;
  }

  span.align-center > span {
    display: block;
    margin: 13px auto 0;
    overflow: hidden;
    text-align: center;
  }

  span.align-center span img {
    margin: 0 auto;
    text-align: center;
  }

  span.align-right {
    display: block;
    overflow: hidden;
    clear: both;
  }

  span.align-right > span {
    display: block;
    margin: 13px 0 0;
    overflow: hidden;
    text-align: right;
  }

  span.align-right span img {
    margin: 0;
    text-align: right;
  }

  span.float-left {
    display: block;
    float: left;
    margin-right: 13px;
    overflow: hidden;
  }

  span.float-left span {
    margin: 13px 0 0;
  }

  span.float-right {
    display: block;
    float: right;
    margin-left: 13px;
    overflow: hidden;
  }

  span.float-right > span {
    display: block;
    margin: 13px auto 0;
    overflow: hidden;
    text-align: right;
  }

  code,
  tt {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    white-space: break-spaces;
    background-color: #818b981f;
    border-radius: 6px;
  }

  code br,
  tt br {
    display: none;
  }

  del code {
    text-decoration: inherit;
  }

  samp {
    font-size: 85%;
  }

  pre code {
    font-size: 100%;
  }

  pre > code {
    padding: 0;
    margin: 0;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
  }

  .highlight {
    margin-bottom: 1rem;
  }

  .highlight pre {
    margin-bottom: 0;
    word-break: normal;
  }

  .highlight pre,
  pre {
    padding: 0.7rem;
    overflow: scroll;
    font-size: 85%;
    line-height: 1.45;
    color: #1f2328;
    background-color: #f6f8fa;
    border-radius: 6px;
  }

  pre code,
  pre tt {
    display: inline;
    max-width: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }

  .csv-data td,
  .csv-data th {
    padding: 5px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1;
    text-align: left;
    white-space: nowrap;
  }

  .csv-data .blob-num {
    padding: 10px 0.5rem 9px;
    text-align: right;
    background: #ffffff;
    border: 0;
  }

  .csv-data tr {
    border-top: 0;
  }

  .csv-data th {
    font-weight: 600;
    background: #f6f8fa;
    border-top: 0;
  }

  [data-footnote-ref]::before {
    content: '[';
  }

  [data-footnote-ref]::after {
    content: ']';
  }

  .footnotes {
    font-size: 12px;
    color: #59636e;
    border-top: 1px solid #d1d9e0;
  }

  .footnotes ol {
    padding-left: 1rem;
  }

  .footnotes ol ul {
    display: inline-block;
    padding-left: 1rem;
    margin-top: 1rem;
  }

  .footnotes li {
    position: relative;
  }

  .footnotes li:target::before {
    position: absolute;
    top: calc(0.5rem * -1);
    right: calc(0.5rem * -1);
    bottom: calc(0.5rem * -1);
    left: calc(1.5rem * -1);
    pointer-events: none;
    content: '';
    border: 2px solid #0969da;
    border-radius: 6px;
  }

  .footnotes li:target {
    color: #1f2328;
  }

  .footnotes .data-footnote-backref g-emoji {
    font-family: monospace;
  }

  .pl-c {
    color: #59636e;
  }

  .pl-c1,
  .pl-s .pl-v {
    color: #0550ae;
  }

  .pl-e,
  .pl-en {
    color: #6639ba;
  }

  .pl-smi,
  .pl-s .pl-s1 {
    color: #1f2328;
  }

  .pl-ent {
    color: #0550ae;
  }

  .pl-k {
    color: #cf222e;
  }

  .pl-s,
  .pl-pds,
  .pl-s .pl-pse .pl-s1,
  .pl-sr,
  .pl-sr .pl-cce,
  .pl-sr .pl-sre,
  .pl-sr .pl-sra {
    color: #0a3069;
  }

  .pl-v,
  .pl-smw {
    color: #953800;
  }

  .pl-bu {
    color: #82071e;
  }

  .pl-ii {
    color: #f6f8fa;
    background-color: #82071e;
  }

  .pl-c2 {
    color: #f6f8fa;
    background-color: #cf222e;
  }

  .pl-sr .pl-cce {
    font-weight: bold;
    color: #116329;
  }

  .pl-ml {
    color: #3b2300;
  }

  .pl-mh,
  .pl-mh .pl-en,
  .pl-ms {
    font-weight: bold;
    color: #0550ae;
  }

  .pl-mi {
    font-style: italic;
    color: #1f2328;
  }

  .pl-mb {
    font-weight: bold;
    color: #1f2328;
  }

  .pl-md {
    color: #82071e;
    background-color: #ffebe9;
  }

  .pl-mi1 {
    color: #116329;
    background-color: #dafbe1;
  }

  .pl-mc {
    color: #953800;
    background-color: #ffd8b5;
  }

  .pl-mi2 {
    color: #d1d9e0;
    background-color: #0550ae;
  }

  .pl-mdr {
    font-weight: bold;
    color: #8250df;
  }

  .pl-ba {
    color: #59636e;
  }

  .pl-sg {
    color: #818b98;
  }

  .pl-corl {
    text-decoration: underline;
    color: #0a3069;
  }

  [role='button']:focus:not(:focus-visible),
  [role='tabpanel'][tabindex='0']:focus:not(:focus-visible),
  button:focus:not(:focus-visible),
  summary:focus:not(:focus-visible),
  a:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  [tabindex='0']:focus:not(:focus-visible),
  details-dialog:focus:not(:focus-visible) {
    outline: none;
  }

  g-emoji {
    display: inline-block;
    min-width: 1ch;
    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 1em;
    font-style: normal !important;
    font-weight: 400;
    line-height: 1;
    vertical-align: -0.075em;
  }

  g-emoji img {
    width: 1em;
    height: 1em;
  }

  .task-list-item {
    list-style-type: none;
  }

  .task-list-item label {
    font-weight: 400;
  }

  .task-list-item.enabled label {
    cursor: pointer;
  }

  .task-list-item + .task-list-item {
    margin-top: 0.25rem;
  }

  .task-list-item .handle {
    display: none;
  }

  .task-list-item-checkbox {
    margin: 0 0.2em 0.25em -1.4em;
    vertical-align: middle;
  }

  ul:dir(rtl) .task-list-item-checkbox {
    margin: 0 -1.6em 0.25em 0.2em;
  }

  ol:dir(rtl) .task-list-item-checkbox {
    margin: 0 -1.6em 0.25em 0.2em;
  }

  .contains-task-list:hover .task-list-item-convert-container,
  .contains-task-list:focus-within .task-list-item-convert-container {
    display: block;
    width: auto;
    height: 24px;
    overflow: visible;
    clip: auto;
  }

  ::-webkit-calendar-picker-indicator {
    filter: invert(50%);
  }

  .markdown-alert {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    color: inherit;
    border-left: 0.25em solid #d1d9e0;
  }

  .markdown-alert > :first-child {
    margin-top: 0;
  }

  .markdown-alert > :last-child {
    margin-bottom: 0;
  }

  .markdown-alert .markdown-alert-title {
    display: flex;
    font-weight: 500;
    align-items: center;
    line-height: 1;
  }

  .markdown-alert.markdown-alert-note {
    border-left-color: #0969da;
  }

  .markdown-alert.markdown-alert-note .markdown-alert-title {
    color: #0969da;
  }

  .markdown-alert.markdown-alert-important {
    border-left-color: #8250df;
  }

  .markdown-alert.markdown-alert-important .markdown-alert-title {
    color: #8250df;
  }

  .markdown-alert.markdown-alert-warning {
    border-left-color: #9a6700;
  }

  .markdown-alert.markdown-alert-warning .markdown-alert-title {
    color: #9a6700;
  }

  .markdown-alert.markdown-alert-tip {
    border-left-color: #1a7f37;
  }

  .markdown-alert.markdown-alert-tip .markdown-alert-title {
    color: #1a7f37;
  }

  .markdown-alert.markdown-alert-caution {
    border-left-color: #cf222e;
  }

  .markdown-alert.markdown-alert-caution .markdown-alert-title {
    color: #d1242f;
  }

  > *:first-child > .heading-element:first-child {
    margin-top: 0 !important;
  }
  code[class*='language-'],
  pre[class*='language-'] {
    color: black;
    background: none;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  /* Code blocks */
  pre[class*='language-'] {
    position: relative;
    border-left: 10px solid #358ccb;
    box-shadow: -1px 0 0 0 #358ccb, 0 0 0 1px #dfdfdf;
    background-color: #fdfdfd;
    background-image: linear-gradient(transparent 50%, rgba(69, 142, 209, 0.04) 50%);
    background-size: 3em 3em;
    background-origin: content-box;
    background-attachment: local;
    margin: 0.5em 0;
    padding: 0 1em;
  }

  pre[class*='language-'] > code {
    display: block;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    position: relative;
    padding: 0.2em;
    border-radius: 0.3em;
    color: #c92c2c;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: inline;
    white-space: normal;
    background-color: #fdfdfd;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  .token.comment,
  .token.block-comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #7d8b99;
  }

  .token.punctuation {
    color: #5f6364;
  }

  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.function-name,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #c92c2c;
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.function,
  .token.builtin,
  .token.inserted {
    color: #2f9c0a;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .token.variable {
    color: #a67f59;
    background: rgba(255, 255, 255, 0.5);
  }

  .token.atrule,
  .token.attr-value,
  .token.keyword,
  .token.class-name {
    color: #1990b8;
  }

  .token.regex,
  .token.important {
    color: #e90;
  }

  .language-css .token.string,
  .style .token.string {
    color: #a67f59;
    background: rgba(255, 255, 255, 0.5);
  }

  .token.important {
    font-weight: normal;
  }

  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .border-beam {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: calc(var(--border-width, 1.5px)) solid transparent;
    border-radius: inherit;
    -webkit-mask-clip: padding-box, border-box !important;
    mask-clip: padding-box, border-box !important;
    -webkit-mask-composite: source-in, xor !important;
    mask-composite: intersect !important;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    will-change: auto;
    &::after {
      content: '';
      position: absolute;
      aspect-ratio: 1/1;
      width: calc(var(--size, 80px));
      background: linear-gradient(to left, var(--color-from, #2196f320), var(--color-to, #2196f3), transparent);
      offset-anchor: calc(var(--anchor, 90)) 50%;
      offset-path: rect(0 auto auto 0 round calc(var(--size, 80px)));
      animation: ${borderBeamAnimation} calc(var(--duration, 6s)) infinite linear;
      animation-delay: calc(var(--delay, 0s));
      will-change: auto;
    }
  }
`;

export default MarkdownWithCSS;

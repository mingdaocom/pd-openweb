import React from 'react';
import { createRoot } from 'react-dom/client';
import PublicWorksheet from './PublicWorksheet';

const root = createRoot(document.querySelector('#app'));

root.render(<PublicWorksheet />);

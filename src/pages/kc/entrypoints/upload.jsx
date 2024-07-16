import React from 'react';
import { createRoot } from 'react-dom/client';
import '../main.css';
import UploadAssistant from '../common/UploadAssistant';

$('html').addClass('APP-react');

const root = createRoot(document.getElementById('container'));

root.render(<UploadAssistant />);

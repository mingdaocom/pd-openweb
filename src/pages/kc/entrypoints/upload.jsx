import React from 'react';
import { createRoot } from 'react-dom/client';
import UploadAssistant from '../common/UploadAssistant';
import '../main.css';

$('html').addClass('APP-react');

const root = createRoot(document.getElementById('container'));

root.render(<UploadAssistant />);

import React from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import ScanQrUploadFile from './ScanQrUploadFile';

const root = createRoot(document.getElementById('app'));
const WrappedComp = preall(ScanQrUploadFile, { allowNotLogin: true });
root.render(<WrappedComp />);

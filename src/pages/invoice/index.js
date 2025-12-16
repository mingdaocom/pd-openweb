import React from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import InvoiceApply from './InvoiceApply';

const root = createRoot(document.getElementById('app'));
const WrappedComp = preall(InvoiceApply, { allowNotLogin: true });

root.render(<WrappedComp isLandPage />);

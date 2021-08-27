import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import Header from 'src/components/worksheetConfigHeader';

export default function WidgetConfigHeader({ name: worksheetName, ...rest }) {
  return <Header {...rest} worksheetName={worksheetName} />;
}

import React, { useState } from 'react';
import FunctionWrapHolder from 'ming-ui/components/FunctionWrap/FunctionWrapHolder';
import { createFunctionWrapStore } from 'ming-ui/components/FunctionWrap/store';

export default function useFunctionWrap() {
  const [store] = useState(createFunctionWrapStore);

  return [store.open, <FunctionWrapHolder store={store} />];
}

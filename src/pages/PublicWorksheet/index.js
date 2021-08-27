import React from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import PublicWorksheet from './PublicWorksheet';

const Comp = preall(PublicWorksheet, { allownotlogin: true });

ReactDom.render(<Comp />, document.querySelector('#app'));

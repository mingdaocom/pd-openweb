import React from 'react';
import _ from 'lodash';
import { CommonDisplay } from '../../styled';

export default function Attachment(props) {
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-ic_attachment_black"></i>
        <span>{_.get(props, 'data.hint') || _l('添加附件')}</span>
      </div>
    </CommonDisplay>
  );
}

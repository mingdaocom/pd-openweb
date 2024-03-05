import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CommonDisplay } from '../../styled';

export default function Attachment(props) {
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-ic_attachment_black"></i>
        <span>{_l('添加附件')}</span>
      </div>
    </CommonDisplay>
  );
}

import React from 'react';
import antNotification from '../components/antNotification';
import styled from 'styled-components';
import _ from 'lodash';

const Btn = styled.div`
  display: inline-block;
  border-radius: 5px;
  font-size: 14px;
  color: #2196f3;
  padding: 0 11px;
  line-height: 31px;
  margin-left: 10px;
  max-width: 200px;
  &:hover {
    background: #f5f5f5;
  }
  cursor: pointer;
`;

export function renderBtnList(list) {
  return (
    <div>
      {list.reverse().map(btn => (
        <Btn
          title={typeof btn.text === 'string' ? btn.text : ''}
          className={`${btn.className || ''} ellipsis`}
          onClick={btn.onClick || (() => {})}
        >
          {btn.text}
        </Btn>
      ))}
    </div>
  );
}

function notify(type = 'success', content) {
  let message = '';
  let description = '';
  let btnList = [];

  if (type === 'close') {
    return antNotification.close(content);
  }

  if (type === 'destroy') {
    return antNotification.destroy();
  }

  if (typeof content === 'string') {
    message = content;
  } else {
    message = content.title;
    description = content.description;
    btnList = content.btnList || [];
  }

  if (content.btnText && content.onBtnClick) {
    btnList = [
      {
        text: content.btnText,
        onClick: content.onBtnClick,
      },
    ].concat(btnList);
  }

  antNotification[type]({
    ...(typeof content === 'object' ? content : {}),
    message,
    description,
    btn: !_.isEmpty(btnList) ? renderBtnList(btnList) : undefined,
  });
}

const mdNotification = {
  success: content => {
    notify('success', content);
  },
  error: content => {
    notify('error', content);
  },
  warning: content => {
    notify('warning', content);
  },
  info: content => {
    notify('info', content);
  },
  close: content => {
    notify('close', content);
  },
  destroy: () => {
    notify('destroy');
  },
};

export default mdNotification;

// window.mdNotification = mdNotification;

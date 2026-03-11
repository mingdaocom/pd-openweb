import React from 'react';
import { SpinLoading } from 'antd-mobile';
import { Icon } from 'ming-ui';

export const Loading = () => {
  return (
    <div className="flexRow justifyContentCenter alignItemsCenter h100">
      <SpinLoading color="primary" />
    </div>
  );
};

export const Abnormal = props => {
  const { errorMsg, onClose } = props;
  return (
    <div className="flexColumn h100 valignWrapper justifyContentCenter">
      {onClose && (
        <Icon icon="cancel" className="textTertiary Font22 Absolute" style={{ right: 20, top: 20 }} onClick={onClose} />
      )}
      <Icon icon="error1" className="Font56 textPlaceholder" />
      <div className="mTop10">{errorMsg}</div>
    </div>
  );
};

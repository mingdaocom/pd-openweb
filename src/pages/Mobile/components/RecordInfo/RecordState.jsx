import React from 'react';
import { Icon } from 'ming-ui';
import { Flex, ActivityIndicator } from 'antd-mobile';

export const Loading = props => {
  return (
    <div className="flexColumn h100">
      <Flex justify="center" align="center" className="h100">
        <ActivityIndicator size="large" />
      </Flex>
    </div>
  );
}

export const Abnormal = props => {
  const { errorMsg, onClose } = props;
  return (
    <div className="flexColumn h100 valignWrapper justifyContentCenter">
      {onClose && (
        <Icon
          icon="closeelement-bg-circle"
          className="Gray_9e Font22 Absolute"
          style={{ right: 20, top: 20 }}
          onClick={onClose}
        />
      )}
      <Icon icon="task-folder-message" className="Font56 Gray_df" />
      <div className="mTop10">{errorMsg}</div>
    </div>
  );
}


import React from 'react';

export default function ListNull(props) {
  const { isSearch, type } = props;
  if (isSearch) {
    return (
      <div className="list-null">
        <div className="list-null-icon search" />
        <div className="mTop15">{_l('无匹配结果')}</div>
      </div>
    );
  } else {
    if (type === 'groups') {
      return (
        <div className="list-null">
          <div>{_l('暂无群组')}</div>
        </div>
      );
    } else if (type === 'contacts') {
      return (
        <div className="list-null">
          <div>{_l('暂无成员')}</div>
        </div>
      );
    } else if (type === 'newfriends') {
      return (
        <div className="list-null">
          <div className="list-null-icon newfriends" />
          <div className="mTop20 Font17 Gray_9e">{_l('暂无新的好友')}</div>
        </div>
      );
    }
  }
}

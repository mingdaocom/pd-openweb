import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Avatar } from 'ming-ui';
import UserCard from 'src/components/UserCard';

/**
 * 用户头像，带 hover 的层
 */
export default class UserHead extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      accountId: PropTypes.string,
      userHead: PropTypes.string,
    }).isRequired,
    size: PropTypes.number,
    className: PropTypes.string,
    type: PropTypes.string,
    headClick: PropTypes.func, // 头像的点击事件
    projectId: PropTypes.string, // 网络id
    appId: PropTypes.string,
    operation: PropTypes.element,
    chatButton: PropTypes.bool, // 是否显示发消息按钮
  };

  static defaultProps = {
    chatButton: true,
    size: 48,
  };

  getDefaultImg = accountId => {
    let host = `${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/`;
    switch (accountId) {
      case 'user-self':
        return host + 'user-self.png';
      case 'user-sub':
        return host + 'user-sub.png';
      case 'user-workflow':
        return host + 'workflow.png';
      case 'user-publicform':
        return host + 'publicform.png';
      case 'user-api':
        return host + 'worksheetapi.png';
      case 'user-integration':
        return host + 'user-integration.png';
      default:
        return host + 'default.gif';
    }
  };

  render() {
    const { user, appId, projectId, operation, headClick, chatButton, size } = this.props;

    if (!user) return false;

    const src = user.userHead || this.getDefaultImg(user.accountId);
    const imgSrc =
      src.indexOf('?') > 0
        ? src.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/100/h/100/q/90')
        : src
        ? src + '?imageView2/1/w/100/h/100/q/90'
        : '';

    const result = (
      <div
        className={cx('pointer', this.props.className)}
        rel="noopener noreferrer"
        style={{ display: 'block', width: size, height: size }}
        onClick={event => {
          if (headClick) {
            headClick(user.accountId);
            event.stopPropagation();
          }
        }}
      >
        <Avatar size={size} src={imgSrc || ''} />
      </div>
    );

    const disabled =
      this.props.disabled ||
      [
        'user-self',
        'user-sub',
        'user-undefined',
        'user-workflow',
        'user-publicform',
        'user-api',
        'user-integration',
        '2',
        '4',
      ].includes(user.accountId);

    return (
      <UserCard
        type={this.props.secretType || 1}
        sourceId={user.accountId}
        operation={operation}
        projectId={projectId}
        appId={appId}
        disabled={disabled}
        chatButton={chatButton}
      >
        {result}
      </UserCard>
    );
  }
}

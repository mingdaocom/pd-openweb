import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import { QiniuImg } from '../common/img';

/**
 * 用户头像，带 hover 的层
 */
class UserHead extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      accountId: PropTypes.string,
      userHead: PropTypes.string,
      userMiddleHead: PropTypes.string,
      userSmallHead: PropTypes.string,
      taskPersonId: PropTypes.string, // 审批流程中任务特殊ID
    }).isRequired,
    size: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    className: PropTypes.string,
    circle: PropTypes.bool,
    bindBusinessCard: PropTypes.bool,
    alwaysBindCard: PropTypes.bool,
    type: PropTypes.string,
    readyFn: PropTypes.func,
    lazy: PropTypes.string, // 是否懒加载
    headClick: PropTypes.func, // 头像的点击事件
    cardId: PropTypes.string, // 名片层id
    showOpHtml: PropTypes.bool, // 是否需要显示名片层的操作按钮
    opHtml: PropTypes.string,
    showDeleteIcon: PropTypes.bool,
  };

  static defaultProps = {
    bindBusinessCard: true,
    showDeleteIcon: false,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.bindCard();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user.accountId !== this.props.user.accountId || this.props.alwaysBindCard) {
      this.bindCard();
    } else if (prevProps.opHtml !== this.props.opHtml) {
      this.bindCard();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    const $this = $(ReactDom.findDOMNode(this));
    $this.mdBusinessCard('destroy');
  }

  bindCard = () => {
    const $this = $(ReactDom.findDOMNode(this));
    let { opHtml } = this.props;
    if (!this.props.bindBusinessCard || window.isPublicApp) {
      return false;
    }
    if (!this.props.showOpHtml) {
      opHtml = null;
    } else if (this.props.type === 'manage') {
      opHtml =
        "<span class='Gray_9e ThemeHoverColor3 pointer replaceManage oaButton'>" +
        _l('替换经办人') +
        '</span>' +
        "<span class='Gray_9e ThemeHoverColor3 pointer removeManage oaButton'>" +
        _l('移除经办人') +
        '</span>';
    } else if (this.props.type === 'read') {
      opHtml =
        "<span class='Gray_9e ThemeHoverColor3 pointer replaceRead oaButton'>" +
        _l('替换抄送人') +
        '</span>' +
        "<span class='Gray_9e ThemeHoverColor3 pointer removeRead oaButton'>" +
        _l('移除抄送人') +
        '</span>';
    } else if (this.props.type === 'task') {
      opHtml =
        "<span class='Gray_9e ThemeHoverColor3 pointer replaceTask oaButton'>" +
        _l('替换审批人') +
        '</span>' +
        "<span class='Gray_9e ThemeHoverColor3 pointer removeTask oaButton'>" +
        _l('移除审批人') +
        '</span>';
    } else if (this.props.type === 'role') {
      opHtml =
        "<span class='Gray_9e ThemeHoverColor3 pointer replaceRole oaButton'>" +
        _l('替换角色') +
        '</span>' +
        "<span class='Gray_9e ThemeHoverColor3 pointer removeRole oaButton'>" +
        _l('移除角色') +
        '</span>';
    } else if (this.props.type === 'formAuth') {
      opHtml = "<span class='Gray_9e ThemeHoverColor3 pointer removeFormAuth oaButton'>" + _l('移除') + '</span>';
    }
    // TODO
    // if(this.props.user.accountId != md.global.Project.projectID){
    require(['mdBusinessCard'], () => {
      if (
        !this._isMounted ||
        $this.attr('data-accountid') == '2' ||
        $this.attr('data-accountid') == '4' ||
        $this.attr('data-accountid') == '5'
      ) {
        $this.mdBusinessCard('destroy');
        return;
      }
      $this.mdBusinessCard({
        id: this.props.cardId || 'batchReactChargeCard',
        chatByLink: true, // Chat图标已link 方式跳转
        accountId: this.props.user.accountId,
        secretType: this.props.secretType || 0,
        inviterAccount: this.props.inviterAccount || null,
        force: true,
        reset: !!opHtml,
        opHtml,
        readyFn: (opts, dialog) => {
          if (this.props.readyFn) {
            this.props.readyFn(dialog);
          }
        },
      });
    });
    // }
  };

  render() {
    const { props } = this;
    if (!this.props.user) return false;
    const circle = this.props.circle !== false;
    const size = this.props.size || 48;
    const src = this.props.user.userHead || this.props.user.userMiddleHead || this.props.user.userSmallHead;
    const lazy = !(this.props.lazy === 'false');
    const img = (
      <QiniuImg
        style={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
        size={size}
        qiniuSize={100}
        quality={90}
        lazy={this.props.lazy === undefined ? true : lazy}
        placeholder={`${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/default.gif`}
        className={circle ? 'circle' : ''}
        src={src || ''}
      />
    );
    const width = this.props.width || size;
    const height = this.props.height || size;
    const containerStyle = { display: 'block', width, height };
    // TODO
    // if(!this.props.noLink && (this.props.user.accountId != md.global.Project.projectID)){
    const result = (
      <div
        className={cx('pointer', this.props.className, { relative: this.props.showDeleteIcon })}
        rel="noopener noreferrer"
        style={containerStyle}
        data-accountid={this.props.user.accountId}
        data-id={this.props.user.accountId}
        onClick={event => {
          if (props.headClick) {
            props.headClick(this.props.user.accountId, this.props.user.taskPersonId);
            event.stopPropagation();
          }
        }}
      >
        {img}
        {this.props.showDeleteIcon && (
          <i className="icon-cancel Font14 Absolute" style={{ color: '#f44336', margin: '-2px 0 0 -7px' }} />
        )}
      </div>
    );
    // } else {
    //   result = <span style={containerStyle} {...this.props}>{img}</span>;
    // }
    return result;

    // const userHead = (
    //   <div
    //     className={cx('pointer', this.props.className)}
    //     rel="noopener noreferrer"
    //     style={containerStyle}
    //     onClick={() => {
    //       if (props.headClick) {
    //         props.headClick(this.props.user.accountId, this.props.user.taskPersonId);
    //       }
    //     }}
    //   >
    //     {img}
    //   </div>
    // );
    // return props.bindBusinessCard ? (
    //   <BusinessCard
    //     id={'batchReactChargeCard'}
    //     type={BusinessCard.TYPES.USER}
    //     sourceId={this.props.user.accountId}
    //     reset={this.props.alwaysBindCard}
    //     inviterAccount={this.props.inviterAccount || null}
    //     opHtml={this.props.opHtml}
    //   >
    //     {userHead}
    //   </BusinessCard>
    // ) : (
    //   userHead
    // );
  }
}

module.exports = UserHead;

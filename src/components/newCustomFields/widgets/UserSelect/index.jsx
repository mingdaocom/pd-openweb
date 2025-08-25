import React, { Component } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList, UserHead } from 'ming-ui';
import { quickSelectUser } from 'ming-ui/functions';
import SelectUser from 'mobile/components/SelectUser';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import { FROM } from '../../tools/config';
import { dealUserRange } from '../../tools/utils';
import QuickOperate from './QuickOperate';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    worksheetId: PropTypes.string,
    controlId: PropTypes.string,
    value: PropTypes.any,
    projectId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
    advancedSetting: PropTypes.object,
  };

  state = {
    showSelectUser: false,
    showId: '',
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled'])) ||
      !_.isEqual(_.pick(nextState, ['showSelectUser', 'showId']), _.pick(this.state, ['showSelectUser', 'showId']))
    ) {
      return true;
    }
    return false;
  }

  /**
   * 选择用户
   */
  pickUser = replaceItem => {
    const {
      projectId = '',
      enumDefault,
      enumDefault2,
      advancedSetting = {},
      controlId,
      appId,
      formData = [],
      onChange = () => {},
    } = this.props;
    const value = this.getUserValue();
    const selectedAccountIds = value.map(item => item.accountId);
    const that = this;
    const tabType = getTabTypeBySelectUser(this.props);

    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }

    if (browserIsMobile()) {
      if (advancedSetting.usertype === '1' && enumDefault2 !== 1) {
        const selectUsers = this.getUserValue();
        // 仅限内部用户
        // 支持全范围选择
        // 支持限定网络下选择
        // 不支持指定成员选择
        // 不支持外部用户选择

        compatibleMDJS(
          'chooseUsers',
          {
            projectId: enumDefault2 === 2 ? projectId : undefined, // 网络ID, 默认为空, 不限制
            count: enumDefault === 0 ? 1 : '', // 默认为空, 不限制数量
            //暂不支持 appointed:[], // [accountId], 特定列表, 只加载约定用户
            selected: selectUsers.map(({ accountId, fullname, avatar }) => ({ accountId, fullname, avatar })), // 已选中的用户, 交互上可以取消 [{accountId, fullname, avatar}]
            //暂不支持 disabled: [], // 禁用的用户, 交互上不可选择 [{accountId}]
            //暂不支持 additions: ['user-self', ...], // 默认为空, 不支持额外选项
            // 全部支持项:
            // user-self: 自己
            // user-sub: 下属, 回调数据无头像
            // user-undefined: 未指定, 回调数据无头像
            // user-workflow: 工作流, 回调数据无头像
            // user-system: 系统, 回调数据无头像
            // user-publicform: 公开表单, 回调数据无头像
            // user-api: API, 回调数据无头像
            success: function (res) {
              // 最终选择结果, 完全替换已有数据
              var results = res.results.map(item => ({ ...item, fullname: item.name })); // [{accountId, fullname, avatar}]

              onChange(JSON.stringify(results));
            },
            cancel: function () {
              // 用户取消
            },
          },
          () => this.setState({ showSelectUser: true }),
        );

        return;
      }
      this.setState({ showSelectUser: true });
    } else {
      const selectRangeOptions = dealUserRange(this.props, formData);
      const hasUserRange = Object.values(selectRangeOptions).some(i => !_.isEmpty(i));
      quickSelectUser(this.pick, {
        showMoreInvite: false,
        selectRangeOptions,
        tabType: controlId === '_ownerid' ? 3 : tabType,
        appId,
        prefixAccounts:
          !_.includes(selectedAccountIds, md.global.Account.accountId) && !hasUserRange
            ? [
                {
                  accountId: md.global.Account.accountId,
                  fullname: md.global.Account.fullname,
                  avatar: md.global.Account.avatar,
                },
                ...(controlId === '_ownerid'
                  ? [
                      {
                        accountId: 'user-undefined',
                        fullname: _l('未指定'),
                        avatar: 'https://dn-mdpic.mingdao.com/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
                      },
                    ]
                  : []),
              ]
            : [],
        selectedAccountIds,
        minHeight: 400,
        offset: {
          top: 16,
          left: -16,
        },
        zIndex: 10001,
        isDynamic: enumDefault === 1 && !replaceItem,
        filterOtherProject: enumDefault2 === 2,
        SelectUserSettings: {
          unique: enumDefault === 0 || replaceItem,
          projectId: projectId,
          selectedAccountIds,
          callback: users => that.onSave(users, replaceItem),
        },
        selectCb: users => that.onSave(users, replaceItem),
      });
    }
  };

  getUserValue = () => {
    const { value } = this.props;
    if (!value) return [];
    if (_.isArray(value)) return value;
    if (value && typeof value === 'string') {
      const dealValue = JSON.parse(value);
      return _.isArray(dealValue) ? dealValue : [dealValue];
    } else {
      return [];
    }
  };

  onSave = (users, replaceItem) => {
    const { enumDefault, onChange } = this.props;
    const value = this.getUserValue();

    const newAccounts =
      enumDefault === 0
        ? users
        : _.uniqBy(
            replaceItem ? value.map(v => (v.accountId === replaceItem.accountId ? users[0] : v)) : value.concat(users),
            'accountId',
          );

    onChange(JSON.stringify(newAccounts));
  };

  removeUser(accountId) {
    const { onChange } = this.props;
    const value = this.getUserValue();

    const newValue = value.filter(item => item.accountId !== accountId);
    onChange(JSON.stringify(newValue));
  }

  renderItem = ({ item, dragging, isLayer }) => {
    const { projectId, disabled, from, appId, dataSource } = this.props;
    const isMobile = browserIsMobile();
    const disablePopover = disabled || dragging || isMobile || isLayer;
    const showMenu = this.state.showId === item.accountId && !disablePopover;

    return (
      <Popover
        title={null}
        placement="bottomLeft"
        overlayClassName="quickConfigPopover"
        trigger={['click', 'contextMenu']}
        visible={showMenu}
        onVisibleChange={visible => {
          if (disablePopover) return;
          this.setState({ showId: visible ? item.accountId : '' });
        }}
        content={
          disablePopover ? null : (
            <QuickOperate
              {...this.props}
              item={item}
              showId={this.state.showId}
              handleRemove={() => this.removeUser(item.accountId)}
              handlePick={() => this.pickUser(item)}
              closePopover={() => this.setState({ showId: '' })}
            />
          )
        }
      >
        <div
          className={cx('customFormControlTags', { selected: isMobile && !disabled, clickActive: showMenu })}
          key={item.accountId}
        >
          {from === FROM.SHARE || from === FROM.WORKFLOW ? (
            <div class="cursorDefault userHead InlineBlock" style={{ width: 26, height: 26 }}>
              <img class="circle" width="26" height="26" src={item.avatar} />
            </div>
          ) : (
            <UserHead
              projectId={projectId}
              className="userHead InlineBlock"
              key={`UserHead-${item.accountId}`}
              appId={dataSource ? undefined : appId}
              user={{
                userHead: item.avatar,
                accountId: item.accountId,
              }}
              size={26}
              disabled={dragging}
            />
          )}
          <span className="ellipsis mLeft8" style={{ maxWidth: 200 }}>
            {item.name || item.fullname || item.fullName}
          </span>

          {!disabled && (
            <i
              className="icon-minus-square Font16 tagDel"
              onClick={e => {
                e.stopPropagation();
                this.removeUser(item.accountId);
              }}
            />
          )}
        </div>
      </Popover>
    );
  };

  render() {
    const { projectId, disabled, enumDefault, formData = [], appId, masterData = {}, onChange } = this.props;
    const { showSelectUser } = this.state;
    const value = this.getUserValue();
    const filterAccountIds = _.map(value, 'accountId');

    return (
      <div className="customFormControlBox customFormControlUser">
        <SortableList
          items={value}
          canDrag={!disabled && enumDefault !== 0}
          itemKey="accountId"
          itemClassName="inlineFlex pointer"
          direction="vertical"
          renderBody
          renderItem={item => this.renderItem(item)}
          onSortEnd={items => {
            this.setState({ showId: '' });
            onChange(JSON.stringify(items));
          }}
        />

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            ref={con => (this.pick = con)}
            onClick={() => this.pickUser()}
          >
            <i className={enumDefault === 0 && value.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
          </div>
        )}

        {showSelectUser && (
          <SelectUser
            projectId={projectId}
            visible={true}
            type="user"
            userType={getTabTypeBySelectUser(this.props)}
            appId={appId || ''}
            selectRangeOptions={dealUserRange(this.props, formData, masterData)}
            onlyOne={enumDefault === 0}
            hideClearBtn={enumDefault !== 0}
            filterAccountIds={filterAccountIds}
            onClose={() => this.setState({ showSelectUser: false })}
            onSave={this.onSave}
          />
        )}
      </div>
    );
  }
}

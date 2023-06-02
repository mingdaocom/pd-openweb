import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FROM } from '../../tools/config';
import UserHead from 'src/pages/feed/components/userHead';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import cx from 'classnames';
import SelectUser from 'mobile/components/SelectUser';
import { browserIsMobile, getCurrentProject } from 'src/util';
import { dealUserRange } from '../../tools/utils';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import _ from 'lodash';

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
  };

  /**
   * 选择用户
   */
  pickUser = event => {
    const {
      projectId = '',
      enumDefault,
      advancedSetting = {},
      worksheetId,
      controlId,
      appId,
      formData = [],
    } = this.props;
    const value = this.getUserValue();
    const filterAccountIds = value.map(item => item.accountId);
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
      this.setState({ showSelectUser: true });
    } else {
      const selectRangeOptions = dealUserRange(this.props, formData);
      const hasUserRange = Object.values(selectRangeOptions).some(i => !_.isEmpty(i));
      quickSelectUser($(event.target).closest('.addBtn')[0], {
        showMoreInvite: false,
        selectRangeOptions,
        tabType,
        appId,
        prefixAccounts:
          !_.includes(filterAccountIds, md.global.Account.accountId) && !hasUserRange
            ? [
                {
                  accountId: md.global.Account.accountId,
                  fullname: _l('我自己'),
                  avatar: md.global.Account.avatar,
                },
              ]
            : [],
        filterAccountIds,
        minHeight: 400,
        offset: {
          top: 16,
          left: -16,
        },
        zIndex: 10001,
        isDynamic: enumDefault === 1,
        SelectUserSettings: {
          unique: enumDefault === 0,
          projectId: projectId,
          filterAccountIds,
          callback: that.onSave,
        },
        selectCb: that.onSave,
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

  onSave = users => {
    const { enumDefault, onChange } = this.props;
    const value = this.getUserValue();
    const newAccounts = enumDefault === 0 ? users : _.uniqBy(value.concat(users), 'accountId');

    onChange(JSON.stringify(newAccounts));
  };

  removeUser(accountId) {
    const { onChange } = this.props;
    const value = this.getUserValue();

    const newValue = value.filter(item => item.accountId !== accountId);
    onChange(JSON.stringify(newValue));
  }

  render() {
    const { projectId, disabled, enumDefault, from, formData = [], worksheetId, controlId, appId } = this.props;
    const { showSelectUser } = this.state;
    const value = this.getUserValue();
    const isMobile = browserIsMobile();
    return (
      <div
        className="customFormControlBox"
        style={{
          flexWrap: 'wrap',
          minWidth: 0,
          alignItems: 'center',
          height: 'auto',
          background: '#fff',
          borderColor: '#fff',
          padding: 0,
        }}
      >
        {value.map((item, index) => {
          return (
            <div className={cx('customFormControlTags', { selected: isMobile && !disabled })} key={index}>
              {from === FROM.SHARE || from === FROM.WORKFLOW ? (
                <div class="cursorDefault userHead InlineBlock" style={{ width: 26, height: 26 }}>
                  <img class="circle" width="26" height="26" src={item.avatar} />
                </div>
              ) : (
                <UserHead
                  projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
                  bindBusinessCard={!isMobile}
                  className="userHead InlineBlock"
                  alwaysBindCard
                  key={index}
                  user={{
                    userHead: item.avatar,
                    accountId: item.accountId,
                  }}
                  size={26}
                  lazy="false"
                />
              )}
              <span className="ellipsis mLeft8" style={{ maxWidth: 200 }}>
                {item.name || item.fullname || item.fullName}
              </span>

              {!disabled && (
                <i className="icon-minus-square Font16 tagDel" onClick={() => this.removeUser(item.accountId)} />
              )}
            </div>
          );
        })}

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            onClick={this.pickUser}
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
            selectRangeOptions={dealUserRange(this.props, formData)}
            onlyOne={enumDefault === 0}
            onClose={() => this.setState({ showSelectUser: false })}
            onSave={this.onSave}
          />
        )}
      </div>
    );
  }
}

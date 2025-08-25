import React, { Fragment, useState } from 'react';
import { Popover } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import UserController from 'src/api/user';
import { WIDGET_VALUE_ID } from 'src/components/newCustomFields/tools/config';
import { controlState } from '../../tools/utils';

const QuickOperateWrap = styled.div`
  .operateItem {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 16px;
    line-height: 36px;
    &:hover {
      background: #f5f5f5;
    }
  }
  .showLine {
    width: 100%;
    height: 1px;
    margin: 4px 0;
    background: #ebebeb;
  }
`;

const DISPLAY_OPTIONS = [
  { text: _l('移除'), value: 'del', icon: 'trash' },
  { text: _l('替换'), value: 'replace', icon: 'swap_horiz' },
  { text: _l('移动到'), value: 'move', icon: 'turn-right', isPopover: true },
  { text: _l('添加到'), value: 'add', icon: 'add', isPopover: true },
  { text: _l('发起聊天'), value: 'chat', icon: 'chat1' },
  { text: _l('发邮件'), value: 'email', icon: 'email' },
];

export default function QuickOperate(props) {
  const {
    type,
    enumDefault2,
    controlId,
    advancedSetting = {},
    item = {},
    projectId,
    appId,
    formData = [],
    from,
    value,
    onChange,
  } = props;

  const [showId, setShowId] = useState('');

  const getSelectList = () => {
    let selectControls = formData.filter(
      f => controlState(f, from).editable && f.type === type && f.controlId !== 'ownerid' && f.controlId !== controlId,
    );
    if (type === 26) {
      selectControls = selectControls.filter(s => _.get(s, 'advancedSetting.usertype') === advancedSetting.usertype);
      if (advancedSetting.usertype !== '2') {
        selectControls = selectControls.filter(s => _.includes(enumDefault2 ? [0, 2] : [0], s.enumDefault2));
      }
    } else if (type === 27) {
      selectControls = selectControls.filter(
        s => !_.get(s, 'advancedSetting.departrangetype') || _.get(s, 'advancedSetting.departrangetype') === '0',
      );
    } else if (type === 48) {
      selectControls = selectControls.filter(s => !s.enumDefault2);
    }
    return selectControls;
  };

  const selectControls = getSelectList();

  const getFilterOptions = () => {
    let filterOptions = [].concat(DISPLAY_OPTIONS);
    if (
      (type === 26 &&
        !(
          md.global.Account &&
          ![md.global.Account.accountId, 'user-workflow'].includes(item.accountId) &&
          !item.accountId.includes('#') &&
          !controlId.includes('ownerid') &&
          !md.global.Account.isPortal
        )) ||
      _.includes([27, 48], type)
    ) {
      filterOptions = filterOptions.filter(f => !_.includes(['chat', 'email'], f.value));
    }

    if (
      (md.global.Account.isPortal && !_.find(md.global.Account.projects, item => item.projectId === projectId)) ||
      _.isEmpty(selectControls)
    ) {
      filterOptions = filterOptions.filter(f => !_.includes(['move', 'add'], f.value));
    }
    return filterOptions;
  };

  const getBaseInfo = () => {
    if (_.get(window, 'quickOperateInfo.accountId') === item.accountId) {
      return window.quickOperateInfo;
    }

    const res = UserController.getAccountBaseInfo(
      {
        accountId: item.accountId,
        appId: appId.includes('#') ? this.state.appId : undefined,
        refresh: false,
        onProjectId: projectId.includes('#') ? undefined : projectId,
      },
      { ajaxOptions: { sync: true } },
    );

    window.quickOperateInfo = { ..._.pick(res, ['accountId', 'accountStatus', 'isContact', 'email']) };

    return window.quickOperateInfo;
  };

  const handleClick = option => {
    switch (option.value) {
      case 'del':
        props.handleRemove();
        props.closePopover();
        break;
      case 'replace':
        props.handlePick();
        props.closePopover();
        break;
      case 'move':
      case 'add':
        const addControl = _.find(formData, f => f.controlId === option.controlId);
        const idKey = WIDGET_VALUE_ID[type];
        if (addControl) {
          let tempValue = safeParse(addControl.value || '[]');
          tempValue = addControl.enumDefault ? tempValue.concat([item]) : [item];
          tempValue = _.uniqBy(tempValue, idKey);
          onChange(JSON.stringify(tempValue), option.controlId);

          if (option.value === 'move') {
            let curValue = safeParse(value || '[]');
            curValue = curValue.filter(c => c[idKey] !== item[idKey]);
            onChange(JSON.stringify(curValue), controlId);
          }
        }

        props.closePopover();
        setShowId('');
        break;
      case 'chat':
      case 'email':
        const res = getBaseInfo();
        if (option.value === 'chat' && res.accountStatus === 1 && res.isContact) {
          window.open(`/windowChat?id=${item.accountId}`);
        } else if (
          option.value === 'email' &&
          res.accountStatus === 1 &&
          res.isContact &&
          res.email &&
          res.email.indexOf('*') === -1
        ) {
          const a = document.createElement('a');
          a.href = `mailto:${res.email}`;
          a.target = '_blank';
          a.click();
          props.closePopover();
        } else {
          alert(_l('暂无权限联系该用户'), 3);
        }
        break;
    }
  };

  const renderItem = item => {
    return (
      <Fragment>
        {item.value === 'chat' && <div className="showLine"></div>}
        <Popover
          overlayClassName="quickConfigPopover"
          title={null}
          visible={showId === item.value}
          placement="rightTop"
          onVisibleChange={visible => setShowId(visible ? item.value : '')}
          content={item.isPopover ? renderSelect(item) : null}
        >
          <div className="operateItem" onClick={() => (item.isPopover ? {} : handleClick(item))}>
            {item.icon && <Icon className="Gray_75 Font16" icon={item.icon} />}
            <div className="flex mLeft8 overflow_ellipsis" title={item.text}>
              {item.text}
            </div>
            {item.isPopover && <Icon className="Gray_9e Font12" icon="arrow-right" />}
          </div>
        </Popover>
      </Fragment>
    );
  };

  const renderSelect = item => {
    return (
      <QuickOperateWrap>
        {selectControls.map(s => renderItem({ text: s.controlName, value: item.value, controlId: s.controlId }))}
      </QuickOperateWrap>
    );
  };

  return <QuickOperateWrap>{getFilterOptions().map(renderItem)}</QuickOperateWrap>;
}

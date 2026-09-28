import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _, { find, isEqual } from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Select } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';

export default function Users(props) {
  const { projectId, isMultiple, advancedSetting = {}, onChange = () => {}, appId, from } = props;
  const [values, setValues] = useState(props.values || []);
  const cache = useRef({ values });
  const { shownullitem, nullitemname, navshow, navfilters } = advancedSetting;
  const tabType = getTabTypeBySelectUser(props.control);
  let staticAccounts = [];

  const emptyAvatar = md.global.FileStoreConfig.pictureHost + '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90';

  if (navshow === '2') {
    staticAccounts = safeParse(navfilters)
      .map(safeParse)
      .map(u => ({
        accountId: (u || {}).id,
        fullname: (u || {}).name,
        avatar: (u || {}).avatar,
      }));
  }

  const handleChange = ({ values }) => {
    onChange({ values });
    cache.current.values = values;
    setValues(values);
  };

  const canOpen = () => {
    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return false;
    }

    return true;
  };

  const handleSelect = (users, isCancel = false) => {
    const nextValues = isCancel
      ? cache.current.values.filter(value => value.accountId !== users[0]?.accountId)
      : isMultiple
        ? _.uniqBy([...cache.current.values, ...users], 'accountId')
        : users;

    handleChange({ values: nextValues });
  };

  const handleClick = () => {
    if (!canOpen()) return;

    dialogSelectUser({
      title: _l('添加成员'),
      sourceId: 0,
      fromType: 0,
      showMoreInvite: false,
      SelectUserSettings: {
        includeUndefinedAndMySelf: true,
        filterResigned: false,
        // includeSystemField: true,
        showMoreInvite: false,
        projectId,
        unique: !isMultiple,
        selectedAccountIds: values.map(l => l.accountId),
        callback(users) {
          handleSelect(users);
        },
      },
    });
  };

  useEffect(() => {
    if (!isEqual(props.values, cache.current.values) && props.values) {
      setValues(props.values);
      cache.current.values = props.values;
    }
  }, [props.values]);

  const options = values.map(user => ({
    label: user.fullname || nullitemname || _l('为空'),
    value: user.accountId,
  }));
  const selectedValue = isMultiple ? values.map(user => user.accountId) : values[0]?.accountId;
  const triggerNode = (
    <Select
      className={cx('w100', props.className)}
      mode={isMultiple ? 'multiple' : undefined}
      open={false}
      showSearch={false}
      allowClear
      options={options}
      value={selectedValue}
      onClick={from === 'NavShow' ? handleClick : undefined}
      onClear={() => handleChange({ values: [] })}
      onDeselect={accountId => handleChange({ values: values.filter(value => value.accountId !== accountId) })}
    />
  );

  if (from === 'NavShow') {
    return triggerNode;
  }

  return (
    <UserSelectPopover
      showMoreInvite={false}
      isDynamic={isMultiple}
      tabType={tabType}
      appId={appId}
      includeUndefinedAndMySelf
      includeSystemField
      offset={{ top: 4, left: -1 }}
      filterAccountIds={[md.global.Account.accountId]}
      selectedAccountIds={values.map(l => l.accountId)}
      staticAccounts={(shownullitem === '1'
        ? [
            {
              avatar: emptyAvatar,
              fullname: nullitemname || _l('为空'),
              accountId: 'isEmpty',
            },
          ]
        : []
      ).concat(staticAccounts)}
      SelectUserSettings={{
        projectId,
        unique: !isMultiple,
        filterResigned: md.global.Account.isPortal,
        callback: handleSelect,
      }}
      onSelect={handleSelect}
      onOpenChange={visible => {
        if (visible && !canOpen()) return false;
      }}
    >
      {triggerNode}
    </UserSelectPopover>
  );
}

Users.propTypes = {
  advancedSetting: shape({}),
  appId: string,
  className: string,
  control: shape({}),
  from: string,
  isMultiple: bool,
  projectId: string,
  values: arrayOf(
    shape({
      accountId: string,
      avatar: string,
      fullname: string,
    }),
  ),
  onChange: func,
};

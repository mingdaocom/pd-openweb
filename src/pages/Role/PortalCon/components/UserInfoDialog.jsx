import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Dropdown, Dialog } from 'ming-ui';
import CustomFields from 'src/components/newCustomFields';

import cx from 'classnames';
const UserInfoDialogWrap = styled.div`
  display: flex;
  width: 100%;
  .customFieldsContainer {
    width: 100%;
    padding-top: 26px;
    flex: 1;
  }
  .customFormErrorMessage {
  }
`;
export default function UserInfoDialog(props) {
  const { setShow, show, onChange, title, currentId, classNames, exAccountId } = props;
  const customwidget = useRef(null);
  const [currentData, setCurrentData] = useState(props.currentData || []);
  const [ids, setIds] = useState([]);

  return (
    <Dialog
      title={title || _l('修改用户信息')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      className={cx('userInfoDialog', classNames)}
      headerClass="userInfoDialogTitle"
      bodyClass="userInfoDialogCon"
      width={800}
      onCancel={() => {
        setShow(false);
      }}
      onOk={() => {
        let { data, hasError } = customwidget.current.getSubmitData();
        if (hasError) {
          return;
        }
        props.onOk(data, ids);
        setShow(false);
      }}
      visible={show}
      updateTrigger="fasle"
    >
      <UserInfoDialogWrap>
        <CustomFields
          disableRules
          ref={customwidget}
          data={currentData
            .map(o => {
              return { ...o, size: 12 }; //全部按整行显示
            })
            .filter(o => !['avatar', 'roleid', 'status'].includes(o.alias))}
          onChange={(data, ids) => {
            setIds(ids);
          }}
        />
      </UserInfoDialogWrap>
    </Dialog>
  );
}

import React, { useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import CustomFields from 'src/components/Form';

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
  const { setShow, show, title, classNames, currentData = [] } = props;
  const customwidget = useRef(null);
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
        let { data = [], hasError } = customwidget.current.getSubmitData();
        if (hasError) {
          return;
        }
        if (data.find(o => o.type === 29 && safeParse(o.value, 'array').length > 5)) {
          alert(_l('最多只能关联 5 条记录'), 3);
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

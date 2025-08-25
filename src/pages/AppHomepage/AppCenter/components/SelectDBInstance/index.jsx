import React, { Fragment, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';

const DropdownWrap = styled.div`
  padding: 8px 0;
  max-height: 201px;
  overflow-y: scroll;
  font-size: 13px;
  color: #151515;
  border-radius: 3px;
  .item {
    height: 36px;
    line-height: 36px;
    padding: 0 14px;
    &:hover {
      background: #f5f5f5;
    }
    &.current {
      background: #e6f7ff !important;
    }
  }
  .splitLine {
    margin-left: 14px;
    margin-right: 14px;
    height: 1px;
    background: #eaeaea;
  }
`;

function SelectDBInstance(props) {
  const { visible = false, options = [], onOk = () => {}, onCancel = () => {} } = props;

  const [dbInstance, setDbInstance] = useState({ label: _l('系统默认数据库'), value: '' });
  const [open, setOpen] = useState(false);

  const handleOk = () => {
    if (dbInstance.value === undefined) {
      alert(_l('请选择数据库'), 3);
      return;
    }
    onOk(dbInstance.value);
    onCancel();
  };

  return (
    <Dialog
      title={_l('存储到哪个数据库？')}
      visible={visible}
      width={640}
      overlayClosable={false}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <div className="Gray_9e">{_l('选择应用的存储数据库，应用内工作表数据将会保存在所选专属数据库内')}</div>
      <div className="mTop12">{_l('注意：应用创建后，所属数据库不可再修改')}</div>
      <Select
        open={open}
        value={dbInstance.label}
        optionLabelProp="label"
        popupClassName="dbInstanceSelect"
        placeholder={_l('请选择应用的存储数据库')}
        className="w100 mdAntSelect mTop28"
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
        onDropdownVisibleChange={visible => setOpen(visible)}
        dropdownRender={() => {
          return (
            <DropdownWrap>
              {options.map(l => (
                <Fragment>
                  <div
                    className={cx('item Hand overflow_ellipsis', { current: l.value === dbInstance.value })}
                    onClick={() => {
                      setDbInstance(l);
                      setOpen(false);
                    }}
                    key={`dbInstanceSelect-${l.value}`}
                  >
                    {l.label}
                  </div>
                  {!l.value && <div className="splitLine mTop4 mBottom4"></div>}
                </Fragment>
              ))}
            </DropdownWrap>
          );
        }}
      />
    </Dialog>
  );
}

export default SelectDBInstance;

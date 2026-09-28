import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';

const DropdownWrap = styled.div`
  padding: 8px 0;
  max-height: 201px;
  overflow-y: scroll;
  font-size: 13px;
  color: var(--color-text-title);
  border-radius: 3px;
  .item {
    height: 36px;
    line-height: 36px;
    padding: 0 14px;
    &:hover {
      background: var(--color-background-hover);
    }
    &.current {
      background: var(--color-cyan-blue) !important;
    }
  }
  .splitLine {
    margin-left: 14px;
    margin-right: 14px;
    height: 1px;
    background: var(--color-border-secondary);
  }
`;

const DB_INSTANCE_SELECT_CLASS_NAMES = { popup: { root: 'dbInstanceSelect' } };

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
    <Modal
      title={_l('存储到哪个数据库？')}
      open={visible}
      width={640}
      mask={{ closable: false }}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <div className="textTertiary">{_l('选择应用的存储数据库，应用内工作表数据将会保存在所选专属数据库内')}</div>
      <div className="mTop12">{_l('注意：应用创建后，所属数据库不可再修改')}</div>
      <Select
        open={open}
        value={dbInstance.label}
        optionLabelProp="label"
        classNames={DB_INSTANCE_SELECT_CLASS_NAMES}
        placeholder={_l('请选择应用的存储数据库')}
        className="w100 mTop28"
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
        onOpenChange={setOpen}
        popupRender={() => {
          return (
            <DropdownWrap>
              {options.map(l => (
                <Fragment key={`dbInstanceSelect-${l.value}`}>
                  <div
                    className={cx('item Hand overflow_ellipsis', { current: l.value === dbInstance.value })}
                    onClick={() => {
                      setDbInstance(l);
                      setOpen(false);
                    }}
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
    </Modal>
  );
}

export default SelectDBInstance;

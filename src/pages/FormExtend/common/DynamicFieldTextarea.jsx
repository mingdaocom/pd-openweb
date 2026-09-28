import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, TagTextarea } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';

const Wrapper = styled.div`
  display: flex;
  position: relative;
  .tagInputareaIuput {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    .CodeMirror-lines {
      line-height: 22px;
    }
    .CodeMirror-placeholder {
      color: var(--color-text-disabled) !important;
      padding: 0 10px !important;
    }
  }
  .controlTag {
    font-size: 12px;
    line-height: 16px;
    padding: 0 10px;
    border-radius: 16px;
    background: #d8eeff;
    color: var(--color-primary);
    border: 1px solid var(--color-primary-transparent);
    &.invalid {
      color: var(--color-error);
      background: rgba(244, 67, 54, 0.06);
      border-color: var(--color-error);
    }
  }

  .referBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid var(--color-border-tertiary);
    border-left: none;
    cursor: pointer;
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-primary);
    }
  }
`;

export default function SelectWithRefer(props) {
  const { className, value, onChange, controlList = [] } = props;
  const [visible, setVisible] = useState(false);
  const tagTextareaRef = useRef(null);
  const popupContainerRef = useRef(null);

  return (
    <Wrapper ref={popupContainerRef} className={className}>
      <TagTextarea
        className="flex"
        placeholder={_l('请输入')}
        maxHeight={140}
        ref={tagTextareaRef}
        renderTag={id => {
          const controlName = (_.find(controlList, item => item.controlId === id) || {}).controlName;
          return <div className={cx('controlTag', { invalid: !controlName })}>{controlName || _l('字段已删除')}</div>;
        }}
        defaultValue={value}
        onChange={(err, value) => !err && onChange(value)}
      />

      <Dropdown
        trigger={['click']}
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
        getPopupContainer={() => popupContainerRef.current}
        styles={{ root: { width: '100%' } }}
        menu={{
          style: { width: '100%', maxHeight: 300, overflowY: 'auto' },
          items: controlList.map(control => ({
            key: control.controlId,
            icon: <Icon icon={getIconByType(control.type)} className="Font16" />,
            label: <span className="overflow_ellipsis">{control.controlName}</span>,
            onClick: () => {
              tagTextareaRef.current.insertColumnTag(control.controlId);
              setVisible(false);
            },
          })),
        }}
      >
        <div className="referBtn">
          <Icon icon="workflow_other" className="Font20" />
        </div>
      </Dropdown>
    </Wrapper>
  );
}

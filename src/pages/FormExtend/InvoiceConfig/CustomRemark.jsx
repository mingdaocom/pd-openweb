import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, TagTextarea } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';

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

  .rc-trigger-popup {
    width: 100%;
    .ming.Menu {
      position: unset;
      width: 100%;
      max-height: 300px;
      overflow-y: auto;
    }
  }
`;

export default function SelectWithRefer(props) {
  const { value, onChange, controlList = [] } = props;
  const [visible, setVisible] = useState(false);
  const tagTextareaRef = useRef(null);
  const popupContainerRef = useRef(null);

  return (
    <Wrapper ref={popupContainerRef}>
      <TagTextarea
        className="w100"
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

      <Trigger
        action={['click']}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{ points: ['tr', 'br'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
        getPopupContainer={() => popupContainerRef.current}
        popup={
          <Menu>
            {controlList.map(control => (
              <MenuItem
                key={control.controlId}
                onClick={() => tagTextareaRef.current.insertColumnTag(control.controlId)}
              >
                <Icon icon={getIconByType(control.type)} className="Font16" />
                <span className="overflow_ellipsis flex mLeft12">{control.controlName}</span>
              </MenuItem>
            ))}
          </Menu>
        }
      >
        <div className="referBtn">
          <Icon icon="workflow_other" className="Font20" />
        </div>
      </Trigger>
    </Wrapper>
  );
}

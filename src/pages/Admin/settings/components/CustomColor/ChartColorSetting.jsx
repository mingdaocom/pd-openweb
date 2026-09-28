import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Dropdown, Tooltip } from 'ming-ui/antd-components';

const ChartColorSettingBox = styled.div(
  ({ $select = false }) => `
  width: 150px;
  height: 110px;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: relative;
  &:hover {
    border: 1px solid var(--color-primary);
    .chartWrap,
    .titleWrap {
      opacity: 1;
    }
  }
  .chartWrap {
    padding: 0 10px 8px 10px;
    display: flex;
    justify-content: space-between;
    gap: 6px;
    align-items: end;
    cursor: pointer;
    opacity: ${$select ? 1 : 0.6};
    &.minGap {
      gap: 2px;
    }
    .colorBox {
      width: 11px;
      display: inline-block;
    }
  }
  .titleWrap {
    border-top: 1px solid var(--color-border-primary);
    padding: 5px 3px 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
    cursor: pointer;
    opacity: ${$select ? 1 : 0.6};
    .option {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
  .ChartColorSetting_checkbox {
    position: absolute;
    top: 0;
    right: 6px;
  }
`,
);

const COLOR_BOX_HEIGHT = [48, 24, 32, 24, 13, 29, 22, 41];

export default function ChartColorSetting(props) {
  const {
    name,
    editable = false,
    selected = false,
    colors = [],
    openDialog,
    handleSelect = () => {},
    remove = () => {},
    copy = () => {},
    disablechecked = false,
  } = props;

  const [visible, setVisible] = useState(false);

  return (
    <ChartColorSettingBox $select={selected}>
      <div className={cx('chartWrap flex', { minGap: colors.length > 8 })} onClick={() => handleSelect(!selected)}>
        {colors.map((color, index) => (
          <span className="colorBox" style={{ background: color, height: COLOR_BOX_HEIGHT[(index + 1) % 8] }}></span>
        ))}
      </div>
      {!disablechecked && (
        <Checkbox
          className="ChartColorSetting_checkbox"
          checked={selected}
          onChange={event => handleSelect(event.target.checked)}
          size="small"
        >
          {null}
        </Checkbox>
      )}
      <div className="titleWrap" onClick={openDialog}>
        <span className="ellipsis flex Bold">
          <Tooltip title={name}>
            <span>{name}</span>
          </Tooltip>
        </span>
        <Dropdown
          menu={{
            items: editable
              ? [
                  {
                    key: 'edit',
                    icon: <Icon icon="edit" className="Font18 textTertiary" />,
                    label: _l('编辑'),
                  },
                  {
                    key: 'copy',
                    icon: <Icon icon="copy" className="Font18 textTertiary" />,
                    label: _l('复制'),
                  },
                  {
                    key: 'delete',
                    danger: true,
                    icon: <Icon icon="delete_12" className="Font18" />,
                    label: _l('删除'),
                  },
                ]
              : [
                  {
                    key: 'view',
                    icon: <Icon icon="follow" className="Font18 textTertiary" />,
                    label: _l('查看'),
                  },
                ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              setVisible(false);
              if (key === 'copy') {
                copy();
              } else if (key === 'delete') {
                remove();
              } else {
                openDialog();
              }
            },
            style: { minWidth: 120 },
          }}
          open={visible}
          onOpenChange={visible => {
            setVisible(visible);
          }}
          trigger={['click']}
        >
          <span className="option" onClick={e => e.stopPropagation()}>
            <i className="icon-more_horiz Font16"></i>
          </span>
        </Dropdown>
      </div>
    </ChartColorSettingBox>
  );
}

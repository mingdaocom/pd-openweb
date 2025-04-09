import React, { useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Checkbox, Icon, Tooltip } from 'ming-ui';

const ChartColorSettingBox = styled.div(
  ({ select = false }) => `
  width: 150px;
  height: 110px;
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: relative;
  &:hover {
    border: 1px solid #2196F3;
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
    opacity: ${select ? 1 : 0.6};
    &.minGap {
      gap: 2px;
    }
    &:hover {
      & + .ChartColorSetting_checkbox {
        .Checkbox-box {
          border: 1px solid #2196F3;
        }
      }
    }
    .colorBox {
      width: 11px;
      display: inline-block;
    }
  }
  .titleWrap {
    border-top: 1px solid #DDDDDD;
    padding: 5px 3px 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
    cursor: pointer;
    opacity: ${select ? 1 : 0.6};
    .option {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      i {
        color: #9E9E9E;
        &:hover {
          color: #2196f3;
        }
      }
    }
  }
  .ChartColorSetting_checkbox {
    position: absolute;
    top: 0;
    right: 6px;
  }
  .ming.Checkbox .Checkbox-box {
    margin-right: 0;
  }
`,
);

const Menu = styled.div`
  width: 120px;
  padding: 6px 0;
  background: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  opacity: 1;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  .item {
    padding: 9px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:hover {
      background: #f5f5f5;
    }
  }
  .deleteItem {
    color: #f44336;
    .icon {
      color: #f44336;
    }
  }
`;

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

  const menu = (
    <Menu>
      {editable ? (
        <React.Fragment>
          <div
            className="item"
            onClick={e => {
              e.stopPropagation();
              setVisible(false);
              openDialog();
            }}
          >
            <Icon icon="edit" className="Font18 Gray_9e mRight10" />
            {_l('编辑')}
          </div>
          <div
            className="item"
            onClick={e => {
              e.stopPropagation();
              setVisible(false);
              copy();
            }}
          >
            <Icon icon="copy" className="Font18 Gray_9e mRight10" />
            {_l('复制')}
          </div>
          <div
            className="item deleteItem"
            onClick={e => {
              e.stopPropagation();
              setVisible(false);
              remove();
            }}
          >
            <Icon icon="delete_12" className="Font18 mRight10" />
            {_l('删除')}
          </div>
        </React.Fragment>
      ) : (
        <div
          className="item"
          onClick={e => {
            e.stopPropagation();
            setVisible(false);
            openDialog();
          }}
        >
          <Icon icon="follow" className="Font18 Gray_9e mRight10" />
          {_l('查看')}
        </div>
      )}
    </Menu>
  );

  return (
    <ChartColorSettingBox select={selected}>
      <div className={cx('chartWrap flex', { minGap: colors.length > 8 })} onClick={() => handleSelect(!selected)}>
        {colors.map((color, index) => (
          <span className="colorBox" style={{ background: color, height: COLOR_BOX_HEIGHT[(index + 1) % 8] }}></span>
        ))}
      </div>
      {!disablechecked && (
        <Checkbox
          className="ChartColorSetting_checkbox"
          size="small"
          text={null}
          checked={selected}
          onClick={checked => handleSelect(!checked)}
        />
      )}
      <div className="titleWrap" onClick={openDialog}>
        <span className="ellipsis flex Bold">
          <Tooltip text={name}>
            <span>{name}</span>
          </Tooltip>
        </span>
        <Trigger
          popup={menu}
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            setVisible(visible);
          }}
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
            overflow: { adjustX: true, adjustY: true },
          }}
        >
          <span className="option" onClick={e => e.stopPropagation()}>
            <i className="icon-task-point-more Font16"></i>
          </span>
        </Trigger>
      </div>
    </ChartColorSettingBox>
  );
}

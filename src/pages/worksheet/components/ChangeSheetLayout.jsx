import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Checkbox, Modal, Popover } from 'ming-ui/antd-components';

const ChangeSheetLayout = styled.span`
  position: absolute;
  left: 12px;
  cursor: pointer;
  font-size: 15px;
  color: var(--color-primary);
  .icon {
    font-size: 16px;
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-primary);
    }
  }
`;

const PopupCon = styled.div`
  width: 360px;
  padding: 20px;
  .title {
    font-size: 15px;
    color: var(--color-text-title);
    font-weight: 500;
  }
  .description {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.8em;
    margin: 10px 0 26px;
  }
  .buttons {
    text-align: right;
  }
`;

export default function LayoutChangedIcon(props) {
  const {
    className,
    style,
    title,
    description,
    isSheetView,
    onSave = () => {},
    onCancel = () => {},
    applyToAllChecked,
  } = props;
  const [popupVisible, setPopupVisible] = useState();
  const cache = useRef({
    isApplyAll: applyToAllChecked,
  });

  function closePopup() {
    setPopupVisible(false);
  }

  return (
    <ChangeSheetLayout className={className} style={style}>
      {isSheetView ? (
        <i
          className="icon icon-save1"
          onClick={() => {
            Modal.confirm({
              width: 480,
              title: _l('你变更了表格样式，是否保存？'),
              content: (
                <div>
                  <div>
                    {description ||
                      _l('保存当前表格列的冻结、隐藏、汇总、样式（宽度、对齐、显示方式）配置。此配置对所有用户生效')}
                  </div>
                  <div className="flexCenter mTop20">
                    <Checkbox
                      className="textSecondary"
                      defaultChecked={applyToAllChecked}
                      onChange={() => (cache.current.isApplyAll = !cache.current.isApplyAll)}
                      style={{
                        color: '#333',
                        userSelect: 'none',
                        fontSize: '14px',
                      }}
                    >
                      {_l('同时将列样式应用到其它所有表格视图')}
                    </Checkbox>
                  </div>
                </div>
              ),
              okText: _l('保存'),
              onOk: () => {
                onSave({
                  closePopup,
                  isApplyAll: cache.current.isApplyAll,
                });
              },
              onCancel: onCancel.bind(this, {
                closePopup,
              }),
            });
          }}
        ></i>
      ) : (
        <Popover
          open={popupVisible}
          onOpenChange={newvisible => {
            setPopupVisible(newvisible);
          }}
          content={
            <PopupCon>
              <div className="title">{title || _l('你变更了表格样式，是否保存？')}</div>
              <div className="description">
                {description || _l('保存当前表格的列宽、列冻结、列隐藏配置，并应用给所有用户')}
              </div>
              <div className="buttons">
                <Button size="large" onClick={onCancel.bind(this, { closePopup })}>
                  {_l('取消')}
                </Button>
                <Button type="primary" size="large" className="mLeft16" onClick={onSave.bind(this, { closePopup })}>
                  {_l('保存')}
                </Button>
              </div>
            </PopupCon>
          }
          trigger="click"
          placement="bottomLeft"
          noPadding
        >
          <i className="icon icon-save1"></i>
        </Popover>
      )}
    </ChangeSheetLayout>
  );
}

LayoutChangedIcon.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

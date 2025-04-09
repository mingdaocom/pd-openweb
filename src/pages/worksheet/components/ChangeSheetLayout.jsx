import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Icon, Button, Dialog, Checkbox, Tooltip } from 'ming-ui';

const ChangeSheetLayout = styled.span`
  position: absolute;
  left: 12px;
  cursor: pointer;
  font-size: 15px;
  color: #2196f3;
  .icon {
    font-size: 16px;
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const PopupCon = styled.div`
  width: 360px;
  border-radius: 2px;
  padding: 20px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.16);
  background-color: #fff;
  .title {
    font-size: 15px;
    color: #151515;
    font-weight: 500;
  }
  .description {
    font-size: 13px;
    color: #757575;
    line-height: 1.8em;
    margin: 10px 0 26px;
  }
  .buttons {
    text-align: right;
    .Button {
      margin-left: 16px;
    }
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
            Dialog.confirm({
              onlyClose: true,
              title: _l('你变更了表格样式，是否保存？'),
              description: (
                <div>
                  <div>
                    {description ||
                      _l('保存当前表格列的冻结、隐藏、汇总、样式（宽度、对齐、显示方式）配置。此配置对所有用户生效')}
                  </div>
                  <div className="flexCenter mTop20">
                    <Checkbox
                      className="InlineBlock"
                      defaultChecked={applyToAllChecked}
                      text={_l('同时将列样式应用到其它所有表格')}
                      onClick={() => (cache.current.isApplyAll = !cache.current.isApplyAll)}
                      style={{
                        color: '#333',
                        userSelect: 'none',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              ),
              okText: _l('保存'),
              onOk: () => {
                onSave({ closePopup, isApplyAll: cache.current.isApplyAll });
              },
              onCancel: onCancel.bind(this, { closePopup }),
            });
          }}
        ></i>
      ) : (
        <Trigger
          popupVisible={popupVisible}
          onPopupVisibleChange={newvisible => {
            setPopupVisible(newvisible);
          }}
          popup={
            <PopupCon>
              <div className="title">{title || _l('你变更了表格样式，是否保存？')}</div>
              <div className="description">
                {description || _l('保存当前表格的列宽、列冻结、列隐藏配置，并应用给所有用户')}
              </div>
              <div className="buttons">
                <Button size="mdnormal" type="ghostgray" onClick={onCancel.bind(this, { closePopup })}>
                  {_l('取消')}
                </Button>
                <Button size="mdnormal" onClick={onSave.bind(this, { closePopup })}>
                  {_l('保存')}
                </Button>
              </div>
            </PopupCon>
          }
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [-13, 8],
            overflow: { adjustX: true, adjustY: true },
          }}
        >
          <i className="icon icon-save1"></i>
        </Trigger>
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

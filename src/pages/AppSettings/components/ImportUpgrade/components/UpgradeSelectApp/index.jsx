import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, SvgIcon } from 'ming-ui';
import Trigger from 'rc-trigger';
import { dialogSelectApp } from 'ming-ui/functions';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-height: 0;
  border-radius: 8px;
  overflow-y: auto;
  border: 1px dashed #eaeaea;
  box-sizing: border-box;
  margin-bottom: 20px;
  flex: 1;
  padding: 40px 58px;
  .UpgradeSelectAppItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .box {
      width: 310px;
      height: 72px;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      &.leftBox {
        background: #f5f5f5;
      }
      &.rightBox {
        border: 1px solid #eaeaea;
      }
      .iconWrap {
        width: 40px;
        height: 40px;
        display: inline-block;
        background: #fff;
        border-radius: 4px 4px 4px 4px;
        color: #fff;
        text-align: center;
        line-height: 40px;
        .icon,
        svg {
          vertical-align: middle !important;
        }
      }
    }
    .selectAppBtn {
      &:hover {
        border: 1px solid #2196f3;
        color: #2196f3 !important;
      }
    }
  }
  .rotate90 {
    transform: rotate(-90deg);
  }
`;

const SelectWrap = styled.ul`
  width: 174px;
  padding: 7px 0;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px;
  font-size: 13px;
  color: #333333;
  li {
    padding: 10px 20px;
    cursor: pointer;
    &:hover {
      color: #2196f3;
      background: #e6f2fd;
    }
  }
`;

const SelectOptions = [
  {
    label: _l('选择已有应用'),
    value: 0,
  },
  {
    label: _l('生成为新应用'),
    value: 1,
  },
];

export default function UpgradeSelectApp(props) {
  const { projectId, files = [], updateFields } = props;
  const [popupVisibleId, setPopupVisibleId] = useState(undefined);
  const [selectIds, setSelectIds] = useState([]);

  const onSelectOption = (fileName, type) => {
    const index = _.findIndex(files, l => l.fileName === fileName);
    setPopupVisibleId(undefined);

    if (type === 1) {
      files[index].type = type;
      files[index].selectApp && setSelectIds(selectIds.filter(l => l !== files[index].selectApp.appId));
      files[index].selectApp = undefined;
      updateFields([...files]);
    } else {
      dialogSelectApp({
        projectId,
        title: _l('添加应用'),
        unionId: _.get(files[index], 'apps[0].unionId'),
        ajaxFun: 'getsByUnionId',
        filterIds: selectIds,
        filterFun: l => !selectIds.includes(l.appId) && !l.isLock,
        unique: true,
        onOk: selectedApps => {
          files[index].type = type;
          files[index].selectApp
            ? setSelectIds(selectIds.filter(l => l !== files[index].selectApp.appId).concat(selectedApps[0].appId))
            : setSelectIds(selectIds.concat(selectedApps[0].appId));
          files[index].selectApp = selectedApps[0];
          updateFields([...files]);
        },
      });
    }
  };

  const renderPopup = item => {
    return (
      <SelectWrap>
        {SelectOptions.map(l => (
          <li key={`UpgradeSelectApp-SelectOptions-${l.value}`} onClick={() => onSelectOption(item.fileName, l.value)}>
            {l.label}
          </li>
        ))}
      </SelectWrap>
    );
  };

  const renderSelectBtn = (item, children) => {
    return (
      <Trigger
        popupVisible={popupVisibleId === item.fileName}
        onPopupVisibleChange={visible => setPopupVisibleId(visible ? item.fileName : undefined)}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [10, -20],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={renderPopup(item)}
      >
        {children}
      </Trigger>
    );
  };

  const renderBox = (item, type = 'leftBox') => {
    const isLeft = type === 'leftBox';
    const appInfo = isLeft ? _.get(item, 'apps[0]') : item.selectApp;

    return (
      <div className={cx('box Hand', type, { selectAppBtn: item.type === undefined })}>
        {(isLeft || item.type === 0) && (
          <span className="iconWrap mRight10" style={{ background: appInfo.iconColor }}>
            <SvgIcon url={appInfo.iconUrl} fill="#fff" size={24} />
          </span>
        )}
        <span className="flex name overflow_ellipsis Font15">
          {item.type === 1 && !isLeft ? _l('生成为新应用') : appInfo.name || appInfo.appName}
        </span>
        {!isLeft && renderSelectBtn(item, <Icon icon="swap_horiz" className="Gray_bd Font18" />)}
      </div>
    );
  };

  return (
    <Wrap className="mTop35">
      {files.map(item => {
        const appInfo = _.get(item, 'apps[0]');

        return (
          <div className="UpgradeSelectAppItem" key={`UpgradeSelectAppItem-${item.fileName}`}>
            {renderBox(item)}
            <Icon
              icon="arrow_down"
              className={cx('Font26 rotate90', item.type === undefined ? 'Gray_bd' : 'ThemeColor')}
            />
            {item.type === undefined
              ? renderSelectBtn(
                  item,
                  <div className="box Hand selectAppBtn rightBox">
                    <Icon icon="add-member2" className="Gray_bd Font18 mRight10" />
                    <span className="flex name overflow_ellipsis Font15 Gray_bd">{_l('选择')}</span>
                  </div>,
                )
              : renderBox(item, 'rightBox')}
          </div>
        );
      })}
    </Wrap>
  );
}

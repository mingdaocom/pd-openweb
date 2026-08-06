import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import worksheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instance';

const Box = styled.div`
  width: 100%;
  height: 36px;
  background: var(--color-yellow-black);
  border-radius: 3px;
  border: 1px solid var(--color-warning-border);
  padding: 0 12px;
`;

const FROM_TYPE = {
  workflow: 1,
  worksheet: 2,
  log: 3,
};

export default ({
  type,
  archivedItem = {},
  showSelectItem = true,
  params = {},
  iconClassName,
  onChange = () => {},
  customRender,
}) => {
  const [showList, setShowList] = useState(false);
  const [list, setList] = useState([]);
  const [selectItem, setSelectItem] = useState(archivedItem);

  const onSelect = (item = {}) => {
    setSelectItem(item);
    onChange(item);
    setShowList(false);
  };

  const renderTrigger = () => {
    return (
      <Trigger
        popupVisible={showList}
        onPopupVisibleChange={visible => setShowList(visible)}
        action={['click']}
        popup={() => {
          return (
            <Menu style={{ left: 'initial', right: 0, width: 200 }}>
              {list.map((item, index) => (
                <MenuItem
                  key={index}
                  disabled={item.id === selectItem.id}
                  onClick={() => onSelect(item)}
                  style={{ lineHeight: 'normal', height: 36 }}
                >
                  <div className="pTop8 pBottom8 Font14">{item.text}</div>
                </MenuItem>
              ))}
            </Menu>
          );
        }}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        {customRender ? (
          customRender()
        ) : (
          <Tooltip title={_l('查看已归档数据')}>
            <Icon
              icon="drafts_approval"
              className={cx(
                `Font20 pointer ${iconClassName}`,
                _.isEmpty(selectItem)
                  ? `${iconClassName ? iconClassName : 'textSecondary'} hoverColorPrimary`
                  : 'colorPrimary hoverColorPrimaryDark ',
              )}
            />
          </Tooltip>
        )}
      </Trigger>
    );
  };

  useEffect(() => {
    setSelectItem(archivedItem);
  }, [archivedItem]);

  useEffect(() => {
    const promiseFn =
      type === FROM_TYPE.workflow
        ? instance.getArchivedList()
        : type === FROM_TYPE.worksheet
          ? worksheetAjax.getWorksheetArchives()
          : type === FROM_TYPE.log
            ? appManagementAjax.getArchivedList(params)
            : null;

    if (promiseFn) {
      promiseFn.then(res => {
        const list =
          type === FROM_TYPE.log
            ? (res.list || []).map(({ archivedId, startTime, endTime, text }) => ({
                id: archivedId,
                start: startTime,
                end: endTime,
                text,
              }))
            : res;
        setList(list.reverse());
      });
    }
  }, []);

  if (!_.isEmpty(selectItem) && showSelectItem) {
    return (
      <Box className="flexRow alignItemsCenter">
        <div className="bold">{_l('查看已归档数据：')}</div>
        <div className="mLeft5 flex">{selectItem.text}</div>
        {renderTrigger()}
        <Icon
          icon="cancel"
          className="Font20 mLeft10 textTertiary hoverColorPrimary pointer"
          onClick={() => onSelect()}
        />
      </Box>
    );
  }

  if (!list.length) return null;

  return renderTrigger();
};

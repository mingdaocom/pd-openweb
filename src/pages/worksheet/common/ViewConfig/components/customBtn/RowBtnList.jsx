import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import { BTN_LIST, SYS_BTN_LIST } from './config';
import { actionColumnOptionsFromLayouts, getActionColumnKey } from './groupedLayout/actionColumnUtils';

const Wrap = styled.li`
  .svgIconForBtn {
    display: inline-flex;
  }
`;

const renderIcon = (data, key, isMuted = false) => {
  if (key === 'sys') {
    return <Icon icon={data.icon} style={{ color: data.color }} className={cx('mRight12 Font18 InlineFlex')} />;
  }

  if (key === 'btn' || key === 'group') {
    const { color, icon, iconUrl } = data;
    const fill = isMuted
      ? 'var(--color-text-disabled)'
      : !color
        ? 'var(--color-primary)'
        : color === 'transparent'
          ? 'var(--color-text-primary)'
          : color;
    return (
      <React.Fragment>
        {!!iconUrl && !!icon && (icon.endsWith('_svg') || icon.startsWith('sys_')) ? (
          <SvgIcon
            className="mRight12 svgIconForBtn InlineFlex"
            addClassName="TxtMiddle"
            url={iconUrl}
            fill={fill}
            size={18}
          />
        ) : (
          <Icon
            icon={icon || 'custom_actions'}
            style={{
              color: isMuted ? 'var(--color-text-disabled)' : color,
            }}
            className={cx(
              'mRight12 Font18 InlineFlex',
              isMuted
                ? 'textDisabled'
                : !icon
                  ? 'textDisabled'
                  : !color
                    ? 'colorPrimary'
                    : color === 'transparent'
                      ? 'textPrimary'
                      : '',
            )}
          />
        )}
      </React.Fragment>
    );
  }

  return <Icon icon="print" className={cx('mRight12 Font18 textSecondary InlineFlex')} />;
};

function RowBtnList({
  btnList,
  onAdd = () => {},
  view,
  tempList = [],
  actioncolumn: actioncolumnFromProps,
  detailBtnGroupsJson,
  detailFlatBtnOrderJson,
  listBtnGroupsJson,
  listFlatBtnOrderJson,
}) {
  const actioncolumn =
    actioncolumnFromProps ||
    (_.get(view, 'advancedSetting.actioncolumn') ? safeParse(_.get(view, 'advancedSetting.actioncolumn')) : []);
  const selectedKeys = actioncolumn.map(getActionColumnKey);
  const customActionOptions = actionColumnOptionsFromLayouts(btnList, [
    {
      flatBtnOrderJson: detailFlatBtnOrderJson,
      groupRaw: detailBtnGroupsJson,
      source: 'detail',
      sourceText: _l('详情分组'),
    },
    {
      flatBtnOrderJson: listFlatBtnOrderJson,
      groupRaw: listBtnGroupsJson,
      source: 'list',
      sourceText: _l('批量分组'),
    },
  ]);
  const selectedBtnIds = actioncolumn.filter(o => o.type === 'btn').map(o => o.id);
  const selectedGroupBtnIds = _.flatMap(actioncolumn, o => {
    if (o.type !== 'group') {
      return [];
    }

    const group = customActionOptions.find(a => getActionColumnKey(a) === getActionColumnKey(o));

    return group ? group.btnIds : [];
  });
  const unavailableBtnIds = _.uniq([...selectedBtnIds, ...selectedGroupBtnIds]);

  const getBtns = () =>
    customActionOptions.filter(o => {
      if (selectedKeys.includes(getActionColumnKey(o))) {
        return false;
      }

      if (o.type === 'btn') {
        return !unavailableBtnIds.includes(o.id);
      }

      return true;
    });

  const getPrints = () => {
    const ids = actioncolumn.filter(o => o.type === 'print').map(o => o.id);

    return tempList.filter(o => !(ids || []).includes(o.id));
  };

  const getSys = () => SYS_BTN_LIST.filter(a => !(actioncolumn || []).find(o => o.type === a.key));

  let visibleGroupCount = 0;

  return (
    <div className="btnListBoxMain">
      <div className="btnListBox">
        <ul className="btnListUl">
          {BTN_LIST.map((o, n) => {
            const data = o.key === 'print' ? getPrints() : o.key === 'sys' ? getSys() : getBtns();
            if (data.length <= 0) return null;
            visibleGroupCount += 1;
            return (
              <React.Fragment key={o.key}>
                {n !== 0 && visibleGroupCount > 1 && (
                  <div
                    className="w100 mTop5 mBottom5"
                    style={{ borderTop: '1px solid var(--color-border-secondary)' }}
                  />
                )}
                <li className="textTertiary">{o.txt}</li>
                {_.map(data, (item, i) => {
                  const { name, status } = item;
                  const itemType = o.key === 'btn' ? item.type : o.key;
                  const isDisabled = itemType === 'btn' && status === 0;
                  return (
                    <Wrap
                      className="textPrimary overflow_ellipsis WordBreak btnList flexRow alignItemsCenter"
                      key={`${itemType}-${item.id || item.btnId || i}-btnList`}
                      onClick={() => {
                        onAdd({
                          id: itemType === 'btn' ? item.btnId || item.id : itemType === 'sys' ? item.key : item.id,
                          type: itemType === 'sys' ? item.key : itemType,
                          ...(itemType === 'group' ? { source: item.source, btnIds: item.btnIds } : {}),
                        });
                      }}
                    >
                      {renderIcon(item, itemType, isDisabled)}
                      <span className={cx('flex overflow_ellipsis', { textTertiary: isDisabled })}>
                        {o.key === 'sys' ? item.txt : name}
                        {isDisabled && <span className="mLeft5">{`[${_l('停用')}]`}</span>}
                      </span>
                      {itemType === 'group' && <span className="textTertiary">{_l('分组')}</span>}
                    </Wrap>
                  );
                })}
              </React.Fragment>
            );
          })}
          {visibleGroupCount <= 0 && <span className="textSecondary pAll10 LineHeight40">{_l('无可添加按钮')}</span>}
        </ul>
      </div>
    </div>
  );
}

export default ClickAway.wrap(RowBtnList);

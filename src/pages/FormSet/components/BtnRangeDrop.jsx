import React, { useMemo } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Radio } from 'ming-ui/antd-components';
import { getShowViews } from 'src/utils/services/worksheet/view';

const Wrap = styled.div`
  width: 320px;
  background: var(--color-background-card);
  box-shadow: var(--shadow-lg);
  border-radius: 3px 3px 3px 3px;
  .viewList {
    border-top: 1px solid var(--color-background-secondary);
    max-height: 300px;
    overflow: auto;
    .viewName {
      word-break: break-all;
    }
  }
  .pAll16 {
    padding: 16px;
  }
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
`;
const HeaderRange = styled.div`
  display: block;
  padding: 16px 24px;
  font-weight: bold;
  border-bottom: 1px solid var(--color-background-secondary);
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: var(--color-primary) !important;
  }
`;

// 切换数组中某个 id 的选中状态
const toggleId = (ids, id) => (ids.includes(id) ? ids.filter(o => o !== id) : [...ids, id]);

export default function BtnRangeDrop(props) {
  const { onClose, data, onChange, views } = props;
  const advancedSetting = _.get(data, 'advancedSetting') || {};
  const noBatch = ((data.writeObject === 2 || data.writeType === 2) && data.clickType === 3) || props.noBatch;

  const viewList = useMemo(() => getShowViews(views), [views]);
  const viewIds = useMemo(() => viewList.map(o => o.viewId), [viewList]);
  // 仅表视图、树形层级视图，支持批量
  const viewSheetIds = useMemo(
    () =>
      viewList
        .filter(o => o.viewType === 0 || (o.viewType === 2 && _.get(o, 'advancedSetting.hierarchyViewType') === '3'))
        .map(o => o.viewId),
    [viewList],
  );

  const detailviews = safeParse(advancedSetting.detailviews, 'array');
  const listviews = safeParse(advancedSetting.listviews, 'array');

  const isAllDt = viewIds.length > 0 && viewIds.every(o => detailviews.includes(o));
  const hsDt = viewIds.some(o => detailviews.includes(o));
  const isAllList = viewSheetIds.length > 0 && viewSheetIds.every(o => listviews.includes(o));
  const hsList = viewSheetIds.some(o => listviews.includes(o));

  const updateAdvancedSetting = patch => {
    onChange({
      ...data,
      advancedSetting: { ...advancedSetting, ...patch },
    });
  };

  return (
    <Wrap>
      <HeaderRange className="headerRange Font14 textPrimary">
        {_l('使用范围')}
        <Icon icon="close" className="Font18 textTertiary Hand" onClick={onClose} />
      </HeaderRange>
      <div className="pLeft16 pBottom16">
        <div className="mTop16">
          <Radio
            checked={data.isAllView === 1}
            onChange={() => {
              onChange({
                ...data,
                isAllView: 1,
                advancedSetting: _.omit(advancedSetting, ['detailviews', 'listviews']),
              });
            }}
            title={_l('所有记录')}
          >
            {_l('所有记录')}
          </Radio>
        </div>
        <div className="mTop16">
          <Radio
            checked={data.isAllView !== 1}
            onChange={() =>
              onChange({
                ...data,
                isAllView: 0,
              })
            }
            title={_l('应用于指定视图')}
          >
            {_l('应用于指定视图')}
          </Radio>
        </div>
      </div>
      <ul className="dropOptionTrigger">
        {data.isAllView !== 1 && (
          <div className="viewList">
            <div className="viewListLi pAll16">
              <div className="flexRow alignItemsCenter Bold">
                <span className="flex">{_l('视图')}</span>
                <span
                  className="flex Hand flexShrink0"
                  title={_l('记录详情')}
                  onClick={() => updateAdvancedSetting({ detailviews: JSON.stringify(isAllDt ? [] : viewIds) })}
                >
                  <Checkbox
                    className="viewInput TxtMiddle"
                    checked={isAllDt}
                    indeterminate={!isAllDt && hsDt}
                    size="small"
                  >
                    {_l('记录详情')}
                  </Checkbox>
                </span>
                {!noBatch ? (
                  <span
                    className="flex Hand flexShrink0"
                    title={_l('批量操作')}
                    onClick={() => updateAdvancedSetting({ listviews: JSON.stringify(isAllList ? [] : viewSheetIds) })}
                  >
                    <Checkbox
                      className="viewInput TxtMiddle"
                      checked={isAllList}
                      indeterminate={!isAllList && hsList}
                      size="small"
                    >
                      {_l('批量操作')}
                    </Checkbox>
                  </span>
                ) : (
                  <span className="flex"></span>
                )}
              </div>
              {viewList.map(it => {
                const isDt = detailviews.includes(it.viewId);
                const isList = listviews.includes(it.viewId);
                const isSheetView =
                  it.viewType === 0 || (it.viewType === 2 && _.get(it, 'advancedSetting.hierarchyViewType') === '3');

                return (
                  <div className="flexRow alignItemsCenter mTop10" key={it.viewId}>
                    <span className="flex viewName">{it.name}</span>
                    <span
                      className="flex Hand"
                      onClick={() =>
                        updateAdvancedSetting({ detailviews: JSON.stringify(toggleId(detailviews, it.viewId)) })
                      }
                    >
                      <Checkbox className="viewInput TxtMiddle" checked={isDt} size="small">
                        {null}
                      </Checkbox>
                    </span>
                    {isSheetView && !noBatch ? (
                      <span
                        className="flex Hand"
                        onClick={() =>
                          updateAdvancedSetting({ listviews: JSON.stringify(toggleId(listviews, it.viewId)) })
                        }
                      >
                        <Checkbox className="viewInput TxtMiddle" checked={isList} size="small">
                          {null}
                        </Checkbox>
                      </span>
                    ) : (
                      <span className="flex"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ul>
    </Wrap>
  );
}

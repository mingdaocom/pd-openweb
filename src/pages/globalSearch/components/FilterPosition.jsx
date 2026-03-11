import React, { Fragment, useEffect } from 'react';
import { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import smartSearchAjax from 'src/api/smartSearch';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { getCurrentProjectId } from '../utils';
import OrgSelect from './OrgSelect';

const FilterCountWrap = styled.span`
  padding: 0px 10px 0px 5px;
  color: var(--color-text-tertiary);
  background: var(--color-background-secondary);
  border-radius: 3px;
  font-weight: 600;
  font-size: 13px;
  font-family: FZLanTingHeiS-DemiBold, FZLanTingHeiS;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: var(--color-border-secondary);
  }
`;

const FilterDialog = styled(Dialog)`
  .orgSelect {
    width: fit-content;
  }
  .topCon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 9px;
  }
  .scrollCon {
    height: 390px;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid var(--color-border-secondary);
    .empty {
      color: var(--color-text-disabled);
      margin-top: 189px;
      text-align: center;
    }
  }
  .listTitle {
    padding: 16px 20px 10px 20px;
    font-size: 12px;
    color: var(--color-text-tertiary);
    font-weight: 600;
    line-height: 12px;
  }
  .listItem {
    display: flex;
    align-items: center;
    padding: 9px 14px 9px 20px;
    font-size: 13px;
    color: var(--color-text-title);
    .avatarCon {
      margin-right: 10px;
      width: 20px;
      height: 20px;
      border-radius: 18px;
      background: rgb(247, 247, 247);
      text-align: center;
      line-height: 20px;
      min-width: 20px;
      display: inline-block;
      svg {
        vertical-align: middle !important;
      }
    }
    .itemName {
      flex: 1;
    }
    .delete {
      visibility: hidden;
      cursor: pointer;
    }
  }
  .listItem:hover {
    background: var(--color-background-secondary);
    .delete {
      visibility: visible;
    }
  }
`;

export default function FilterPosition(props) {
  const { projectId, count, update = () => {}, className = '', onChangeCount = () => {} } = props;

  const [filterCount, setFilterCount] = useState(0);
  const [data, setData] = useState({
    app: [],
    table: [],
  });
  const [visible, setVisible] = useState(false);
  const [dialogProjectId, setDialogProjectId] = useState(projectId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDialogProjectId(projectId);
  }, [projectId]);

  useEffect(() => {
    visible && getFilterList();
  }, [dialogProjectId, visible]);

  useEffect(() => {
    if (count === undefined) return;
    setFilterCount(count);
  }, [count]);

  const getFilterList = () => {
    setLoading(true);
    smartSearchAjax.getFilters({ projectId: dialogProjectId }).then(res => {
      let result = _.groupBy(res, l => l.itemType);
      setLoading(false);
      setData({
        app: result[3] || [],
        table: result[0] || [],
      });
    });
  };

  const removeFilter = item => {
    const { itemId } = item;

    smartSearchAjax.removeFilter({ itemId }).then(res => {
      if (res) {
        alert(_l('成功'));
        getFilterList();
        const _count = filterCount - 1;
        if (projectId === dialogProjectId) {
          setFilterCount(_count);
          onChangeCount(_count);
          _count === 0 && setVisible(false);
          update();
        }
      } else alert(_l('失败'), 2);
    });
  };

  if (!filterCount) return null;

  return (
    <Fragment>
      <Tooltip title={_l('不搜索的位置')}>
        <FilterCountWrap className={`${className} filterCount`} onClick={() => setVisible(true)}>
          <Icon icon="a-search_off_black_24dp1" className="mRight10 Font18" />
          {filterCount}
        </FilterCountWrap>
      </Tooltip>
      <FilterDialog
        className="filterPositionDialog"
        width="580"
        visible={visible}
        title={<span className="Font17 Bold">{_l('不搜索的位置')}</span>}
        onCancel={() => {
          setVisible(false);
          setDialogProjectId(projectId);
        }}
        footer={null}
      >
        <div className="topCon">
          <OrgSelect
            currentProjectId={dialogProjectId || getCurrentProjectId()}
            needAll={false}
            onChange={projectId => setDialogProjectId(projectId)}
            filterFucntion={l =>
              getFeatureStatus(l.projectId, VersionProductType.globalSearch) === '1' && l.licenseType !== 2
            }
          />
          <span className="textTertiary">{_l('标记应用和工作表，不再搜索它们的记录')}</span>
        </div>
        <div className="scrollCon">
          {loading ? (
            <LoadDiv size="middle" />
          ) : (
            <Fragment>
              {data.app.length !== 0 || data.table.length !== 0 ? (
                <ScrollView>
                  {['app', 'table'].map(listKey => {
                    if (data[listKey].length === 0) return null;
                    const list = data[listKey];
                    return (
                      <Fragment>
                        <div className="listTitle">{listKey === 'app' ? _l('应用') : _l('工作表')}</div>
                        {list.map(item => (
                          <div className="listItem" key={`filterAppListItem-${item.itemId}`}>
                            <span
                              className="avatarCon"
                              style={{
                                background:
                                  listKey === 'app'
                                    ? item.color || 'var(--color-border-secondary)'
                                    : 'var(--color-border-secondary)',
                              }}
                            >
                              <SvgIcon
                                url={item.iconUrl}
                                fill={listKey === 'app' ? '#fff' : 'var(--color-text-secondary)'}
                                size={12}
                              />
                            </span>
                            <span className="itemName overflow_ellipsis">{item.name}</span>
                            {listKey !== 'app' && (
                              <span className="textTertiary overflow_ellipsis" style={{ maxWidth: 130 }}>
                                {item.appName || ''}
                              </span>
                            )}
                            <Icon
                              icon="clear"
                              className="delete Font14 textTertiary mLeft7"
                              onClick={() => removeFilter(item)}
                            />
                          </div>
                        ))}
                      </Fragment>
                    );
                  })}
                </ScrollView>
              ) : (
                <div className="empty">{_l('没有标记不搜索位置')}</div>
              )}
            </Fragment>
          )}
        </div>
      </FilterDialog>
    </Fragment>
  );
}

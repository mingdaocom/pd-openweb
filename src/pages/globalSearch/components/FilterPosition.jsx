import React, { Fragment, useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { Tooltip, Icon, Dialog, ScrollView, LoadDiv } from 'ming-ui';
import { getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import smartSearchAjax from 'src/api/smartSearch';
import SvgIcon from 'src/components/SvgIcon';
import OrgSelect from './OrgSelect';
import { getCurrentProjectId } from '../utils';

const FilterCountWrap = styled.span`
  padding: 0px 10px 0px 5px;
  color: #9e9e9e;
  background: #f5f5f5;
  border-radius: 3px;
  font-weight: 600;
  font-size: 13px;
  font-family: FZLanTingHeiS-DemiBold, FZLanTingHeiS;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: #eaeaea;
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
    border: 1px solid #eaeaea;
    .empty {
      color: #bdbdbd;
      margin-top: 189px;
      text-align: center;
    }
  }
  .listTitle {
    padding: 16px 20px 10px 20px;
    font-size: 12px;
    color: #9e9e9e;
    font-weight: 600;
    line-height: 12px;
  }
  .listItem {
    display: flex;
    align-items: center;
    padding: 9px 14px 9px 20px;
    font-size: 13px;
    color: #333;
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
    background: #f7f7f7;
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
      if (!!res) {
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
      <Tooltip text={_l('不搜索的位置')}>
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
            filterFucntion={l => getFeatureStatus(l.projectId, VersionProductType.globalSearch) === '1' && l.licenseType !== 2}
          />
          <span className="Gray_9e">{_l('标记应用和工作表，不再搜索它们的记录')}</span>
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
                                background: listKey === 'app' ? item.color || '#EDEDED' : '#EDEDED',
                              }}
                            >
                              <SvgIcon url={item.iconUrl} fill={listKey === 'app' ? '#fff' : '#757575'} size={12} />
                            </span>
                            <span className="itemName overflow_ellipsis">{item.name}</span>
                            {listKey !== 'app' && (<span className='Gray_9e overLimi_130 overflow_ellipsis'>{item.appName || ''}</span>)}
                            <Icon icon="clear" className="delete Font14 Gray_9d mLeft7" onClick={() => removeFilter(item)} />
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

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Icon, Tooltip, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import Pagination from 'worksheet/components/Pagination';
import ControlsDataTable from 'src/pages/worksheet/components/ControlsDataTable';
import emptyImg from './img/null.png';
import _ from 'lodash';

const Wrap = styled.div`
  .header {
    border-bottom: 1px solid #dddddd;
    padding: 16px 10px;
    background: #fff;
  }
`;
let ajaxPromise = null;
export default function PreviewData(props) {
  const { match = {} } = props;
  let { params } = match;
  const { id, name } = params;

  const [{ controls, loading, data, aggName, pageIndex, pageSize, worksheetId, count }, setState] = useSetState({
    controls: [],
    loading: false,
    data: [],
    aggName: name || _l('未命名聚合表'),
    pageIndex: 1,
    pageSize: 100,
    worksheetId: id,
    count: 0,
  });
  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    getData();
  }, [pageIndex, pageSize]);

  const getInfo = () => {
    if (!worksheetId) {
      setState({ loading: false });
      return;
    }
    sheetAjax
      .getWorksheetInfo(
        {
          worksheetId,
          getTemplate: true,
          getViews: true,
        },
        { fireImmediately: true },
      )
      .then(res => {
        setState({
          controls: _.get(res, 'template.controls').filter(o => !['rowid'].includes(o.controlId)),
          // aggName: res.name,
        });
        getCount();
        getData();
      });
  };

  const getCount = () => {
    if (!worksheetId) return;
    const fetchListParams = {
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      sortControls: [],
      notGetTotal: true,
      searchType: 1,
    };
    sheetAjax.getFilterRowsTotalNum(fetchListParams, { fireImmediately: true }).then(res => {
      setState({
        count: Number(res) || 0,
      });
    });
  };

  const getData = () => {
    if (!worksheetId) return;
    if (loading) return;
    if (ajaxPromise) ajaxPromise.abort();
    setState({
      loading: true,
    });
    const fetchListParams = {
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      sortControls: [],
      notGetTotal: true,
      searchType: 1,
      // keyWords: keyWords,
      // filterControls: filters,
    };
    ajaxPromise = sheetAjax.getFilterRows(fetchListParams, { fireImmediately: true });
    ajaxPromise.then(res => {
      setState({
        data: _.get(res, 'data'),
        pageIndex,
        loading: false,
      });
    });
  };

  const changePageIndex = index => {
    if (loading) {
      return;
    }
    setState({
      pageIndex: index,
    });
  };

  if (loading) {
    return <LoadDiv className="mTop100" />;
  }
  return (
    <Wrap className="h100 flexColumn">
      <div className="header flexRow alignItemsCenter">
        <div className="flex">
          <div className="Gray Font16 Bold">{aggName || _l('未命名聚合表')}</div>
        </div>
        {worksheetId && (
          <React.Fragment>
            <Tooltip popupPlacement="bottom" text={<span>{_l('刷新')}</span>}>
              <Icon
                icon="task-later"
                className="Gray_9e Font18 pointer mLeft10 mRight2 ThemeHoverColor3"
                onClick={() => {
                  changePageIndex(1);
                  getData();
                  getCount();
                }}
              />
            </Tooltip>
            <Pagination
              className="pagination"
              pageIndex={pageIndex}
              pageSize={pageSize}
              allCount={count}
              // maxCount={maxCount}
              changePageSize={(pageSize, pageIndex) => {
                setState({
                  pageSize,
                  pageIndex,
                });
              }}
              changePageIndex={changePageIndex}
              onPrev={() => {
                changePageIndex(pageIndex - 1);
              }}
              onNext={() => {
                changePageIndex(pageIndex + 1);
              }}
            />
          </React.Fragment>
        )}
      </div>
      {!worksheetId ? (
        <div className="flexColumn flex alignItemsCenter justifyContentCenter">
          <img src={emptyImg} height={130} />
          <div className="Gray_9e Font17 mTop24">{_l('暂无数据')}</div>
          <div className="Gray_9e Font14 mTop16">{_l('未完成数据源、字段的配置或预览结果')}</div>
        </div>
      ) : (
        <React.Fragment>
          <ControlsDataTable loading={loading} controls={controls} showIcon data={data} />
        </React.Fragment>
      )}
    </Wrap>
  );
}

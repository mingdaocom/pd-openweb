import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Icon, Tooltip, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import Pagination from 'worksheet/components/Pagination';
import ControlsDataTable from 'src/pages/worksheet/components/ControlsDataTable';
import emptyImg from './img/null.png';
import _ from 'lodash';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import SearchInput from 'worksheet/components/SearchInput';
import { FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { FlexCenter } from 'worksheet/components/Basics';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util.js';
import homeAppApi from 'api/homeApp';
import { canEditData, canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
import DocumentTitle from 'react-document-title';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const Wrap = styled.div`
  .header {
    border-bottom: 1px solid #dddddd;
    padding: 16px 10px;
    background: #fff;
  }
  .pagination {
    margin-top: -3px;
    .icon-arrow-left-border,
    .icon-arrow-right-border {
      font-size: 16px;
    }
  }
  .statusIcon {
    color: #e0e0e0;
    font-size: 84px;
  }
  .icon-task-later {
    margin-top: -2px;
  }
`;
const SelectedFilter = styled(FlexCenter)`
  display: inline-flex;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 29px;
  vertical-align: middle;
  color: #1e88e5;
  background-color: #e3f2fd;
  padding: 0 10px;
  .text {
    max-width: 160px;
  }
  .filterIcon {
    font-size: 18px;
    margin-right: 6px;
  }
  .closeIcon {
    font-size: 16px;
    margin-left: 6px;
    &:hover {
      color: #1565c0;
    }
  }
`;

let ajaxPromise = null;
export default function PreviewData(props) {
  const { match = {} } = props;
  let { params } = match;
  const { id } = params;
  const [
    {
      controls,
      loading,
      data,
      aggName,
      pageIndex,
      pageSize,
      worksheetId,
      count,
      filters,
      keyWords,
      filterVisible,
      projectId,
      appId,
      noRole,
      hasGet,
      sortControls,
    },
    setState,
  ] = useSetState({
    controls: [],
    loading: false,
    data: [],
    aggName: _l('未命名聚合表'),
    pageIndex: 1,
    pageSize: 100,
    worksheetId: id,
    count: 0,
    filters: [],
    keyWords: '',
    filterVisible: false,
    projectId: '',
    noRole: false,
    hasGet: false,
    sortControls: [],
  });
  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    hasGet && getCount();
  }, [keyWords, filters, sortControls]);

  useEffect(() => {
    hasGet && getData();
  }, [keyWords, pageIndex, pageSize, filters, sortControls]);

  const getAppInfo = appId => {
    return homeAppApi.getApp({
      appId,
    });
  };

  const getInfo = () => {
    if (!worksheetId) {
      setState({ loading: false, hasGet: true });
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
      .then(async res => {
        setState({
          aggName: res.name || _l('未命名聚合表'),
        });
        let data = {};
        try {
          data = await getAppInfo(res.appId);
        } catch (error) {}
        const hasAppResourceAuth = checkPermission(res.projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);
        const canView = hasAppResourceAuth || canEditData(data.permissionType) || canEditApp(data.permissionType);
        if (!canView) {
          setState({
            noRole: true,
            hasGet: true,
          });
          return;
        }
        !_.isUndefined(res.appTimeZone) && (window[`timeZone_${res.appId}`] = res.appTimeZone);
        setState({
          controls: _.get(res, 'template.controls')
            .sort((a, b) => {
              if (a.row === b.row) {
                return a.col - b.col;
              }
              return a.row - b.row;
            })
            .filter(o => ![...ALL_SYS, 'rowid'].includes(o.controlId) && o.controlName !== 'unique_pk_mdy0000'),
          projectId: res.projectId,
          appId: res.appId,
          hasGet: true,
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
      sortControls: sortControls,
      searchType: 1,
      keyWords: keyWords,
      filterControls: formatValuesOfOriginConditions(filters || []),
    };
    sheetAjax.getFilterRowsTotalNum(fetchListParams, { fireImmediately: true }).then(res => {
      setState({
        count: Number(res) || 0,
      });
    });
  };

  const getData = () => {
    if (!worksheetId) return;
    if (ajaxPromise) ajaxPromise.abort();
    setState({
      loading: true,
    });
    const fetchListParams = {
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      sortControls: sortControls,
      searchType: 1,
      keyWords: keyWords,
      filterControls: formatValuesOfOriginConditions(filters || []),
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

  const renderFilterDialog = () => {
    if (!filterVisible) {
      return '';
    }
    return (
      <FilterDialog
        // allowEmpty
        data={{}}
        overlayClosable={false}
        relationControls={(controls || []).map(o => {
          return { ...o, controlPermissions: '100' };
        })}
        title={'筛选'}
        fromCondition="subTotal" //只能设置指定时间，套用原有设置
        filters={filters}
        allControls={[]}
        globalSheetInfo={{
          projectId,
          appId, //兼容成员(外部门户) 的筛选
        }}
        onChange={({ filters }) => {
          setState({ filterVisible: false, filters, pageIndex: 1 });
        }}
        onClose={() => setState({ filterVisible: false })}
        hideSupport
        supportGroup
      />
    );
  };
  let filteredText;
  let countFilter = [];
  (filters || []).map(o => {
    if (!!o.isGroup) {
      countFilter = [...countFilter, ...o.groupFilters];
    } else {
      countFilter = [...countFilter, o];
    }
  });
  countFilter = countFilter.filter(o => !!o);
  if (countFilter.length > 0) {
    filteredText = _l('%0 项', countFilter.length);
  }

  if (!hasGet) {
    return <LoadDiv className="mTop100" />;
  }

  return (
    <Wrap className="h100 flexColumn">
      <DocumentTitle title={`${aggName || _l('未命名聚合表')} - ${_l('聚合表')}`} />
      <div className="header flexRow alignItemsCenter">
        <div className="flex">
          <div className="Gray Font16 Bold">{aggName || _l('未命名聚合表')}</div>
        </div>
        {worksheetId && !noRole && (
          <React.Fragment>
            <SearchInput
              className="queryInput"
              onOk={value => {
                setState({ keyWords: (value || '').trim(), pageIndex: 1 });
              }}
              onClear={() => {
                setState({ keyWords: '', pageIndex: 1 });
              }}
              keyWords={keyWords}
              triggerWhenBlurWithEmpty
            />
            <div className="">
              {!filteredText && (
                <span
                  data-tip={_l('筛选')}
                  className={``}
                  onClick={() => {
                    setState({
                      filterVisible: true,
                    });
                  }}
                >
                  <i className="icon icon-filter Gray_9e Hand Font18 ThemeHoverColor3"></i>
                </span>
              )}
              {filteredText && (
                <SelectedFilter
                  className="mLeft10"
                  onClick={() =>
                    setState({
                      filterVisible: true,
                    })
                  }
                >
                  <i className="icon icon-filter filterIcon"></i>
                  <span className="text ellipsis">{filteredText}</span>
                  <i
                    className="icon icon-close closeIcon"
                    onClick={e => {
                      e.stopPropagation();
                      setState({
                        filters: [],
                        pageIndex: 1,
                      });
                    }}
                  ></i>
                </SelectedFilter>
              )}
              {renderFilterDialog()}
            </div>
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
              changePageSize={(pageSize, pageIndex = 1) => {
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
      <React.Fragment>
        {!worksheetId && loading ? (
          <LoadDiv className="mTop100" />
        ) : (
          <React.Fragment>
            {!worksheetId || noRole ? (
              <div className="flexColumn flex alignItemsCenter justifyContentCenter">
                {noRole ? (
                  <span className="statusIcon Icon icon icon-task-folder-message" />
                ) : (
                  <img src={emptyImg} height={130} />
                )}
                <div className="Gray_9e Font17 mTop24">{noRole ? _l('无权限查看') : _l('暂无数据')}</div>
                {!noRole && <div className="Gray_9e Font14 mTop16">{_l('未完成数据源、字段的配置或预览结果')}</div>}
              </div>
            ) : (
              <div className="overflowHidden flex">
                <ControlsDataTable
                  sortControls={sortControls[0]}
                  sortByControl={sortControls => {
                    setState({
                      sortControls,
                    });
                  }}
                  loading={loading}
                  controls={controls}
                  showIcon
                  key={JSON.stringify(filters)}
                  data={data}
                  chatButton={false}
                  emptyText={
                    filters.length > 0 || !!keyWords
                      ? _l('没有符合条件的记录')
                      : _l('暂无数据或数据量较大时整合速度会有所减慢，请耐心等候')
                  }
                  enableRules={false}
                  lineNumberBegin={(pageIndex - 1) * pageSize}
                  showEmptyForResize={false}
                  canSort={!loading}
                />
              </div>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    </Wrap>
  );
}

import React from 'react';
import ReactDom from 'react-dom';
import WorksheetShareHeader from './header';
import sheetAjax from 'src/api/worksheet';
import preall from 'src/common/preall';
import api from 'src/api/homeApp';
import cx from 'classnames';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import LoadDiv from 'ming-ui/components/LoadDiv';
import WorksheetDetailShare from './worksheetDetailShare';
import WorksheetListShare from './worksheetListShare';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import Publicquery from './publicquery';
import './index.less';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { SHARE_TYPE, PAGESIZE } from './config';
import _ from 'lodash';
const iconColor = 'rgb(33, 150, 243)';

class WorksheetSahre extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      printId: '',
      projectId: '',
      loading: true,
      listLoading: true,
      error: false,
      activeIndex: -1,
      rowsList: [],
      controls: [],
      pageIndex: 1,
      pageSize: PAGESIZE,
      count: 0,
      errorMsg: '',
      step: 1,
      cardControls: [],
      viewSet: {}, //视频配置信息
      worksheetId: '',
      rowId: '',
      viewId: '',
      appId: '',
      controlId: '',
      dataTitle: '',
      shareId: '',
      rowDetail: [],
      rowDetailStep2: [], // 详情
      rowRelationRowsData: {
        cardControls: [],
        viewSet: {},
        pageIndex: 1,
        rowsList: [],
        count: 0,
        titleHeader: '',
        dataTitle: '',
      },
      exported: false,
      appName: '',
      iconColor,
      controlSort: {
        controlId: '',
        isAsc: 0,
      },
      isFormDetail: false,
      worksheetName: '',
      querydata: {}, //公开查询的筛选数据
      rowIds: [],
      controlsId: [],
      sheetSwitchPermit: [],
    };
    this.promiseShareInfo = null;
    this.promiseRowsData = null;
    this.promiseAppDetail = null;
    this.promiseRowRelationRows = null;
    this.promiseRowByID = null;
  }

  componentDidMount() {
    $('body,html').scrollTop(0);
    $('html').addClass('WorksheetSharePage');
    document.title = _l('加载中');
    let shareParam;
    if (location.pathname.indexOf('public/print') >= 0) {
      shareParam = location.pathname.match(/.*\/public\/print\/(.*)/)[1];
    } else if (location.pathname.indexOf('public/query') >= 0) {
      shareParam = location.pathname.match(/.*\/public\/query\/(.*)/)[1];
      this.setState({ step: SHARE_TYPE.PUBLICQUERYINPUT, isPublicquery: true });
    } else {
      shareParam = location.pathname.match(/.*\/worksheetshare\/(.*)/)[1];
    }
    const list = shareParam.split('&&');
    const id = list[0];
    let printId = '';
    let projectId = '';
    if (list.length > 1) {
      printId = list[1];
      projectId = list[2];
    }
    if (!this.state.loading) {
      this.setState({ loading: true });
    }
    this.setState({ shareId: id, printId, projectId }, () => {
      this.getShareInfo(id);
    });
  }

  componentWillUnmount() {
    $('html').removeClass('WorksheetSharePage');
    this.abortRequest(this.promiseShareInfo);
    this.abortRequest(this.promiseRowsData);
    this.abortRequest(this.promiseAppDetail);
    this.abortRequest(this.promiseRowRelationRows);
    this.abortRequest(this.promiseRowByID);
  }

  abortRequest = promiseFn => {
    if (promiseFn && promiseFn.state() === 'pending') {
      promiseFn.abort();
    }
  };

  getShareInfo = id => {
    const { isPublicquery } = this.state;
    this.abortRequest(this.promiseShareInfo);
    if (isPublicquery) {
      //公开查询
      this.promiseShareInfo = publicWorksheetAjax.getPublicQueryById({ queryId: id });
    } else {
      this.promiseShareInfo = sheetAjax.getShareInfoByShareId({
        shareId: id,
      });
    }
    this.promiseShareInfo.then(async (res = {}) => {
      const { appId = '', worksheetId = '' } = isPublicquery ? res.worksheet || {} : res.data;
      const { viewId = '', rowId = '', exported = false, shareAuthor } = isPublicquery ? res : res.data;
      shareAuthor && (window.shareAuthor = shareAuthor);
      if (location.pathname.indexOf('worksheetshare') >= 0) {
        if (rowId) {
          location.href = `/public/record/${id}`;
        } else {
          location.href = `/public/view/${id}`;
        }
        return;
      }
      let sheetSwitchPermit = await sheetAjax.getSwitchPermit({
        worksheetId: worksheetId,
      });
      this.setState(
        {
          appId,
          worksheetId,
          rowId,
          viewId,
          publicqueryRes: res,
          exported,
          sheetSwitchPermit,
        },
        () => {
          if (!viewId && !appId) {
            //分享链接关闭或数据不存在
            this.setState({
              loading: false,
              error: true,
            });
          } else {
            if (!isPublicquery) {
              this.loadSheet(1, id);
              this.getHeaderData(appId);
            } else {
              this.setState({
                loading: false,
              });
            }
          }
        },
      );
    });
  };
  //行记录详情数据 拼接value
  formatDetailControlsValue = (data, rowId, controls, isSingleRow) => {
    let controlsData = {};
    if (!isSingleRow) {
      if (!data || data.length <= 0 || !rowId || !controls) return;
      controlsData = _.map(controls, item => {
        item.value =
          _.filter(data, b => {
            return rowId === b.rowid;
          })[0][item.controlId] || '';
        return item;
      });
    } else {
      if (!data || data.length <= 0 || !controls) return;
      controlsData = _.map(controls, item => {
        item.value = data[0][item.controlId] || '';
        return item;
      });
    }
    return controlsData;
  };

  //根据showControls排序
  getSortAndVisible = (showControls, controls) => {
    let list = [];
    if (showControls.length > 0) {
      list = showControls.map(scid => _.find(controls, c => c.controlId === scid));
    } else {
      let sys = controls.filter(it => SYS.includes(it.controlId));
      let noSys = controls.filter(it => !SYS.includes(it.controlId));
      list = noSys.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1)).concat(sys);
    }
    list = list.filter(c => c && controlState(c).visible);
    if (!list.find(o => o.attribute === 1)) {
      list = list.concat({ ...controls.find(o => o.attribute === 1), noShowForShare: true });
    }
    return list;
  };
  //获取记录关联记录
  getRowRelationRowsData = (id, pageIndex) => {
    const { cardControls, rowRelationRowsData = {} } = this.state;
    const control = _.find(cardControls, { controlId: id });
    let filterControls;
    if (control && control.type === 51) {
      filterControls = getFilter({
        control: { ...control, ignoreFilterControl: true, recordId: this.state.rowId },
        formData: cardControls,
        filterKey: 'resultfilters',
      });
      if (!filterControls) {
        this.setState({
          loading: false,
          rowRelationRowsData: {
            ...rowRelationRowsData,
            rowsList: [],
            count: 0,
          },
        });
        return;
      }
    }
    let index = pageIndex ? pageIndex : 1;
    this.setState({
      controlId: id,
      listLoading: true,
    });
    if (index <= 1) {
      this.setState({
        loading: true,
        rowRelationRowsData: {
          ...rowRelationRowsData,
          rowsList: [],
          count: 0,
        },
      });
    }
    this.abortRequest(this.promiseRowRelationRows);
    //获取记录关联记录
    this.promiseRowRelationRows = sheetAjax.getRowRelationRows({
      appId: this.state.appId,
      worksheetId: this.state.worksheetId,
      rowId: this.state.rowId,
      controlId: id,
      pageIndex: index,
      pageSize: PAGESIZE,
      getWorksheet: true,
      shareId: this.state.shareId,
      filterControls: filterControls || [],
    });

    this.promiseRowRelationRows.then(data => {
      if (data.resultCode !== 1) {
        this.setState({
          error: true,
          listLoading: false,
        });
      } else {
        const { rowDetail = [], rowRelationRowsData = {} } = this.state;
        this.setState({
          error: false,
          pageIndex: index,
          rowRelationRowsData: {
            ...rowRelationRowsData,
            cardControls: data.template.controls.concat(SYSTEM_CONTROL),
            viewSet: rowDetail.find(o => o.controlId === id) || {},
            pageIndex: index,
            rowsList: index <= 1 ? data.data : rowRelationRowsData.rowsList.concat(data.data),
            count: data.count,
            projectId: data.worksheet.projectId,
          },
          loading: false,
          listLoading: false,
        });
      }
    });
  };

  getHeaderData = appId => {
    this.abortRequest(this.promiseAppDetail);
    this.promiseAppDetail = api.getApp({ appId }, { silent: true });
    this.promiseAppDetail.then(data => {
      this.setState({
        iconUrl: data.iconUrl,
        appName: data.name,
        iconColor: data.iconColor,
      });
    });
  };

  setRowId = rowId => {
    const getRowDetail = this.formatDetailControlsValue(
      this.state.rowsList,
      rowId,
      this.state.cardControls,
      this.state.isSingleRow,
    );
    this.setState({
      rowId: rowId,
      rowDetail: getRowDetail,
      rowDetailStep2: getRowDetail,
    });
  };

  //获取关联表记录详情
  getRowRelationRowDetailData = (worksheetId, rowId, viewId = '') => {
    const { loading, listLoading, cardControls = [], controlId = '' } = this.state;
    if (!loading || !listLoading) {
      this.setState({
        loading: true,
        listLoading: true,
      });
    }
    if (!viewId && !!controlId) {
      let cardControl = cardControls.find(it => it.controlId === controlId);
      viewId = !cardControl ? '' : cardControl.viewId;
    }
    this.abortRequest(this.promiseRowByID);
    this.promiseRowByID = sheetAjax.getRowByID({
      worksheetId: worksheetId, // 工作表id
      rowId: rowId, // 行id
      getType: location.pathname.indexOf('public/query') >= 0 ? 11 : 1, // 获取 = 1, 获取删除未读 = 2, 分享 = 3, 下载 = 4, 打印 = 5,公开查询  11
      viewId: viewId, // 视图Id
      appId: this.state.appId, // 应用Id
      getTemplate: true, // 是否获取模板
      shareId: this.state.shareId, // 分享页获取关联记录iD
    });
    this.promiseRowByID.then(data => {
      this.setState({
        listLoading: false,
        rowDetail: data.receiveControls,
        loading: false,
        relationRowDetailResultCode: data.resultCode,
        nextWorksheetId: worksheetId,
        nextRowId: rowId,
        nextViewId: viewId,
      });
    });
  };

  setStep = (n, titleHeader, isFormDetail) => {
    const { rowRelationRowsData } = this.state;
    const data = {
      step: n,
      isFormDetail: !!isFormDetail,
      pageIndex: 1,
      controlSort: {
        controlId: '',
        isAsc: 0,
      },
      rowDetail: n <= 2 ? this.state.rowDetailStep2 : this.state.rowDetail,
    };

    // 设置关联记录字段标题
    if (titleHeader) rowRelationRowsData.titleHeader = titleHeader;
    this.setState({
      ...data,
      rowRelationRowsData,
    });
  };

  loadSheet = (pageIndex, id, querydata = {}) => {
    const {
      listLoading,
      pageSize,
      controlSort,
      step,
      printId,
      projectId,
      rowId,
      viewId,
      appId,
      worksheetId,
      isPublicquery,
    } = this.state;
    this.setState({ listLoading: true });
    this.abortRequest(this.promiseRowsData);
    if (!printId) {
      if (location.pathname.indexOf('public/query') >= 0) {
        this.promiseRowsData = publicWorksheetAjax.query({
          worksheetId, // 工作表id
          getType: 1,
          pageSize: 100000, //公开查询不分页
          pageIndex: 1,
          viewId,
          filterControls: querydata.controls,
          ticket: querydata.ticket,
          randStr: querydata.randStr,
          captchaType: querydata.captchaType,
          isGetWorksheet: true,
          clientId: sessionStorage.getItem(`query_${id}`),
          // sortControls: controlSort,//不排序
        });
      } else {
        this.promiseRowsData = sheetAjax.getRowsDataByShareId({
          shareId: id,
          getType: 1,
          pageSize: SHARE_TYPE.WORKSHEET === step ? pageSize : 100000,
          pageIndex,
          sortId: controlSort.controlId,
          isAsc: controlSort.isAsc === 1,
        });
      }
    } else {
      const sheetArgs = {
        id: printId,
        projectId,
        worksheetId,
        rowId,
        pageIndex,
        pageSize: 10000,
        getType: 1,
        viewId,
        appId, // 应用Id
      };
      this.promiseRowsData = sheetAjax.getPrint(sheetArgs);
    }
    this.promiseRowsData.then(data => {
      let { resultCode, clientId } = data || {};
      this.setState({
        pageIndex,
      });
      if (!printId) {
        if (resultCode !== 1 && !isPublicquery) {
          this.setState({
            listLoading: false,
            error: true,
            loading: false,
            relationRowDetailResultCode: resultCode,
          });
        } else {
          if (isPublicquery) {
            if (resultCode === 14) {
              //需要重新验证
              this.setState(
                {
                  step: SHARE_TYPE.PUBLICQUERYINPUT,
                  loading: false,
                  querydata: querydata,
                },
                () => {
                  sessionStorage.getItem(`query_${id}`) && sessionStorage.removeItem(`query_${id}`);
                  this.child.onSearch(querydata.controls);
                },
              );
              return;
            } else {
              this.setState({
                querydata: {},
              });
            }
            if (resultCode === 4) {
              //无数据
              this.setState({
                listLoading: false,
                error: false,
                loading: false,
                step: SHARE_TYPE.WORKSHEET,
                rowsList: [],
              });
              return;
            }
            if (resultCode === 8) {
              //查询已关闭 visibleType: 1,
              this.setState({
                listLoading: false,
                loading: false,
                step: SHARE_TYPE.PUBLICQUERYINPUT,
                rowsList: [],
                publicqueryRes: {
                  visibleType: 1,
                },
              });
              return;
            }
          }
          if (resultCode === 7) {
            this.setState({
              listLoading: false,
              error: true,
              loading: false,
              errorMsg: _l('暂无权限查看'),
            });
            return;
          }
          if (isPublicquery) {
            //有效期内
            clientId && sessionStorage.setItem(`query_${id}`, clientId);
          }
          this.setState(
            {
              error: false,
            },
            () => {
              let { template = [] } = data;
              let { controls = [] } = template;
              const getRowDetail = this.formatDetailControlsValue(data.data, '', controls, data.isSingleRow);
              controls = controls.filter(o => !SYS.includes(o.controlId));
              let sys = controls.filter(o => SYS.includes(o.controlId));
              this.setState({
                listLoading: false,
                isSingleRow: data.isSingleRow,
                step: data.isSingleRow ? SHARE_TYPE.WORKSHEETDETAIL : this.state.step,
                cardControls: controls.concat(sys.length > 0 ? sys : SYSTEM_CONTROL),
                viewSet: data.worksheet.views[0],
                pageIndex,
                rowsList: pageIndex > 1 ? this.state.rowsList.concat(data.data) : data.data,
                count: data.count,
                loading: false,
                viewName: data.worksheet.views[0].name,
                rowDetail: getRowDetail,
                rowDetailStep2: getRowDetail,
                relationRowDetailResultCode: resultCode,
                worksheetName: data.worksheet.name,
                dataTitle: controls.find(o => o.attribute == '1').controlName || '',
                rowIds: _.get(data, ['data']).map(item => item.rowid),
                controlsId: _.get(data, ['template', 'controls']).map(item => item.controlId),
              });
            },
          );
        }
      } else {
        if (resultCode === 4) {
          this.setState({
            loading: false,
            error: true,
            listLoading: false,
            relationRowDetailResultCode: resultCode,
          });
        } else {
          let list = data.receiveControls.filter(it => it.checked || it.attribute === 1);
          this.setState({
            error: false,
            listLoading: false,
            isSingleRow: true,
            step: SHARE_TYPE.WORKSHEETDETAIL,
            cardControls: list,
            viewSet: data.views[0] || {},
            pageIndex,
            rowsList: list,
            count: 0,
            loading: false,
            worksheetName: data.formName,
            rowDetail: list,
            rowDetailStep2: list,
            printData: data,
            relationRowDetailResultCode: resultCode,
          });
        }
      }
    });
  };

  sortList = sortId => {
    const { controlId, isAsc } = this.state.controlSort;
    const isAscN = sortId === controlId ? (isAsc + 1) % 3 : 1;
    this.setState(
      {
        controlSort: {
          ...this.state.controlSort,
          controlId: isAscN === 0 ? '' : sortId,
          isAsc: isAscN,
        },
      },
      () => {
        if (this.state.step === SHARE_TYPE.WORKSHEETDNEXT) {
          this.getRowRelationRowsData(isAscN === 0 ? '' : sortId);
        } else {
          this.loadSheet(1, this.state.shareId);
        }
      },
    );
  };

  render() {
    const {
      printId,
      step,
      loading,
      error,
      errorMsg,
      isSingleRow,
      iconColor,
      iconUrl,
      rowRelationRowsData,
      count,
      worksheetId,
      rowId,
      viewId,
      nextWorksheetId,
      nextRowId,
      nextViewId,
      appId,
      appName,
      listLoading,
      cardControls,
      rowsList,
      shareId,
      controlSort,
      getShareInfo,
      isFormDetail,
      printData,
      relationRowDetailResultCode,
      pageIndex,
      pageSize,
      worksheetName,
      viewName,
      publicqueryRes,
      isPublicquery,
      viewSet,
      controlId,
      exported,
      projectId,
      dataTitle,
      rowIds,
      controlsId,
      querydata = {},
      sheetSwitchPermit = [],
    } = this.state;
    let { rowDetail } = this.state;
    const isListDetail = step === SHARE_TYPE.WORKSHEETDETAIL || step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL;
    if (loading) {
      return (
        <div className="centerLoad" style={{ height: window.innerHeight }}>
          <LoadDiv />
        </div>
      );
    }
    if (SHARE_TYPE.PUBLICQUERYINPUT === step) {
      return (
        <Publicquery
          publicqueryRes={publicqueryRes}
          onRef={ref => {
            this.child = ref;
          }}
          querydata={querydata}
          shareId={shareId}
          searchFn={querydata => {
            this.setState(
              {
                step: SHARE_TYPE.WORKSHEET,
                loading: true,
                querydata,
              },
              () => {
                this.loadSheet(1, shareId, querydata);
              },
            );
          }}
        />
      );
    }
    if (error) {
      return (
        <div className="error">
          <div
            className="unnormalCon card Relative"
            style={{
              height: document.documentElement.clientWidth <= 600 ? window.innerHeight : window.innerHeight - 64,
              paddingTop: window.innerHeight / 3,
            }}
          >
            <div
              className="Absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="unnormalIcon"></div>
              <div className="msg">
                {errorMsg ? errorMsg : printId ? _l('该链接已失效') : _l('分享链接关闭或数据不存在')}
              </div>
            </div>
          </div>
        </div>
      );
    }
    let titleControl;
    if (rowDetail) {
      titleControl = _.find(printId ? printData.receiveControls || [] : rowDetail, item => {
        return item.attribute === 1;
      });
    }
    const nameList = {
      worksheetName,
      viewName,
      appName,
      titleName: titleControl ? renderCellText(titleControl) : _l('未命名'),
      relationRowsName: step === SHARE_TYPE.WORKSHEET ? '' : rowRelationRowsData.titleHeader,
    };
    return (
      <React.Fragment>
        {(!isSingleRow ||
          (isSingleRow && step === SHARE_TYPE.WORKSHEETDNEXT) ||
          (isPublicquery && step !== SHARE_TYPE.PUBLICQUERYINPUT) ||
          step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL) && (
          <WorksheetShareHeader
            isSingleRow={isSingleRow}
            iconColor={iconColor}
            iconUrl={iconUrl}
            count={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.count : count}
            setStep={this.setStep}
            step={step}
            shareId={shareId}
            getShareInfo={getShareInfo}
            isFormDetail={isFormDetail}
            {...nameList}
            isPublicquery={isPublicquery}
            publicqueryRes={publicqueryRes}
            exported={exported && rowIds.length > 0}
            viewId={viewId}
            worksheetId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextWorksheetId : worksheetId}
            appId={appId}
            projectId={projectId}
            rowIds={rowIds}
            controlsId={controlsId}
            pageIndex={pageIndex}
            pageSize={pageSize}
            filterControls={querydata.controls}
            relationRowsName={rowRelationRowsData.titleHeader}
          />
        )}
        <div
          className={cx('shareConBox', {
            detailBoxCon: isListDetail,
            noMargin: isSingleRow && step === SHARE_TYPE.WORKSHEETDETAIL,
          })}
        >
          {isListDetail ? (
            <WorksheetDetailShare
              sheetSwitchPermit={sheetSwitchPermit}
              relationRowDetailResultCode={relationRowDetailResultCode}
              printId={printId}
              worksheetId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextWorksheetId : worksheetId}
              rowId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextRowId : rowId}
              viewId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextViewId : viewId}
              viewIdForPermit={viewId} //功能开关权限根据主记录来走
              appId={appId}
              setStep={this.setStep}
              step={step}
              isSingleRow={isSingleRow}
              getShareInfo={(id, titleHeader) => {
                //打印的分享
                if (printId) {
                  let list = printData.receiveControls.filter(
                    control => (control.type === 29 && control.enumDefault === 2) || control.type === 34,
                  ); // 关联表/子表
                  let cardControls = [];
                  let key = 0;
                  list.map((it, i) => {
                    if (it.controlId === id) {
                      cardControls = it.relationControls
                        .concat(SYSTEM_CONTROL)
                        .filter(o => o.checked || o.attribute === 1);
                      key = i;
                    }
                  });
                  let data = printData.relations[key];
                  cardControls = cardControls.map(o => {
                    return { ...o, relationControls: data.template.controls };
                  });
                  const dataTitle = cardControls.find(control => control.attribute == '1');
                  this.setState({
                    controlId: id,
                    rowRelationRowsData: {
                      ...this.state.rowRelationRowsData,
                      cardControls,
                      viewSet: data.worksheet.views[0],
                      pageIndex: 1,
                      rowsList: data.data, // rowRelationRowsData.rowsList.concat(data.data),
                      count: data.count,
                      projectId: data.worksheet.projectId,
                      titleHeader,
                      dataTitle: dataTitle.controlName || '',
                    },
                    loading: false,
                    listLoading: false,
                  });
                } else {
                  this.getRowRelationRowsData(id);
                }
              }}
              {...nameList}
              viewSet={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? rowRelationRowsData.viewSet : viewSet}
              rowDetail={rowDetail}
              loading={listLoading}
              getRowRelationRowDetailData={this.getRowRelationRowDetailData}
            />
          ) : (
            <WorksheetListShare
              sheetSwitchPermit={sheetSwitchPermit}
              viewIdForPermit={viewId}
              printId={printId}
              cardControls={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.cardControls : cardControls}
              viewSet={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.viewSet : viewSet}
              rowsList={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.rowsList : rowsList}
              setStep={this.setStep}
              step={step}
              count={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.count : count}
              shareId={shareId}
              setRowId={this.setRowId}
              sortList={this.sortList}
              controlSort={step === SHARE_TYPE.WORKSHEETDNEXT ? null : controlSort}
              loading={listLoading}
              getRowRelationRowDetailData={this.getRowRelationRowDetailData}
              loadSheet={pageIndex => {
                SHARE_TYPE.WORKSHEET === step
                  ? this.loadSheet(pageIndex, shareId)
                  : this.getRowRelationRowsData(controlId, pageIndex);
              }}
              pageIndex={pageIndex}
              pageSize={pageSize}
              {...nameList}
              isPublicquery={isPublicquery}
              dataTitle={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.dataTitle : dataTitle}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

const Comp = preall(WorksheetSahre, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));

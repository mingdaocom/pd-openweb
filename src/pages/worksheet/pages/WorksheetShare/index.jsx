import React from 'react';
import ReactDom from 'react-dom';
import WorksheetShareHeader from './header';
import sheetAjax from 'src/api/worksheet';
import preall from 'src/common/preall';
import api from 'api/homeApp';
import cx from 'classnames';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { renderCellText } from 'worksheet/components/CellControls';
import LoadDiv from 'ming-ui/components/LoadDiv';
import WorksheetDetailShare from './worksheetDetailShare';
import WorksheetListShare from './worksheetListShare';
import { getPublicQueryById, query } from 'src/api/publicWorksheet';
import Publicquery from './publicquery';
import './index.less';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { SHARE_TYPE, PAGESIZE } from './config';
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
      },
      appName: '',
      iconColor,
      controlSort: {
        controlId: '',
        isAsc: 0,
      },
      isFormDetail: false,
      worksheetName: '',
      querydata: null, //公开查询的筛选数据
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
    if (location.pathname.indexOf('printshare') >= 0) {
      shareParam = location.pathname.match(/.*\/printshare\/(.*)/)[1];
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
      this.promiseShareInfo = getPublicQueryById({ queryId: id });
    } else {
      this.promiseShareInfo = sheetAjax.getShareInfoByShareId({
        shareId: id,
      });
    }
    this.promiseShareInfo.then(res => {
      const { appId = '', worksheetId = '' } = isPublicquery ? res.worksheet || {} : res;
      const { viewId = '', rowId = '' } = res;
      this.setState(
        {
          appId,
          worksheetId,
          rowId,
          viewId,
          publicqueryRes: res,
        },
        () => {
          if (!isPublicquery) {
            this.loadSheet(1, id);
            this.getHeaderData(appId);
          } else {
            this.setState({
              loading: false,
            });
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
  getRowRelationRowsData = id => {
    const { loading, pageSize, rowRelationRowsData, listLoading } = this.state;
    this.setState({
      controlId: id,
    });
    if (!loading || !listLoading) {
      this.setState({
        loading: true,
        listLoading: true,
      });
    }
    this.abortRequest(this.promiseRowRelationRows);
    //获取记录关联记录
    this.promiseRowRelationRows = sheetAjax.getRowRelationRows({
      appId: this.state.appId,
      worksheetId: this.state.worksheetId,
      rowId: this.state.rowId,
      controlId: id,
      pageIndex: rowRelationRowsData.pageIndex,
      pageSize: 10000,
      getWorksheet: true,
      shareId: this.state.shareId,
    });

    this.promiseRowRelationRows.then(data => {
      if (data.resultCode !== 1) {
        this.setState({
          loading: false,
          error: true,
          listLoading: false,
        });
      } else {
        const { rowDetail = [] } = this.state;
        this.setState({
          error: false,
          rowRelationRowsData: {
            ...this.state.rowRelationRowsData,
            cardControls: data.template.controls.concat(SYSTEM_CONTROL),
            viewSet: rowDetail.find(o => o.controlId === id) || {},
            pageIndex: 1,
            rowsList: data.data, // rowRelationRowsData.rowsList.concat(data.data),
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
    this.promiseAppDetail = api.getAppDetail({ appId }, { silent: true });
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
      // rowRelationRowsData: this.state.rowRelationRowsData,
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
    const data = {
      step: n,
      isFormDetail: !!isFormDetail,
      controlSort: {
        controlId: '',
        isAsc: 0,
      },
      rowDetail: n <= 2 ? this.state.rowDetailStep2 : this.state.rowDetail,
    };
    if (!titleHeader) {
      this.setState({
        ...data,
      });
    } else {
      this.setState({
        ...data,
        rowRelationRowsData: {
          ...this.state.rowRelationRowsData,
          titleHeader: titleHeader,
        },
      });
    }
  };

  loadSheet = (pageIndex, id, querydata) => {
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
        this.promiseRowsData = query({
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
      this.setState({
        pageIndex,
      });
      if (!printId) {
        if (data.resultCode !== 1 && !isPublicquery) {
          this.setState({
            listLoading: false,
            error: true,
            loading: false,
            relationRowDetailResultCode: data.resultCode,
          });
        } else {
          if (data.resultCode === 14 && isPublicquery) {
            //验证码错误
            this.setState({
              listLoading: false,
              error: false,
              loading: false,
              step: SHARE_TYPE.PUBLICQUERYINPUT,
            });
            alert(_l('验证码错误'));
            return;
          }
          if (data.resultCode === 4 && isPublicquery) {
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
          if (data.resultCode === 7) {
            this.setState({
              listLoading: false,
              error: true,
              loading: false,
              errorMsg: _l('暂无权限查看'),
            });
            return;
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
                relationRowDetailResultCode: data.resultCode,
                worksheetName: data.worksheet.name,
              });
            },
          );
        }
      } else {
        if (data.resultCode === 4) {
          this.setState({
            loading: false,
            error: true,
            listLoading: false,
            relationRowDetailResultCode: data.resultCode,
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
            relationRowDetailResultCode: data.resultCode,
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
      worksheetName,
      viewName,
      publicqueryRes,
      isPublicquery,
      viewSet,
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
                {errorMsg ? errorMsg : printId ? _l('该链接已失效') : _l('视图已删除或链接已失效')}
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
              relationRowDetailResultCode={relationRowDetailResultCode}
              printId={printId}
              worksheetId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextWorksheetId : worksheetId}
              rowId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextRowId : rowId}
              viewId={step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL ? nextViewId : viewId}
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
              printId={printId}
              cardControls={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.cardControls : cardControls}
              viewSet={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.viewSet : viewSet}
              rowsList={step === SHARE_TYPE.WORKSHEETDNEXT ? rowRelationRowsData.rowsList : rowsList}
              setStep={this.setStep}
              step={step}
              count={count}
              shareId={shareId}
              setRowId={this.setRowId}
              sortList={this.sortList}
              controlSort={step === SHARE_TYPE.WORKSHEETDNEXT ? null : controlSort}
              loading={listLoading}
              getRowRelationRowDetailData={this.getRowRelationRowDetailData}
              loadSheet={pageIndex => {
                this.loadSheet(pageIndex, shareId);
              }}
              pageIndex={this.state.pageIndex}
              pageSize={this.state.pageSize}
              {...nameList}
              isPublicquery={isPublicquery}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

const Comp = preall(WorksheetSahre, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));

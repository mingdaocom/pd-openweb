import React from 'react';
import ReactDom from 'react-dom';
import WorksheetShareHeader from './header';
import sheetAjax from 'src/api/worksheet';
import preall from 'src/common/preall';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import LoadDiv from 'ming-ui/components/LoadDiv';
import WorksheetListShare from './worksheetListShare';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import PublicQuery from './publicquery';
import './index.less';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';

class WorksheetSahre extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: '',
      loading: true,
      error: false,
      rowsList: [],
      controls: [],
      pageSize: 50,
      errorMsg: '',
      isSearch: true,
      cardControls: [],
      viewSet: {}, //视图配置信息
      worksheetId: '',
      rowId: '',
      viewId: '',
      appId: '',
      dataTitle: '',
      shareId: location.pathname.match(/.*\/public\/query\/(.*)/)[1].split('&&')[0],
      exported: false,
      worksheetName: '',
      querydata: {}, //公开查询的筛选数据
      rowIds: [],
      controlsId: [],
      sheetSwitchPermit: [],
    };
  }

  componentDidMount() {
    $('html').addClass('WorksheetSharePage');
    this.getShareInfo(this.state.shareId);
  }

  getShareInfo = id => {
    publicWorksheetAjax.getPublicQueryById({ queryId: id }).then(async (res = {}) => {
      const { appId = '', worksheetId = '', projectId } = res.worksheet || {};
      const { viewId = '', rowId = '', exported = false, shareAuthor, clientId } = res;
      shareAuthor && (window.shareAuthor = shareAuthor);
      clientId && (window.clientId = clientId);

      preall({ type: 'function' }, { allownotlogin: true, requestParams: { projectId } });

      shareAuthor && (window.shareAuthor = shareAuthor);
      localStorage.setItem('currentProjectId', projectId);

      let sheetSwitchPermit = await sheetAjax.getSwitchPermit({ worksheetId: worksheetId });

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
          this.setState({ loading: false, error: !viewId && !appId });
        },
      );
    });
  };

  loadSheet = (querydata = {}) => {
    const { viewId, worksheetId } = this.state;

    if (this.promiseRowsData) {
      this.promiseRowsData.abort();
    }

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
    });

    this.promiseRowsData.then(data => {
      let { resultCode } = data || {};
      if (resultCode === 14) {
        //需要重新验证
        this.setState(
          {
            isSearch: true,
            loading: false,
            querydata: querydata,
          },
          () => {
            this.child.onSearch(querydata.controls);
          },
        );
        return;
      } else {
        this.setState({ querydata: {} });
      }

      if (resultCode === 4) {
        //无数据
        this.setState({ error: false, loading: false, isSearch: false, rowsList: [] });
        return;
      }

      if (resultCode === 8) {
        //查询已关闭 visibleType: 1,
        this.setState({ loading: false, isSearch: true, rowsList: [], publicqueryRes: { visibleType: 1 } });
        return;
      }

      if (resultCode === 7) {
        this.setState({ error: true, loading: false, errorMsg: _l('暂无权限查看') });
        return;
      }

      let { template = [] } = data;
      let { controls = [] } = template;
      controls = controls.filter(o => !SYS.includes(o.controlId));
      let sys = controls.filter(o => SYS.includes(o.controlId));
      const viewSet = data.worksheet.views.find(o => o.viewId === viewId);

      this.setState({
        error: false,
        isSingleRow: data.isSingleRow,
        isSearch: false,
        cardControls: controls.concat(sys.length > 0 ? sys : SYSTEM_CONTROL),
        viewSet,
        rowsList: data.data,
        count: data.count,
        loading: false,
        viewName: viewSet.name,
        relationRowDetailResultCode: resultCode,
        worksheetName: data.worksheet.name,
        widgetStyle: _.get(data, 'worksheet.advancedSetting'),
        dataTitle: controls.find(o => o.attribute == '1').controlName || '',
        rowIds: _.get(data, ['data']).map(item => item.rowid),
        controlsId: _.get(data, ['template', 'controls'])
          .filter(l => ![49, 50].includes(l.type))
          .map(item => item.controlId),
      });
    });
  };

  render() {
    const {
      isSearch,
      loading,
      error,
      errorMsg,
      worksheetId,
      viewId,
      appId,
      cardControls,
      rowsList,
      shareId,
      pageSize,
      worksheetName,
      viewName,
      publicqueryRes,
      viewSet,
      exported,
      projectId,
      dataTitle,
      rowIds,
      controlsId,
      querydata = {},
      sheetSwitchPermit = [],
    } = this.state;

    if (loading) {
      return (
        <div className="centerLoad" style={{ height: window.innerHeight }}>
          <LoadDiv />
        </div>
      );
    }

    if (isSearch) {
      return (
        <PublicQuery
          publicqueryRes={publicqueryRes}
          onRef={ref => (this.child = ref)}
          querydata={querydata}
          searchFn={querydata => {
            this.setState(
              {
                isSearch: false,
                loading: true,
                querydata,
              },
              () => {
                this.loadSheet(querydata);
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
              <div className="msg">{errorMsg || _l('分享链接关闭或数据不存在')}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <WorksheetShareHeader
          switchSearch={() => this.setState({ isSearch: true })}
          shareId={shareId}
          publicqueryRes={publicqueryRes}
          exported={exported && rowIds.length > 0}
          viewId={viewId}
          worksheetId={worksheetId}
          appId={appId}
          projectId={projectId}
          rowIds={rowIds}
          controlsId={controlsId}
          pageSize={pageSize}
          filterControls={querydata.controls}
        />
        <div className="shareConBox">
          <WorksheetListShare
            sheetSwitchPermit={sheetSwitchPermit}
            viewIdForPermit={viewId}
            cardControls={cardControls}
            viewSet={viewSet}
            rowsList={rowsList}
            shareId={shareId}
            dataTitle={dataTitle}
            worksheetId={worksheetId}
            appId={appId}
            projectId={projectId}
            worksheetName={worksheetName}
            viewName={viewName}
          />
        </div>
      </React.Fragment>
    );
  }
}

ReactDom.render(<WorksheetSahre />, document.getElementById('app'));

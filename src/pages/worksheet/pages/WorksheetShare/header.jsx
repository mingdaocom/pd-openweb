import PropTypes from 'prop-types';
import React from 'react';
import { navigateTo } from 'router/navigateTo';
import { Icon } from 'ming-ui';
import color from 'color';
import mingdaoImg from './img/mingdao.png';
import SvgIcon from 'src/components/SvgIcon';
import { SHARE_TYPE } from './config';
import styled from 'styled-components';
import moment from 'moment';

const PublicqueryHeader = styled.div`
  width: 100%;
  height: 54px;
  overflow: hidden;
  .btn {
    margin-top: 9px;
    height: 36px;
    opacity: 1;
    background: #2196f3;
    border-radius: 3px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    line-height: 36px;
    width: 103px;
    vertical-align: top;
    float: right;
    &:hover {
      background: #2365c0;
    }
  }
  .download {
    float: right;
    width: 40px;
    font-size: 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
  }
`;
class WorksheetShareHeader extends React.Component {
  static propTypes = {
    iconUrl: PropTypes.string,
    relationRowsName: PropTypes.string,
    appName: PropTypes.string,
    iconColor: PropTypes.string,
    count: PropTypes.number,
    setStep: PropTypes.func,
    step: PropTypes.number,
    isSingleRow: PropTypes.bool,
    loading: PropTypes.bool,

    pageSize: PropTypes.number,
    pageIndex: PropTypes.number,
    filterControls: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 导出文件
   */
  exportExcel = () => {
    (async () => {
      const {
        publicqueryRes = {},

        appId,
        viewId,
        worksheetId,
        projectId,
        shareId,
        rowIds,
        controlsId,
        pageIndex,
        pageSize,
        filterControls
      } = this.props;

      const args = {
        accountId: md.global.Account.accountId,
        worksheetId,
        appId,
        viewId,
        projectId,
        exportControlsId: (controlsId || []).concat(['rowid']),
        filterControls: filterControls || [] ,
        columnRpts: null,
        keyWords: '',
        searchType: 1,
        rowIds: rowIds || [],
        systemColumn: [],
        isSort: true,
        fastFilters: [],
        navGroupFilters: [],
        queryId: shareId,
        pageIndex,
        pageSize,
      };
      const res = await fetch(`${md.global.Config.WorksheetDownUrl}/ExportExcel/Query`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        responseType: 'blob',
        body: JSON.stringify(args),
      }).then(res => res.blob());

      // 将响应转换成文件
      const blob = new Blob([res], {
        type: 'application/vnd.ms-excel',
      });

      // 设置文件名称
      const now = new Date();
      const date = moment(now).format('YYYYMMDDhhmmss');

      // 新建a标签下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${publicqueryRes.title}_${date}.xlsx`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })().catch(() => {});
  }

  render() {
    const {
      iconUrl,
      iconColor,
      relationRowsName,
      viewName,
      worksheetName,
      appName,
      step,
      count,
      isSingleRow,
      loading,
      isFormDetail,
      isPublicquery,
      publicqueryRes = {},

      exported = false,
    } = this.props;
    if (loading || step === SHARE_TYPE.DETAIL || (isSingleRow && step === SHARE_TYPE.WORKSHEETDETAIL)) {
      return '';
    }
    const listStr =
      SHARE_TYPE.WORKSHEET === step
        ? [viewName, worksheetName, appName]
        : [relationRowsName, viewName, worksheetName, appName];
    const str = listStr.filter(o => !!o).join('-');
    return (
      <div className="WorksheetShareHeaderBox">
        <div className="HeaderBox">
          {step === SHARE_TYPE.WORKSHEET &&
            (isPublicquery ? (
              <PublicqueryHeader>
                <span className="Font17">{publicqueryRes.title || _l('公开查询')}</span>
                <div
                  className={'btn'}
                  onClick={() => {
                    this.props.setStep(SHARE_TYPE.PUBLICQUERYINPUT);
                  }}
                >
                  {_l('继续查询')}
                </div>
                {exported && (
                  <div
                    className="download"
                    onClick={ () => this.exportExcel() }
                  >
                    <Icon style={{ float: 'right', lineHeight: '100%' }} icon="file_download"></Icon>
                  </div>
                )}
              </PublicqueryHeader>
            ) : (
              <React.Fragment>
                <div className="appIconWrap">
                  <span
                    className="appIconWrapIcon"
                    style={{
                      backgroundColor: color(iconColor),
                    }}
                  >
                    <SvgIcon url={iconUrl} fill="#fff" size={20} addClassName="mTop3" />
                  </span>
                  <div className="appName Gray Font17 overflow_ellipsis WordBreak">{str}</div>
                  <div className="listNum Font17 Gray_75 mLeft8">({count})</div>
                </div>
           
              </React.Fragment>
            ))}
          {(step === SHARE_TYPE.WORKSHEETDETAIL || step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL) && (
            <div
              className="Font17 Hand back"
              onClick={() => {
                this.props.setStep(isFormDetail ? SHARE_TYPE.WORKSHEETDETAIL : step - 1);
              }}
            >
              <Icon icon="backspace mRight8" />
              {_l('返回')}
            </div>
          )}
          {step === SHARE_TYPE.WORKSHEETDNEXT && (
            <div className="appIconWrap">
              <div
                className="Font17 Hand back"
                onClick={() => {
                  this.props.setStep(step - 1);
                }}
              >
                <Icon icon="backspace" className="backIcon" />
                <div className="appName Gray Font17 overflow_ellipsis WordBreak">{relationRowsName}</div>
                <div className="listNum Font17 Gray_75 mLeft8">({count})</div>
              </div>
            
            </div>
          )}
         
        </div>
      </div>
    );
  }
}

export default WorksheetShareHeader;

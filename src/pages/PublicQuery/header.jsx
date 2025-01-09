import PropTypes from 'prop-types';
import React from 'react';
import { Icon } from 'ming-ui';
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
    color: #151515;
  }
`;
class WorksheetShareHeader extends React.Component {
  static propTypes = {
    switchSearch: PropTypes.func,
    pageSize: PropTypes.number,
    filterControls: PropTypes.array,
  };

  /**
   * 导出文件
   */
  exportExcel = async () => {
    const {
      publicqueryRes = {},
      appId,
      viewId,
      worksheetId,
      projectId,
      shareId,
      rowIds,
      controlsId,
      pageSize,
      filterControls,
    } = this.props;

    const args = {
      accountId: md.global.Account.accountId,
      worksheetId,
      appId,
      viewId,
      projectId,
      exportControlsId: (controlsId || []).concat(['rowid']),
      filterControls: filterControls || [],
      columnRpts: null,
      keyWords: '',
      searchType: 1,
      rowIds: rowIds || [],
      systemColumn: [],
      isSort: true,
      fastFilters: [],
      navGroupFilters: [],
      queryId: shareId,
      pageIndex: 1,
      pageSize,
    };

    const res = await window.mdyAPI('', '', args, {
      ajaxOptions: {
        responseType: 'blob',
        url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/Query`,
      },
      customParseResponse: true,
    });

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
  };

  render() {
    const { publicqueryRes = {}, exported = false, switchSearch } = this.props;

    return (
      <div className="WorksheetShareHeaderBox">
        <div className="HeaderBox">
          <PublicqueryHeader>
            <span className="Font17">{publicqueryRes.title || _l('公开查询')}</span>
            <div className="btn" onClick={switchSearch}>
              {_l('继续查询')}
            </div>
            {exported && (
              <div className="download" onClick={() => this.exportExcel()}>
                <Icon
                  style={{ float: 'right', lineHeight: '100%' }}
                  className="Gray_9e ThemeHoverColor3 pointer"
                  icon="file_download"
                ></Icon>
              </div>
            )}
          </PublicqueryHeader>
        </div>
      </div>
    );
  }
}

export default WorksheetShareHeader;

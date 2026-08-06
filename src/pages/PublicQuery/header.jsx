import React from 'react';
import { saveAs } from 'file-saver';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import { browserIsMobile } from 'src/utils/common';

const PublicqueryHeader = styled.div`
  width: 100%;
  height: 54px;
  overflow: hidden;
  display: flex;
  align-items: center;
  .btn {
    height: 36px;
    opacity: 1;
    background: var(--color-primary);
    border-radius: 3px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-white);
    line-height: 36px;
    width: 103px;
    &:hover {
      background: var(--color-link-hover);
    }
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

    // 下载文件
    saveAs(blob, `${publicqueryRes.title}_${date}.xlsx`);
  };

  render() {
    const { publicqueryRes = {}, exported = false, switchSearch, appId, projectId } = this.props;

    return (
      <div className="WorksheetShareHeaderBox">
        <div className="HeaderBox">
          <PublicqueryHeader>
            <span className="Font17 flex ellipsis">{publicqueryRes.title || _l('公开查询')}</span>
            <PublicAppLangDropdown className="mRight12" appId={appId} projectId={projectId} />
            {exported && !browserIsMobile() && (
              <Icon
                onClick={() => this.exportExcel()}
                className="Font20 textTertiary hoverColorPrimary pointer mRight16"
                icon="worksheet_export"
              />
            )}
            <div className="btn" onClick={switchSearch}>
              {_l('继续查询')}
            </div>
          </PublicqueryHeader>
        </div>
      </div>
    );
  }
}

export default WorksheetShareHeader;

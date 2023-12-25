import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { LoadDiv, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import _ from 'lodash';
import DocumentTitle from 'react-document-title';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { RecordInfoModal } from 'mobile/Record';
import 'mobile/index.less';
import { browserIsMobile } from 'src/util';

const Header = ({ data, callback, onSubmit }) => {
  return (
    <div className="flexRow flex alignItemsCenter">
      <div className="flex" />
      {data.linkState !== 2 && (
        <div className="worksheetRowEditSave ellipsis" onClick={() => onSubmit({ callback })}>
          {data.submitBtnName || _l('提交')}
        </div>
      )}
    </div>
  );
};

class WorksheetRowEdit extends Component {
  state = {
    loading: true,
    isError: false,
    data: {},
  };

  componentDidMount() {
    this.getLinkDetail();
  }

  /**
   * 获取详情
   */
  getLinkDetail = param => {
    return new Promise((resolve, reject) => {
      const shareId = location.pathname.match(/.*\/public\/workflow\/(.*)/)[1];
      worksheetAjax.getLinkDetail({ id: shareId, ...param }).then(data => {
        const getGlobalMeta = () => {
          preall(
            { type: 'function' },
            {
              allownotlogin: true,
              requestParams: { projectId: data.projectId },
            },
          );
        };

        if (data.resultCode === 1) {
          localStorage.setItem('currentProjectId', data.projectId);
          data.shareAuthor && (window.shareAuthor = data.shareAuthor);

          if (data.clientId) {
            window.clientId = data.clientId;
            !sessionStorage.getItem('clientId') && sessionStorage.setItem('clientId', data.clientId);
          }

          getGlobalMeta();
          this.setState({ loading: false, data, isError: false });
          resolve(data);
        } else {
          getGlobalMeta();
          this.setState({ loading: false, data, isError: true });
          reject(data);
        }
      });
    });
  };

  /**
   * 获取标题
   */
  getTitle() {
    const { data } = this.state;
    const titleControl = _.find(data.receiveControls, item => item.attribute === 1);
    const title = titleControl ? renderCellText(titleControl) || '' : '';

    return title ? `${data.appName}-${title}` : data.appName;
  }

  /**
   * 渲染错误
   */
  renderError() {
    const { data } = this.state;

    if ([14, 18, 19].includes(data.resultCode)) {
      return (
        <VerificationPass
          validatorPassPromise={(value, captchaResult) => {
            return new Promise((resolve, reject) => {
              if (value) {
                this.getLinkDetail({ password: value, ...captchaResult }).catch(data => {
                  reject(SHARE_STATE[data.resultCode]);
                });
              } else {
                return reject();
              }
            });
          }}
        />
      );
    }

    return (
      <div className="flexColumn h100 alignItemsCenter justifyContentCenter">
        <i className="icon-Import-failure" style={{ color: '#FF7600', fontSize: 60 }} />
        <div className="Font17 bold mTop15">{SHARE_STATE[data.resultCode]}</div>
      </div>
    );
  }

  /**
   * 渲染已提交
   */
  renderComplete() {
    return (
      <div className="flexColumn h100 alignItemsCenter justifyContentCenter">
        <i className="icon-check_circle" style={{ color: '#4CAF50', fontSize: 60 }} />
        <div className="Font17 bold mTop15">{_l('提交成功')}</div>
      </div>
    );
  }

  render() {
    const { loading, data, isError } = this.state;

    return (
      <Fragment>
        <DocumentTitle title={_.isEmpty(data) ? _l('加载中') : this.getTitle()} />

        {loading ? (
          <LoadDiv className="mTop20" />
        ) : (
          <div className="worksheetRowEdit h100 flexColumn">
            <ScrollView className="flex">
              {isError && this.renderError()}
              {data.linkState === 1 && this.renderComplete()}
              {!isError && data.linkState !== 1 ? (
                browserIsMobile() ? (
                  <RecordInfoModal
                    className="full"
                    visible
                    appId={data.appId}
                    worksheetId={data.worksheetId}
                    rowId={data.rowId}
                    editable={data.linkState === 0}
                    hideOtherOperate={data.linkState === 0}
                    allowEmptySubmit
                    updateSuccess={(recordIds, data) => this.setState({ data: { ...data, linkState: 1 } })}
                  />
                ) : (
                  <RecordInfoWrapper
                    notDialog
                    from={2}
                    appId={data.appId}
                    worksheetId={data.worksheetId}
                    allowEdit={data.linkState === 0}
                    hideEditingBar
                    recordId={data.rowId}
                    allowEmptySubmit
                    header={
                      <Header
                        data={data}
                        callback={({ error }) => !error && this.setState({ data: { ...data, linkState: 1 } })}
                      />
                    }
                  />
                )
              ) : null}
            </ScrollView>
          </div>
        )}
      </Fragment>
    );
  }
}

ReactDom.render(<WorksheetRowEdit />, document.getElementById('app'));

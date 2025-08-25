import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import 'mobile/index.less';
import { SHARE_STATE, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import { renderText as renderCellText } from 'src/utils/control';
import './index.less';

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
    Components: null,
  };

  componentDidMount() {
    this.getLinkDetail();

    if (browserIsMobile()) {
      import('mobile/Record').then(res => {
        this.setState({ Components: { default: res.RecordInfoModal } });
      });
    } else {
      import('worksheet/common/recordInfo/RecordInfoWrapper').then(res => {
        this.setState({ Components: res });
      });
    }
  }

  /**
   * 获取详情
   */
  getLinkDetail = param => {
    return new Promise((resolve, reject) => {
      const shareId = location.pathname.match(/.*\/public\/workflow\/(.*)/)[1];
      worksheetAjax
        .getLinkDetail({
          id: shareId,
          ...param,
        })
        .then(async data => {
          const getGlobalMeta = () => {
            preall(
              { type: 'function' },
              {
                allowNotLogin: true,
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

            const { projectId, appId } = data;
            const lang = await shareGetAppLangDetail({
              projectId,
              appId,
            });
            if (lang) {
              data.appName = getTranslateInfo(appId, null, appId).name || data.appName;
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
        <i className="icon-error1" style={{ color: '#FF7600', fontSize: 60 }} />
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
    const { loading, data, isError, Components } = this.state;

    return (
      <Fragment>
        <DocumentTitle title={_.isEmpty(data) ? _l('加载中') : this.getTitle()} />

        {loading || !Components ? (
          <LoadDiv className="mTop20" />
        ) : (
          <div className="worksheetRowEdit h100 flexColumn minHeight0">
            <ScrollView className="flex">
              {isError && this.renderError()}
              {data.linkState === 1 && this.renderComplete()}
              {!isError && data.linkState !== 1 ? (
                browserIsMobile() ? (
                  <Components.default
                    className="full"
                    visible
                    appId={data.appId}
                    worksheetId={data.worksheetId}
                    rowId={data.rowId}
                    editable={data.linkState === 0}
                    hideOtherOperate={data.linkState === 0}
                    allowEmptySubmit
                    updateSuccess={() => this.setState({ data: { ...data, linkState: 1 } })}
                    isEditRecord={data.linkState === 0}
                    renderFooter={({ onSubmit }) =>
                      data.linkState !== 2 ? (
                        <div
                          className="adm-button adm-button-primary adm-button-shape-default flex mLeft6 mRight6 Font13 bold ellipsis"
                          onClick={() => onSubmit()}
                        >
                          {data.submitBtnName || _l('提交')}
                        </div>
                      ) : null
                    }
                  />
                ) : (
                  <Components.default
                    notDialog
                    from={2}
                    appId={data.appId}
                    worksheetId={data.worksheetId}
                    allowEdit={data.linkState === 0}
                    hideEditingBar
                    recordId={data.rowId}
                    allowEmptySubmit
                    renderHeader={() => (
                      <Header
                        data={data}
                        callback={({ error }) => !error && this.setState({ data: { ...data, linkState: 1 } })}
                      />
                    )}
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

const root = createRoot(document.getElementById('app'));

root.render(<WorksheetRowEdit />);

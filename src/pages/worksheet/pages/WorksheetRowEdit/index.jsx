import React, { Component, Fragment, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import 'mobile/index.less';
import { SHARE_STATE, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import globalEvents from 'src/router/globalEvents';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import { renderText as renderCellText } from 'src/utils/control';
import './index.less';

const Header = ({ data, callback, onSubmit }) => {
  return (
    <div className="flexRow flex alignItemsCenter">
      <div className="flex" />
      <PublicAppLangDropdown className="mRight6" appId={data.appId} projectId={data.projectId} />
      {data.linkState !== 2 && (
        <div
          className="worksheetRowEditSave ellipsis"
          onClick={() =>
            onSubmit({
              callback,
            })
          }
        >
          {data.submitBtnName || _l('提交')}
        </div>
      )}
    </div>
  );
};

const MobileHeader = ({ data }) => {
  return (
    <div className="worksheetRowEditMobileHeader flexRow alignItemsCenter">
      <CreateByMingDaoYun />
      <div className="flex" />
      <PublicAppLangDropdown appId={data.appId} projectId={data.projectId} />
    </div>
  );
};

const LoadableMobileRecordInfoModal = lazy(() =>
  import('mobile/Record').then(component => ({
    default: component.RecordInfoModal,
  })),
);
const LoadableRecordInfoWrapper = lazy(() => import('worksheet/common/recordInfo/RecordInfoWrapper'));

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
      worksheetAjax
        .getLinkDetail({
          id: shareId,
          ...param,
        })
        .then(async data => {
          const getGlobalMeta = () => {
            preall(
              {
                type: 'function',
              },
              {
                allowNotLogin: true,
                requestParams: {
                  projectId: data.projectId,
                },
              },
            );
            globalEvents();
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
            this.setState({
              loading: false,
              data,
              isError: false,
            });
            resolve(data);
          } else {
            getGlobalMeta();
            this.setState({
              loading: false,
              data,
              isError: true,
            });
            reject(data);
          }
        })
        .catch(err => {
          this.setState({
            loading: false,
            isError: err.errorCode,
          });
          reject(err);
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
                this.getLinkDetail({
                  password: value,
                  ...captchaResult,
                }).catch(data => {
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
        <i
          className="icon-error1"
          style={{
            color: 'var(--color-warning)',
            fontSize: 60,
          }}
        />
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
        <i
          className="icon-check_circle"
          style={{
            color: 'var(--color-success)',
            fontSize: 60,
          }}
        />
        <div className="Font17 bold mTop15">{_l('提交成功')}</div>
      </div>
    );
  }

  render() {
    const { loading, data, isError } = this.state;
    const isMobile = browserIsMobile();
    const RecordInfo = isMobile ? LoadableMobileRecordInfoModal : LoadableRecordInfoWrapper;

    if (isError === 300016) {
      return <RestrictAccessStatus />;
    }

    return (
      <Fragment>
        {!_.isEmpty(data) && <DocumentTitle title={this.getTitle() || _l('流程分享')} />}

        {loading ? (
          <LoadDiv className="mTop20" />
        ) : (
          <div className="worksheetRowEdit h100 flexColumn minHeight0">
            {isMobile && <MobileHeader data={data} />}
            <ScrollView className="flex">
              {isError && this.renderError()}
              {data.linkState === 1 && this.renderComplete()}
              {!isError && data.linkState !== 1 ? (
                isMobile ? (
                  <Suspense fallback={<LoadDiv className="mTop10" />}>
                    <RecordInfo
                      className="full"
                      visible
                      notModal
                      appId={data.appId}
                      worksheetId={data.worksheetId}
                      rowId={data.rowId}
                      editable={data.linkState === 0}
                      hideOtherOperate={data.linkState === 0}
                      allowEmptySubmit
                      updateSuccess={() =>
                        this.setState({
                          data: { ...data, linkState: 1 },
                        })
                      }
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
                  </Suspense>
                ) : (
                  <Suspense fallback={<LoadDiv className="mTop10" />}>
                    <RecordInfo
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
                          callback={({ error }) =>
                            !error &&
                            this.setState({
                              data: { ...data, linkState: 1 },
                            })
                          }
                        />
                      )}
                    />
                  </Suspense>
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

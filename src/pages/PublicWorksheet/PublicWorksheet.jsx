import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView, Skeleton } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import { Absolute } from 'worksheet/components/Basics';
import BgContainer from 'src/pages/publicWorksheetConfig/components/BgContainer';
import Qr from 'src/pages/publicWorksheetConfig/components/Qr';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import { FILL_STATUS } from './enum';
import { getFormData, getPublicWorksheet, getPublicWorksheetInfo } from './action';
import FillWorksheet from './FillWorksheet';
import NotFillStatus from './NotFillStatus';
import './index.less';
import _ from 'lodash';
import { generate } from '@ant-design/colors';
import { VerificationPass } from 'worksheet/components/ShareState';
import { getRequest } from 'src/util';
import cx from 'classnames';
import { handlePrePayOrder } from '../Admin/pay/PrePayorder';

const TopBar = styled.div(
  ({ color }) => `height: 10px; background: ${color}; opacity: .4; border-radius: 3px 3px 0 0;`,
);

export default class PublicWorksheet extends React.Component {
  static propTypes = {
    isPreview: PropTypes.bool,
    worksheetId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      qrurl: '',
      passWord: '',
    };
    window.isPublicWorksheet = _.get(window, 'shareState.isPublicFormPreview') ? false : true;
  }

  componentDidMount() {
    const { isPreview, worksheetId } = this.props;
    if (isPreview) {
      getPublicWorksheetInfo(worksheetId, (err, info) => {
        this.setState({
          loading: false,
          status: FILL_STATUS.NORMAL,
          publicWorksheetInfo: info.publicWorksheetInfo,
          formData: info.formData,
        });
      });
    } else {
      const urlMatch = location.pathname.match(/.*\/((\w{32}))/);
      if (!urlMatch) {
        alert(_l('地址有误，无法找到相关数据！'), 2);
      }
      const shareId = urlMatch[1];
      window.publicWorksheetShareId = shareId;
      this.shareId = shareId;
      getPublicWorksheet(
        {
          shareId,
          langType: getCurrentLangCode(),
        },
        info => {
          this.setState({ loading: false, ...info });
          if (info.status === FILL_STATUS.NOT_IN_FILL_TIME) {
            alert(_l('你访问的表单暂未开放!'), 3);
          }
        },
      );
    }
  }

  render() {
    const { isPreview } = this.props;
    const { loading, publicWorksheetInfo = {}, formData, rules, status, qrurl } = this.state;
    const { worksheetId, coverUrl, projectName, themeBgColor, writeScope } = publicWorksheetInfo;
    const request = getRequest();
    const { bg, footer } = request;
    const hideBg = bg === 'no';

    const renderContent = () => {
      return (
        <React.Fragment>
          <div className="formContent flexColumn">
            {!hideBg && (
              <React.Fragment>
                {worksheetId && (
                  <Absolute top="0" right="-48">
                    <div
                      className="qrIcon icon icon-zendeskHelp-qrcode"
                      onMouseEnter={() => {
                        let qrurl = location.href;
                        if (isPreview) {
                          try {
                            qrurl = new URL(location.href).searchParams.get('url');
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        this.setState({ qrurl });
                      }}
                    >
                      <Qr url={qrurl} />
                    </div>
                  </Absolute>
                )}
                <TopBar color={themeBgColor} />
              </React.Fragment>
            )}

            {loading && (
              <div style={{ padding: 10 }}>
                <Skeleton
                  style={{ flex: 1 }}
                  direction="column"
                  widths={['30%', '40%', '90%', '60%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
                <Skeleton
                  style={{ flex: 1 }}
                  direction="column"
                  widths={['40%', '55%', '100%', '80%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
                <Skeleton
                  style={{ flex: 2 }}
                  direction="column"
                  widths={['45%', '100%', '100%', '100%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              </div>
            )}

            {!loading &&
              (!_.includes([FILL_STATUS.NORMAL, FILL_STATUS.NOT_IN_FILL_TIME], status) ? (
                <NotFillStatus
                  publicWorksheetInfo={publicWorksheetInfo}
                  status={status}
                  onRefill={async () => {
                    const formData = await getFormData(publicWorksheetInfo, FILL_STATUS.NORMAL);
                    this.setState({
                      status: FILL_STATUS.NORMAL,
                      formData,
                      publicWorksheetInfo: {
                        ...publicWorksheetInfo,
                        completeNumber: publicWorksheetInfo.completeNumber + 1,
                      },
                    });
                    $('.nano').nanoScroller({ scrollTop: 0 });
                  }}
                  formData={formData}
                  rules={rules}
                />
              ) : (
                <FillWorksheet
                  rules={rules}
                  isPreview={isPreview}
                  loading={loading}
                  publicWorksheetInfo={publicWorksheetInfo}
                  formData={formData}
                  status={status}
                  onSubmit={(isPayOrder, rowId) => {
                    this.setState({ status: FILL_STATUS.COMPLETED });
                    isPayOrder &&
                      rowId &&
                      handlePrePayOrder({ worksheetId, rowId, paymentModule: 1, sheetThemeColor: themeBgColor });
                  }}
                />
              ))}
          </div>
        </React.Fragment>
      );
    };

    return (
      <div
        className={cx('publicWorksheet', { hideBg })}
        style={{ backgroundColor: !hideBg ? (themeBgColor ? generate(themeBgColor)[0] : undefined) : '#fff' }}
      >
        {!loading && (
          <DocumentTitle
            title={
              status !== FILL_STATUS.NEED_FILL_PASSWORD
                ? worksheetId
                  ? publicWorksheetInfo.name || _l('公开表单')
                  : _l('你访问的表单不存在')
                : _l('填写密码')
            }
          />
        )}

        {!loading && status === FILL_STATUS.NEED_FILL_PASSWORD ? (
          <VerificationPass
            validatorPassPromise={(value, captchaResult) => {
              return new Promise(async (resolve, reject) => {
                if (value) {
                  const params = {
                    shareId: this.shareId,
                    passWord: value,
                    ...captchaResult,
                  };
                  getPublicWorksheet(params, info => {
                    if (info) {
                      this.setState({ loading: false, ...info });
                      if (info.status === FILL_STATUS.NOT_IN_FILL_TIME) {
                        alert(_l('你访问的表单暂未开放!'), 3);
                      }
                      resolve(data);
                    } else {
                      reject();
                    }
                  });
                } else {
                  reject();
                }
              });
            }}
          />
        ) : (
          <ScrollView className="flex">
            {hideBg ? (
              renderContent()
            ) : (
              <BgContainer
                coverUrl={coverUrl}
                theme={themeBgColor}
                isDisplayAvatar={!isPreview && writeScope !== 1 && !loading}
              >
                {renderContent()}
              </BgContainer>
            )}
          </ScrollView>
        )}
      </div>
    );
  }
}

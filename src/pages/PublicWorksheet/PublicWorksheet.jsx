import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import Skeleton from 'src/router/Application/Skeleton';
import { Absolute } from 'worksheet/components/Basics';
import BgContainer from 'src/pages/publicWorksheetConfig/components/BgContainer';
import Qr from 'src/pages/publicWorksheetConfig/components/Qr';
import { themes } from 'src/pages/publicWorksheetConfig/enum';
import { FILL_TIMES } from 'src/pages/publicWorksheetConfig/enum';
import { FILL_STATUS } from './enum';
import { getPublicWorksheet, getPublicWorksheetInfo } from './action';
import FillWorksheet from './FillWorksheet';
import NotFillStatus from './notFillStatus';
import './index.less';
import moment from 'moment';

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
    };
    window.isPublicWorksheet = true;
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
      getPublicWorksheet(shareId, (err, info) => {
        if (err) {
          this.setState({
            loading: false,
            status: FILL_STATUS.CLOSE,
            publicWorksheetInfo: info.publicWorksheetInfo,
          });
        } else {
          this.setState({
            loading: false,
            status: this.getStatus(
              info.publicWorksheetInfo.visibleType,
              info.publicWorksheetInfo.fillTimes,
              info.publicWorksheetInfo.shareId,
            ),
            publicWorksheetInfo: info.publicWorksheetInfo,
            formData: info.formData,
            rules: info.rules,
          });
        }
      });
    }
  }

  getStatus(visibleType, fillTimes, shareId) {
    const publicWorksheetLastSubmit = localStorage.getItem('publicWorksheetLastSubmit_' + shareId);
    if (
      fillTimes === FILL_TIMES.UNLIMITED ||
      !publicWorksheetLastSubmit ||
      (fillTimes === FILL_TIMES.DAILY && moment().isAfter(moment(publicWorksheetLastSubmit).endOf('day')))
    ) {
      return FILL_STATUS.NORMAL;
    } else {
      return FILL_STATUS.COMPLETED;
    }
  }

  render() {
    const { isPreview } = this.props;
    const { loading, publicWorksheetInfo = {}, formData, rules, status, qrurl } = this.state;
    const { worksheetId, coverUrl, themeIndex, projectName } = publicWorksheetInfo;
    const theme = themes[themeIndex] || {};
    return (
      <div className="publicWorksheet" style={{ backgroundColor: theme.second }}>
        {!loading && (
          <DocumentTitle
            title={worksheetId ? publicWorksheetInfo.name || _l('未命名表单') : _l('你访问的表单不存在')}
          />
        )}
        <ScrollView className="flex">
          <BgContainer coverUrl={coverUrl} themeIndex={themeIndex}>
            <div className="formContent flexColumn">
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
              <TopBar color={theme.main} />
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
              {!loading && status !== FILL_STATUS.NORMAL && (
                <NotFillStatus
                  publicWorksheetInfo={publicWorksheetInfo}
                  status={status}
                  onRefill={() => {
                    this.setState({ status: FILL_STATUS.NORMAL });
                    $('.nano').nanoScroller({ scrollTop: 0 });
                  }}
                />
              )}
              {!loading && status === FILL_STATUS.NORMAL && (
                <FillWorksheet
                  rules={rules}
                  isPreview={isPreview}
                  loading={loading}
                  publicWorksheetInfo={publicWorksheetInfo}
                  formData={formData}
                  onSubmit={() => {
                    this.setState({ status: FILL_STATUS.COMPLETED });
                  }}
                />
              )}
            </div>
          </BgContainer>
        </ScrollView>
      </div>
    );
  }
}

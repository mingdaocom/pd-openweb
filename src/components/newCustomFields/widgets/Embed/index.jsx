import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile } from 'src/utils/common';
import { isPublicLink } from '../../tools/utils';

const EmbedWrap = styled.div`
  width: 100%;
  ${props => (props.isMobileView ? `height: ${props.height}px;` : '')}
  .embedContainer {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    ${props => (props.viewType === VIEW_DISPLAY_TYPE.sheet && !isPublicLink() ? '' : `height: ${props.height}px;`)}
    ${props =>
      props.isMobileView ? `height: ${props.height}px;position: absolute; transform: translate(0px, 0px);` : ''}
    &.chartPadding {
      padding: 8px 16px 16px;
    }
    .SingleViewHeader.mobile {
      display: none !important;
    }
    .toolBarWrap {
      ${props => (props.isMobileView ? 'left: 12px!important; margin-left: 0; width: 200px;' : '')}
    }
    .fixedTabs {
      display: none;
    }
    .mobileSearchRecordDropdown {
      top: auto !important;
    }
  }
  .viewContainer {
    display: flex;
    & > div {
      padding: 0;
    }

    .SingleViewHeader {
      .searchInputComp {
        ${props =>
          _.includes([VIEW_DISPLAY_TYPE.detail, VIEW_DISPLAY_TYPE.resource], props.viewType)
            ? { display: 'none;' }
            : {}}
      }
    }
  }
`;

export default class Widgets extends Component {
  static propTypes = {
    enumDefault: PropTypes.number,
  };

  iframe = React.createRef();

  state = {
    resultData: '',
    needUpdate: Math.random(),
    ChartComponents: null,
    viewType: '',
    controls: [],
  };

  componentDidMount() {
    this.initFunc();
    this.embedWatch = setInterval(this.setValue, 3000);
  }

  initFunc = (nextProps, callback) => {
    const { enumDefault, addRefreshEvents, controlId } = nextProps || this.props;
    const isMobile = browserIsMobile();

    if (enumDefault === 2) {
      if (isMobile) {
        import('mobile/CustomPage/ChartContent').then(component =>
          this.setState({ ChartComponents: component }, this.setValue),
        );
      } else {
        import('statistics/Card').then(component => this.setState({ ChartComponents: component }, this.setValue));
      }
    } else if (enumDefault === 3) {
      import('./EmbedPreview').then(this.getControls);
    } else {
      this.setValue();
    }

    if (_.isFunction(addRefreshEvents)) {
      addRefreshEvents(controlId, this.handleReloadIFrame.bind(this));
    }

    if (_.isFunction(callback)) {
      callback();
    }
  };

  getControls = component => {
    const { dataSource } = this.props;
    const { reportid, wsid } = safeParse(dataSource || '{}');

    worksheetAjax.getWorksheetInfo({ worksheetId: wsid, getViews: true }).then(({ template = {}, views = [] }) => {
      const curView = _.find(views, v => v.viewId === reportid);
      this.setState(
        {
          ChartComponents: component,
          viewType: String(_.get(curView, 'viewType')),
          controls: _.get(template, 'controls') || [],
        },
        this.setValue,
      );
    });
  };

  setValue = props => {
    const { enumDefault, value, formData, recordId } = props || this.props;
    const { resultData, controls = [] } = this.state;
    if (enumDefault === 1) {
      if (value && value !== resultData) {
        this.setState({ resultData: value });
      }
    } else {
      const filterResult = getFilter({
        control: { ...this.props, relationControls: controls || [], recordId, ignoreFilterControl: enumDefault === 2 },
        formData,
      }) || [{}];

      if (!_.isEqual(resultData, filterResult)) {
        this.setState({ resultData: filterResult, needUpdate: Math.random() });
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.flag !== this.props.flag || nextProps.recordId !== this.props.recordId) {
      this.initFunc(nextProps, () => {
        // 嵌入链接无法主动刷新，变更src刷新
        if (nextProps.enumDefault === 1 && this.iframe && this.iframe.current) {
          const tmpUrl = _.get(this.iframe, 'current.src');
          this.iframe.current.src = 'about:blank';
          const _t = setTimeout(() => {
            this.iframe.current.src = tmpUrl;
            clearTimeout(_t);
          }, 300);
        } else {
          this.setState({ needUpdate: Math.random() });
        }
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.embedWatch);
    if (_.isFunction(this.props.addRefreshEvents)) {
      this.props.addRefreshEvents(this.props.controlId, undefined);
    }
  }

  handleReloadIFrame() {
    if (_.isFunction(_.get(this, 'iframe.current.contentDocument.location.reload'))) {
      try {
        this.iframe.current.contentDocument.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  }

  render() {
    const {
      advancedSetting = {},
      enumDefault,
      enumDefault2,
      dataSource,
      viewId,
      recordId,
      projectId,
      isCharge,
      viewIdForPermit,
      isDraft,
    } = this.props;
    const { resultData, needUpdate, ChartComponents, viewType } = this.state;
    const { height, rownum = '10' } = advancedSetting;
    const isMobile = browserIsMobile();
    const { appid, reportid, wsid } = enumDefault === 1 ? {} : safeParse(dataSource || '{}');

    const getContent = () => {
      const isLegal = enumDefault === 1 ? /^https?:\/\/.+$/.test(resultData) : dataSource;
      const isShareView = _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage');

      if (!isLegal) {
        return (
          <div className="embedContainer">
            <div className="w100 h100 Gray_9e BGF7F7F7 Font15 flexRow alignItemsCenter justifyContentCenter">
              {_l('嵌入内容无法解析')}
            </div>
          </div>
        );
      }

      if (enumDefault === 3 && (isPublicLink() || viewType === VIEW_DISPLAY_TYPE.detail)) {
        return (
          <div className="embedContainer">
            <div className="w100 h100 Gray_9e BGF7F7F7 Font15 flexRow alignItemsCenter justifyContentCenter">
              {viewType === VIEW_DISPLAY_TYPE.detail ? _l('暂不支持显示详情视图') : _l('暂不支持显示视图')}
            </div>
          </div>
        );
      }

      if (enumDefault === 1) {
        return (
          <div className="embedContainer">
            <iframe
              ref={this.iframe}
              width="100%"
              height="100%"
              frameborder="0"
              allowtransparency="true"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allowfullscreen="true"
              src={resultData}
            />
          </div>
        );
      } else {
        if (!ChartComponents || !wsid) return null;

        if (enumDefault === 3) {
          return (
            <div className="embedContainer viewContainer">
              <ChartComponents.default
                appId={appid || this.props.appId}
                setting={{
                  value: wsid,
                  viewId: reportid,
                  config: {
                    fromEmbed: true,
                    isAddRecord: enumDefault2 !== 1,
                    searchRecord: true,
                    ...(viewType === VIEW_DISPLAY_TYPE.sheet ? { pageCount: rownum } : {}),
                    fullShowTable: true,
                    minRowCount: 2,
                    isDraft,
                    embedNeedUpdate: needUpdate,
                  },
                }}
                filtersGroup={resultData}
              />
            </div>
          );
        }

        return (
          <Fragment>
            {isMobile ? (
              <div className="embedContainer chartPadding flexColumn">
                <ChartComponents.default
                  reportId={reportid}
                  pageId={isShareView ? viewId : recordId}
                  filters={resultData}
                  needUpdate={needUpdate}
                  viewId={viewIdForPermit}
                />
              </div>
            ) : (
              <ChartComponents.default
                className="embedContainer chartPadding"
                report={{ id: reportid }}
                pageId={isShareView ? viewId : recordId}
                projectId={projectId}
                appId={appid || this.props.appId}
                sourceType={2}
                filters={resultData}
                needUpdate={needUpdate}
                isCharge={isCharge}
                viewId={viewIdForPermit}
              />
            )}
          </Fragment>
        );
      }
    };

    return (
      <EmbedWrap height={height || 400} viewType={viewType} isMobileView={isMobile && enumDefault === 3}>
        {getContent()}
      </EmbedWrap>
    );
  }
}

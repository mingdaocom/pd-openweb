import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import worksheetAjax from 'src/api/worksheet';
import { isPublicLink, formatFiltersValue } from '../../tools/utils';

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
      ${props => (_.includes([VIEW_DISPLAY_TYPE.calendar], props.viewType) ? { display: 'none;' } : {})}

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
    value: PropTypes.string,
    enumDefault: PropTypes.number,
  };

  iframe = React.createRef();

  state = {
    value: '',
    needUpdate: '',
    ChartComponents: null,
    viewType: '',
    controls: [],
  };

  componentDidMount() {
    this.initFunc(this.props);
  }

  initFunc = (props, callback) => {
    const isMobile = browserIsMobile();

    if (props.enumDefault === 1) {
      this.setValue();
      this.embedWatch = setInterval(this.setValue, 3000);
    } else if (props.enumDefault === 2) {
      if (isMobile) {
        import('mobile/CustomPage/ChartContent').then(component => {
          this.setState({ ChartComponents: component });
        });
      } else {
        import('statistics/Card').then(component => {
          this.setState({ ChartComponents: component });
        });
      }
    } else if (props.enumDefault === 3) {
      import('./EmbedPreview').then(component => {
        const { reportid, wsid } = safeParse(props.dataSource || '{}');

        if (wsid) {
          worksheetAjax
            .getWorksheetInfo({ worksheetId: wsid, getViews: true })
            .then(({ template = {}, views = [] }) => {
              const curView = _.find(views, v => v.viewId === reportid);
              this.setState({
                ChartComponents: component,
                viewType: String(_.get(curView, 'viewType')),
                controls: _.get(template, 'controls') || [],
              });
            });
        }
      });
    }

    if (_.isFunction(props.addRefreshEvents)) {
      props.addRefreshEvents(props.controlId, this.handleReloadIFrame.bind(this));
    }

    if (_.isFunction(props.triggerCustomEvent)) {
      props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }

    if (_.isFunction(callback)) {
      callback();
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.flag !== this.props.flag || nextProps.recordId !== this.props.recordId) {
      this.initFunc(nextProps, () => this.setState({ needUpdate: Math.random() }));
    }
  }

  setValue = () => {
    if (this.props.value && this.props.value !== this.state.value) {
      this.setState({ value: this.props.value });
    }
  };

  componentWillUnmount() {
    clearInterval(this.embedWatch);
    if (_.isFunction(this.props.addRefreshEvents)) {
      this.props.addRefreshEvents(this.props.controlId, undefined);
    }
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
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
      formData,
      viewId,
      recordId,
      projectId,
      isCharge,
      viewIdForPermit,
    } = this.props;
    const { value, needUpdate, ChartComponents, viewType, controls } = this.state;
    const { height, filters, rownum = '10' } = advancedSetting;
    const isMobile = browserIsMobile();
    const { appid, reportid, wsid, type } = enumDefault === 1 ? {} : safeParse(dataSource || '{}');

    const getContent = () => {
      const isLegal = enumDefault === 1 ? /^https?:\/\/.+$/.test(value) : dataSource;
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
              src={value}
            />
          </div>
        );
      } else {
        if (!ChartComponents || !wsid) return null;

        if (enumDefault === 3) {
          const filtersGroup = getFilter({
            control: { ...this.props, relationControls: controls || [] },
            formData,
          }) || [{}];

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
                  },
                }}
                filtersGroup={filtersGroup}
                needUpdate={needUpdate}
              />
            </div>
          );
        }

        const formatFilters = formatFiltersValue(safeParse(filters || '[]'), formData, recordId);

        return (
          <Fragment>
            {isMobile ? (
              <div className="embedContainer chartPadding flexColumn">
                <ChartComponents.default
                  reportId={reportid}
                  pageId={isShareView ? viewId : recordId}
                  filters={formatFilters}
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
                filters={formatFilters}
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

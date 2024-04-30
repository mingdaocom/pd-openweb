import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { formatFiltersValue } from 'src/components/newCustomFields/tools/utils';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

const EmbedWrap = styled.div`
  width: 100%;
  .embedContainer {
    width: 100%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    height: ${props => props.height}px;
    &.chartPadding {
      padding: 8px 16px 16px;
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
  };

  componentDidMount() {
    const isMobile = browserIsMobile();

    if (this.props.enumDefault === 1) {
      this.setValue();
      this.embedWatch = setInterval(this.setValue, 3000);
    } else {
      if (isMobile) {
        import('mobile/CustomPage/ChartContent').then(component => {
          this.setState({ ChartComponents: component });
        });
      } else {
        import('statistics/Card').then(component => {
          this.setState({ ChartComponents: component });
        });
      }
    }

    if (_.isFunction(this.props.addRefreshEvents)) {
      this.props.addRefreshEvents(this.props.controlId, this.handleReloadIFrame.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.flag !== this.state.needUpdate) {
      this.setState({ needUpdate: nextProps.flag });
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
      dataSource,
      formData,
      appId,
      viewId,
      recordId,
      projectId,
      isCharge,
      viewIdForPermit,
    } = this.props;
    const { value, needUpdate, ChartComponents } = this.state;
    const { height, filters } = advancedSetting;
    const isMobile = browserIsMobile();

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
        const formatFilters = formatFiltersValue(JSON.parse(filters || '[]'), formData, recordId);
        const { reportid } = dataSource ? JSON.parse(dataSource) : {};

        if (!ChartComponents) return null;

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
                appId={appId}
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

    return <EmbedWrap height={height || 400}>{getContent()}</EmbedWrap>;
  }
}

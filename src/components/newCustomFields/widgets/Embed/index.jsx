import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { formatFiltersValue } from 'src/components/newCustomFields/tools/utils';
import { browserIsMobile } from 'src/util';
import WidgetsDesc from '../../components/WidgetsDesc';
import cx from 'classnames';
import _ from 'lodash';

const EmbedWrap = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: ${props => (props.displayRow ? 'row' : 'column')};
  .embedContainer {
    ${({ displayRow }) => (displayRow ? 'flex: 1;min-width: 0;' : '')}
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    height: ${props => props.height}px;
    &.chartPadding {
      padding: 8px 16px 16px;
    }
  }
  .embedTitle {
    display: flex;
    ${({ displayRow, width, textAlign }) =>
      displayRow
        ? `width:${width}px;text-align:${textAlign};padding-right: 10px;padding-top:8px;`
        : 'justify-content: space-between;'}
    margin-bottom: 10px;
    min-height: 18px;
    i {
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
    .descBoxInfo {
      position: relative !important;
      left: 0 !important;
      top: 2px !important;
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
      controlName,
      enumDefault,
      dataSource,
      formData,
      appId,
      recordId,
      from = '',
      projectId,
      isCharge,
      widgetStyle = {},
      disabled,
    } = this.props;
    const { value, needUpdate, ChartComponents } = this.state;
    const {
      titlelayout_pc = '1',
      titlelayout_app = '1',
      titlewidth_pc = '100',
      align_pc = '1',
      titlewidth_app = '100',
      align_app = '1',
    } = widgetStyle;
    const isMobile = browserIsMobile();
    const displayRow = isMobile ? (disabled ? titlelayout_app === '2' : false) : titlelayout_pc === '2';

    const getContent = () => {
      const isLegal = enumDefault === 1 ? /^https?:\/\/.+$/.test(value) : dataSource;

      if (!isLegal) {
        return (
          <div className="embedContainer">
            <div className="w100 h100 Gray_9e BGF7F7F7 Font15 crossCenter">{_l('嵌入内容无法解析')}</div>
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
        const formatFilters = formatFiltersValue(JSON.parse(advancedSetting.filters || '[]'), formData, recordId);
        const { reportid } = dataSource ? JSON.parse(dataSource) : {};

        if (!ChartComponents) return null;

        return (
          <Fragment>
            {isMobile ? (
              <div className="embedContainer chartPadding flexColumn">
                <ChartComponents.default reportId={reportid} filters={formatFilters} needUpdate={needUpdate} />
              </div>
            ) : (
              <ChartComponents.default
                className="embedContainer chartPadding"
                report={{ id: reportid }}
                projectId={projectId}
                appId={appId}
                sourceType={1}
                filters={formatFilters}
                needUpdate={needUpdate}
                isCharge={isCharge}
              />
            )}
          </Fragment>
        );
      }
    };

    return (
      <EmbedWrap
        height={advancedSetting.height || 400}
        displayRow={displayRow}
        width={isMobile ? titlewidth_app : titlewidth_pc}
        textAlign={isMobile ? (align_app === '1' ? 'left' : 'right') : align_pc === '1' ? 'left' : 'right'}
      >
        {from !== 'print' && (
          <div
            className="embedTitle"
            style={
              isMobile
                ? { justifyContent: displayRow && align_app !== '1' ? 'flex-end' : 'flex-start' }
                : { justifyContent: displayRow ? (align_app !== '1' ? 'flex-end' : 'flex-start') : '' }
            }
          >
            <div className="flexRow">
              {advancedSetting.hidetitle !== '1' && (
                <div title={controlName} className={cx('Bold Gray_75 Font13', { Font14: isMobile })}>
                  {controlName}
                </div>
              )}
              {recordId && <WidgetsDesc item={this.props} from={from} />}
            </div>

            {advancedSetting.allowlink === '1' && enumDefault === 1 && (
              <Tooltip text={<span>{_l('新页面打开')}</span>}>
                <Icon className="Hand Font16 mLeft3 pTop2" icon="launch" onClick={() => window.open(value)} />
              </Tooltip>
            )}
          </div>
        )}
        {getContent()}
      </EmbedWrap>
    );
  }
}

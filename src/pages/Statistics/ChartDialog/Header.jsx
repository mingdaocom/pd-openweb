import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Input, Popover, Tooltip } from 'ming-ui/antd-components';
import reportConfig from '../api/reportConfig';
import { defaultTitleStyles, replaceTitleStyle } from 'src/pages/customPage/components/ConfigSideWrap/util';
import { getTranslateInfo } from 'src/utils/services/app';
import ChartDesc from '../components/ChartDesc';

const POPOVER_STYLES = { container: { width: 300, padding: 12 } };

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      editDescVisible: false,
    };
  }
  handleBlur = event => {
    const name = event.target.value;
    const { report } = this.props;

    if (report.id) {
      reportConfig
        .updateReportName({
          reportId: report.id,
          name,
        })
        .then(() => {});
    }

    this.setState({ isEdit: false });
    this.props.changeCurrentReport({ name });
  };
  render() {
    const { appId, report, permissions, currentReport, reportData, themeColor, customPageConfig = {} } = this.props;
    const pageTitleStyles = customPageConfig.titleStyles || {};
    const titleStyles = _.get(currentReport.style, 'titleStyles') || defaultTitleStyles;
    const newTitleStyles =
      pageTitleStyles.index >= titleStyles.index
        ? {
            ...pageTitleStyles,
            color: pageTitleStyles.isInitial ? '#333' : pageTitleStyles.color,
          }
        : titleStyles;
    const { displaySetup = {} } = reportData;
    const { isEdit, editDescVisible } = this.state;
    const translateInfo = getTranslateInfo(appId, null, report.id);
    return (
      <Fragment>
        {isEdit ? (
          <Input
            autoFocus
            className="flex mRight20"
            defaultValue={currentReport.name}
            onBlur={this.handleBlur}
            onKeyDown={event => {
              event.which === 13 && this.handleBlur(event);
            }}
          />
        ) : (
          <div className="nameWrapper valignWrapper flex">
            {(window.shareState.shareId ? displaySetup.showTitle : true) && (
              <Fragment>
                <span
                  className="ellipsis"
                  style={{
                    ...replaceTitleStyle(newTitleStyles, themeColor),
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {translateInfo.name || currentReport.name}
                </span>
                {permissions && (
                  <Icon
                    icon="workflow_write"
                    className="Font18 pointer textTertiary mLeft7"
                    onClick={() => {
                      this.setState({
                        isEdit: true,
                      });
                    }}
                  />
                )}
                {(permissions ? true : currentReport.desc) && (
                  <Tooltip
                    title={translateInfo.description || currentReport.desc || _l('编辑图表说明')}
                    placement="bottom"
                  >
                    <Popover
                      trigger={permissions ? 'click' : []}
                      open={editDescVisible}
                      onOpenChange={visible => {
                        if (!permissions) return;
                        this.setState({ editDescVisible: visible });
                      }}
                      placement="bottomRight"
                      destroyOnHidden={false}
                      styles={POPOVER_STYLES}
                      content={
                        <ChartDesc
                          reportId={report.id}
                          desc={currentReport.desc}
                          onSave={desc => {
                            this.props.changeCurrentReport({ desc });
                          }}
                          onClose={() => {
                            this.setState({ editDescVisible: false });
                          }}
                        />
                      }
                    >
                      <div>
                        <Icon
                          icon="info"
                          className={cx('Font18 pointer textTertiary mLeft7', {
                            hideDesc: !editDescVisible && _.isEmpty(currentReport.desc),
                          })}
                        />
                      </div>
                    </Popover>
                  </Tooltip>
                )}
              </Fragment>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Icon, Input } from 'ming-ui';
import { Tooltip } from 'antd';
import reportConfig from '../api/reportConfig';
import ChartDesc from '../components/ChartDesc';
import Trigger from 'rc-trigger';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      editDescVisible: false
    }
  }
  handleBlur = (event) => {
    const name = event.target.value;
    const { report } = this.props;
    if (report.id) {
      reportConfig.updateReportName({
        reportId: report.id,
        name
      }).then(result => {});
    }
    this.setState({ isEdit: false });
    this.props.changeCurrentReport({ name });
  }
  render() {
    const { appId, report, permissions, currentReport } = this.props;
    const { isEdit, editDescVisible } = this.state;
    const translateInfo = getTranslateInfo(appId, null, report.id);
    return (
      <Fragment>
      {
        isEdit ? (
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
            <span className="ellipsis bold Font16">
              {translateInfo.name || currentReport.name}
            </span>
            {permissions && (
              <Icon
                icon="workflow_write"
                className="Font18 pointer Gray_9e mLeft7"
                onClick={() => {
                  this.setState({
                    isEdit: true,
                  });
                }}
              />
            )}
            {(permissions ? true : currentReport.desc) && (
              <Trigger
                action={['click']}
                popup={(
                  <ChartDesc
                    reportId={report.id}
                    desc={currentReport.desc}
                    onSave={(desc) => {
                      this.props.changeCurrentReport({ desc });
                    }}
                    onClose={() => {
                      this.setState({ editDescVisible: false });
                    }}
                  />
                )}
                popupVisible={editDescVisible}
                onPopupVisibleChange={visible => {
                  if (!permissions) return;
                  this.setState({ editDescVisible: visible });
                }}
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [10, 10],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <Tooltip title={translateInfo.description || currentReport.desc || _l('编辑图表说明')} placement="bottom">
                  <Icon
                    icon="info"
                    className={cx('Font18 pointer Gray_9e mLeft7', { hideDesc: !editDescVisible && _.isEmpty(currentReport.desc) })}
                  />
                </Tooltip>
              </Trigger>
            )}
          </div>
        )
      }
      </Fragment>
    );
  }
}

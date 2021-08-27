import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { MenuItem, Icon } from 'ming-ui';
import styled from 'styled-components';
import { getPrintList } from 'src/api/worksheet';
import { add } from 'src/api/webCache';
import { upgradeVersionDialog } from 'src/util';
import { getProjectLicenseInfo } from 'src/api/project';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
const MenuItemWrap = styled(MenuItem)`
  &.active,
  &.hover {
    background-color: #1e88e5 !important;
    .Item-content,
    .Icon {
      color: #fff !important;
    }
  }
`;
export default class PrintList extends Component {
  static propTypes = {
    viewId: PropTypes.string,
    recordId: PropTypes.string,
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    workId: PropTypes.string,
    instanceId: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    projectId: PropTypes.string,
    sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  };
  constructor(props) {
    super(props);
    this.state = {
      showPrintGroup: false,
      tempList: [],
      isNo: false,
      isFree: false,
    };
  }

  componentDidMount() {
    const { viewId, worksheetId, projectId } = this.props;
    if (worksheetId) {
      getPrintList({
        worksheetId,
        viewId,
      }).then(tempList => {
        let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;
        this.setState({ tempList: list, tempListLoaded: true });
        this.projectLicenseInfo(projectId);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.projectId != this.props.projectId && nextProps.projectId) {
      this.projectLicenseInfo(nextProps.projectId);
    }
  }

  menuPrint() {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { viewId, recordId, appId, worksheetId, projectId, workId, instanceId } = this.props;
    this.setState({ showPrintGroup: false }, () => {
      let printData = {
        printId: '',
        isDefault: true, // 系统打印模板
        worksheetId,
        projectId: projectId,
        rowId: recordId,
        getType: 1,
        viewId,
        appId,
        workId,
        id: instanceId,
      };
      let printKey = Math.random().toString(36).substring(2);
      add({
        key: `${printKey}`,
        value: JSON.stringify(printData),
      });
      window.open(`/printForm/${workId ? 'workflow' : 'worksheet'}/new/print/${printKey}`);
    });
  }

  projectLicenseInfo = projectId => {
    const { tempList } = this.state;
    // 有word模版数据 请求权限
    if (!(tempList.length > 0 && tempList.filter(it => it.type === 2).length > 0)) {
      return;
    }
    if (!projectId) {
      this.setState({
        isNo: true,
      });
      return;
    } else {
      this.setState({
        isNo: false,
      });
    }
    let projects = md.global.Account.projects.filter(it => it.projectId === projectId);
    if (projects.length <= 0) {
      // 外部协作
      getProjectLicenseInfo({
        projectId: projectId,
      }).then(data => {
        let { version = [], licenseType } = data;
        let { versionId } = version;
        this.setState({
          /**
           * licenseType
           * 0: 过期
           * 1: 正式版
           * 2: 体验版
           */
          // 只有旗舰版/专业版可用
          isNo: !_.includes([2, 3], versionId) || licenseType === 0,
          isFree: licenseType === 0,
        });
      });
    } else {
      let { version = [], licenseType } = projects[0];
      let { versionId } = version;
      this.setState({
        isNo: !_.includes([2, 3], versionId) || licenseType === 0,
        isFree: licenseType === 0,
      });
    }
  };

  render() {
    const { viewId, recordId, appId, worksheetId, controls, projectId, sheetSwitchPermit } = this.props;
    const { tempList, showPrintGroup, isNo, isFree } = this.state;
    let attriData = controls.filter(it => it.attribute === 1);
    if (tempList.length <= 0) {
      return isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) ? (
        <MenuItemWrap
          className={cx('printItem', { hover: showPrintGroup })}
          icon={<Icon icon="print" className="Font17 mLeft5" />}
          onClick={() => {
            this.menuPrint();
          }}
        >
          <span className="mLeft15">{_l('打印')}</span>
        </MenuItemWrap>
      ) : (
        ''
      );
    } else {
      return (
        <Trigger
          popupVisible={showPrintGroup}
          onPopupVisibleChange={showPrintGroup => {
            this.setState({ showPrintGroup });
          }}
          popupClassName="DropdownPrintTrigger"
          action={['hover']}
          mouseEnterDelay={0.1}
          popupAlign={{ points: ['tl', 'tr'], offset: [1, -5], overflow: { adjustX: 1, adjustY: 2 } }}
          popup={
            <div className="">
              {/* 打印模板 */}
              {tempList.length > 0 && (
                <div
                  className={cx('tempList', {
                    noDefaultPrint: !isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId),
                  })}
                >
                  {tempList.map(it => {
                    return (
                      <MenuItemWrap
                        className=""
                        onClick={() => {
                          if (window.isPublicApp) {
                            alert(_l('预览模式下，不能操作'), 3);
                            return;
                          }
                          let printId = it.id;
                          let isDefault = it.type === 0;
                          if (isNo && !isDefault) {
                            upgradeVersionDialog({
                              projectId,
                              explainText: _l('Word批量打印是高级功能，请升级至付费版解锁开启'),
                              isFree,
                            });
                            return;
                          }
                          let printData = {
                            printId,
                            isDefault, // 系统打印模板
                            worksheetId,
                            projectId: projectId,
                            rowId: recordId,
                            getType: 1,
                            viewId,
                            appId,
                            name: it.name,
                            attriData: attriData[0],
                          };
                          let printKey = Math.random().toString(36).substring(2);
                          add({
                            key: `${printKey}`,
                            value: JSON.stringify(printData),
                          });
                          window.open(`/printForm/worksheet/preview/print/${printKey}`);
                        }}
                      >
                        <span title={it.name} className="Block overflow_ellipsis WordBreak">
                          {it.name}
                        </span>
                      </MenuItemWrap>
                    );
                  })}
                </div>
              )}
              {/* 系统打印权限 */}
              {isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) && (
                <MenuItemWrap
                  className={cx({ defaultPrint: tempList.length > 0 })}
                  onClick={() => {
                    this.menuPrint();
                  }}
                >
                  {_l('系统打印')}
                </MenuItemWrap>
              )}
            </div>
          }
        >
          <MenuItemWrap
            className={cx('printItem', { hover: showPrintGroup })}
            icon={<Icon icon="print" className="Font17 mLeft5" />}
          >
            <span className="mLeft15">
              {tempList.filter(o => o.type !== 0).length > 0 ? _l('打印/导出') : _l('打印')}
            </span>
            <Icon icon="arrow-right-tip" style={{ left: 'auto', right: 15 }} className="Font14 mLeft5" />
          </MenuItemWrap>
        </Trigger>
      );
    }
  }
}

import React, { Fragment } from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { MenuItem, Icon } from 'ming-ui';
import styled from 'styled-components';
import { getPrintList, getRowDetail } from 'src/api/worksheet';
import { add } from 'src/api/webCache';
import { generatePdf } from 'worksheet/common/PrintQrBarCode';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
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
  &.printItem.Item {
    .Item-content {
      padding-left: 32px;
    }
  }
`;

const SecTitle = styled.div`
  color: #999;
  font-size: 12px;
  margin: 12px 16px 4px;
`;

const FEATURE_ID = 20;

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
    onItemClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      showPrintGroup: false,
      tempList: [],
    };
  }

  componentDidMount() {
    const { viewId, worksheetId } = this.props;
    if (worksheetId) {
      getPrintList({
        worksheetId,
        viewId,
      }).then(tempList => {
        let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;
        this.setState({ tempList: list.sort((a, b) => a.type - b.type), tempListLoaded: true });
      });
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
      window.open(`${window.subPath || ''}/printForm/${appId}/${workId ? 'flow' : 'worksheet'}/new/print/${printKey}`);
    });
  }

  render() {
    const {
      viewId,
      recordId,
      appId,
      worksheetId,
      controls,
      projectId,
      sheetSwitchPermit,
      onItemClick = () => {},
    } = this.props;
    const { tempList, showPrintGroup } = this.state;
    let attriData = controls.filter(it => it.attribute === 1);
    const featureType = getFeatureStatus(projectId, FEATURE_ID);
    if (tempList.length <= 0) {
      return isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) ? (
        <MenuItemWrap
          className={cx('printItem', { hover: showPrintGroup })}
          icon={<Icon icon="print" className="Font17 mLeft5" />}
          onClick={() => {
            onItemClick();
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
                        icon={<Icon icon={getPrintCardInfoOfTemplate(it).icon} className="Font18" />}
                        onClick={async () => {
                          onItemClick();
                          if (window.isPublicApp) {
                            alert(_l('预览模式下，不能操作'), 3);
                            return;
                          }
                          if (_.includes([3, 4], it.type)) {
                            const data = await getRowDetail({
                              appId,
                              viewId,
                              worksheetId,
                              rowId: recordId,
                              getTemplate: true,
                            });
                            generatePdf({
                              templateId: it.id,
                              appId,
                              worksheetId,
                              viewId,
                              projectId,
                              selectedRows: [safeParse(data.rowData)],
                              controls: data.templateControls,
                              zIndex: 9999,
                            });
                          } else {
                            if (it.type !== 0 && featureType === '2') {
                              buriedUpgradeVersionDialog(projectId, FEATURE_ID);
                              return;
                            }
                            let printId = it.id;
                            let isDefault = it.type === 0;
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
                            window.open(
                              `${window.subPath || ''}/printForm/${appId}/worksheet/preview/print/${printKey}`,
                            );
                          }
                        }}
                      >
                        <div title={it.name} className="ellipsis templateName">
                          {it.name}
                        </div>
                        {_.includes([3, 4], it.type) && (
                          <span className="detail">{getPrintCardInfoOfTemplate(it).text}</span>
                        )}
                      </MenuItemWrap>
                    );
                  })}
                </div>
              )}
              {/* 系统打印权限 */}
              {isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) && (
                <Fragment>
                  <SecTitle>{_l('系统默认打印')}</SecTitle>
                  <MenuItemWrap
                    className={cx({ defaultPrint: tempList.length > 0 })}
                    onClick={() => {
                      onItemClick();
                      this.menuPrint();
                    }}
                  >
                    {_l('打印记录')}
                  </MenuItemWrap>
                </Fragment>
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

import React, { Component } from 'react';
import _ from 'lodash';
import { Popover } from 'ming-ui/antd-components';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import RecordCoverCard from 'src/pages/worksheet/components/RelateRecordCards/RecordCoverCard.jsx';
import { completeControls } from 'src/utils/domain/control/state';
import { getCoverUrl } from 'src/utils/domain/worksheet/view.js';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';

const POPOVER_STYLES = { container: { width: 300, maxHeight: 480, overflow: 'hidden auto' } };
const RECORD_CARD_STYLE = { border: 'none' };

// 关联记录卡片和下拉框支持在视图中hover显示卡片
export default class ViewHoverRelateRecordCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: null,
    };
  }

  renderCard = () => {
    const {
      control = {},
      record = {},
      projectId,
      appId,
      viewId,
      isCharge,
      sheetSwitchPermit,
      worksheetId,
      formData = [],
    } = this.props;
    const { showControls, relationControls = [], advancedSetting = {} } = control;
    const { chooseshowids } = advancedSetting;
    const chooseShowIds = safeParse(chooseshowids, 'array');
    const showControlIds = control.enumDefault === 1 && advancedSetting.showtype === '3' ? chooseShowIds : showControls;
    const coverCid = advancedSetting.choosecoverid;
    const controls = replaceControlsTranslateInfo(
      appId,
      worksheetId,
      completeControls([...formData, ...relationControls]),
    );
    const showFields = showControlIds
      .map(scid => _.find(controls, c => c.controlId === scid))
      .filter(_.identity)
      .filter(c => !_.includes([29, 30, 34, 51], c.type));

    const cover = getCoverUrl(coverCid, record, relationControls);
    const allowOpenRecord = advancedSetting.allowlink === '1';
    const { previewRecordId } = this.state;

    const handleClick = e => {
      e.stopPropagation();
      if (!allowOpenRecord) {
        return;
      }

      this.setState({ previewRecordId: record.rowid });
    };

    // 卡片经 Portal 渲染，React 事件仍会沿组件树冒泡到关联下拉的 Select，
    // 触发 toggleOpen 让单元格进入编辑态并销毁卡片，click 就走不到打开记录详情
    const handleMouseDown = e => {
      e.stopPropagation();
    };

    return (
      <div onMouseDown={handleMouseDown} onClick={handleClick}>
        <RecordCoverCard
          disabled={true}
          style={RECORD_CARD_STYLE}
          containerWidth={300}
          cover={cover}
          appId={appId}
          parentControl={control}
          controls={showFields}
          data={record}
          worksheetId={record.wsid}
          relationWorksheetId={worksheetId}
          projectId={projectId}
          viewId={viewId}
          isCharge={isCharge}
          sheetSwitchPermit={sheetSwitchPermit}
        />

        {!!previewRecordId && (
          <RecordInfoWrapper
            visible
            disableOpenRecordFromRelateRecord={
              _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView')
            }
            appId={appId}
            viewId={advancedSetting.openview || control.viewId}
            from={3}
            hideRecordInfo={() => {
              this.setState({ previewRecordId: undefined, popupVisible: false });
              if (_.isFunction(control.refreshRecord)) {
                control.refreshRecord();
              }
            }}
            projectId={projectId}
            recordId={previewRecordId}
            worksheetId={record.wsid}
            relationWorksheetId={worksheetId}
            isRelateRecord={true}
          />
        )}
      </div>
    );
  };

  render() {
    const { popupVisible, previewRecordId } = this.state;
    const { children, control = {} } = this.props;
    const { showControls = [], advancedSetting } = control;
    const chooseShowIds = safeParse(advancedSetting.chooseshowids, 'array');
    const showControlIds = control.enumDefault === 1 && advancedSetting.showtype === '3' ? chooseShowIds : showControls;

    if (
      browserIsMobile() ||
      !control.inView ||
      _.isEmpty(showControlIds) ||
      (control.enumDefault === 2 && control.advancedSetting.showtype === '3')
    ) {
      return children;
    }

    return (
      <Popover
        noPadding
        trigger="hover"
        mouseEnterDelay={0.5}
        content={this.renderCard}
        styles={POPOVER_STYLES}
        open={popupVisible}
        onOpenChange={visible => {
          this.setState({ popupVisible: !!previewRecordId || visible });
        }}
        placement="bottomLeft"
      >
        {children}
      </Popover>
    );
  }
}

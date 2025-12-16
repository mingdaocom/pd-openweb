import React, { Component } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import RecordCoverCard from 'src/pages/worksheet/components/RelateRecordCards/RecordCoverCard.jsx';
import { browserIsMobile } from 'src/utils/common';
import { completeControls } from 'src/utils/control';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { getCoverUrl } from 'src/utils/view.js';

const CardWrapper = styled.div`
  width: 300px;
  max-height: 480px;
  background-color: #fff;
  border-color: #eaeaea;
  overflow: hidden auto;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .hoverRelateRecordCard {
    border: none;
  }
`;

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

    return (
      <CardWrapper onClick={handleClick}>
        <RecordCoverCard
          className="hoverRelateRecordCard"
          disabled={true}
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
      </CardWrapper>
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
      <Trigger
        action={['hover']}
        mouseEnterDelay={0.5}
        popup={this.renderCard}
        popupStyle={{ zIndex: 1000 }}
        popupVisible={popupVisible}
        onPopupVisibleChange={visible => {
          this.setState({ popupVisible: !!previewRecordId || visible });
        }}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        {children}
      </Trigger>
    );
  }
}

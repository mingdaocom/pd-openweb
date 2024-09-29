import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Switch, Support, Button, Skeleton } from 'ming-ui';
import PublicWorksheetConfigForm from '../common/PublicWorksheetConfigForm';
import ConfigPanel from '../common/ConfigPanel';
import ShareUrl from 'worksheet/components/ShareUrl';
import * as actions from '../redux/actions';
import { VISIBLE_TYPE } from '../enum';
import _ from 'lodash';
import { renderLimitInfo, isDisplayPromptText, getDisabledControls } from '../utils';

function EnablePanel(props) {
  const {
    worksheetId,
    worksheetInfo,
    shareUrl,
    loadPublicWorksheet,
    updateWorksheetVisibleType,
    clear,
    setHederVisible,
    refreshShareUrl,
    worksheetSettings,
    originalControls,
    hidedControlIds,
    hideControl,
    projectId,
  } = props;
  const [formVisible, setFormVisible] = useState(/detail/.test(location.hash));
  const enabled = worksheetInfo.visibleType === VISIBLE_TYPE.PUBLIC;

  function updateFormVisible(value) {
    setHederVisible(!value);
    setFormVisible(value);
  }

  function onSwitchChange() {
    const newVisibleType = worksheetInfo.visibleType === VISIBLE_TYPE.PUBLIC ? VISIBLE_TYPE.CLOSE : VISIBLE_TYPE.PUBLIC;
    updateWorksheetVisibleType(newVisibleType, () => {
      if (newVisibleType === VISIBLE_TYPE.PUBLIC) {
        updateFormVisible(true);
      }
    });
  }

  const onHideControl = controlId => {
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings);
    const needHidedControlIds = hidedControlIds.concat(disabledControlIds);
    const curControl = originalControls.filter(item => item.controlId === controlId)[0] || {};
    let sectionList = [];
    if (curControl.type === 52) {
      sectionList = originalControls.filter(
        item => item.sectionId === controlId && !_.find(needHidedControlIds, h => h.controlId === item.controlId),
      );
      const updateControls = sectionList.concat(curControl);
      hideControl(updateControls.map(item => item.controlId));
    } else {
      if (!!curControl.sectionId) {
        const tabControl = originalControls.filter(item => item.controlId === curControl.sectionId)[0] || {};
        const showTabSectionList = originalControls.filter(
          item => item.sectionId === tabControl.controlId && !_.find(needHidedControlIds, id => id === item.controlId),
        );
        let needHideIds = [controlId];
        if (showTabSectionList.length === 1 && showTabSectionList[0].controlId === controlId) {
          //取消勾选标签页内最后一个字段，则取消勾选标签页
          needHideIds = [controlId, tabControl.controlId];
        }
        hideControl(needHideIds);
      } else {
        hideControl(controlId);
      }
    }
  };

  useEffect(() => {
    if (/detail/.test(location.hash)) {
      location.hash = '';
    }
    loadPublicWorksheet({ worksheetId });
    return () => {
      clear();
    };
  }, []);
  if (_.isEmpty(worksheetInfo)) {
    return (
      <div class="publicWorksheetEnablePanel">
        <div style={{ padding: 10 }}>
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['40%', '60%', '80%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </div>
      </div>
    );
  }
  if (formVisible) {
    return (
      <div className="publicWorksheetConfigCon flexRow">
        <ConfigPanel
          onCloseConfig={() => updateFormVisible(false)}
          enabled={enabled}
          onSwitchChange={onSwitchChange}
          onHideControl={onHideControl}
          projectId={projectId}
        />
        <PublicWorksheetConfigForm onHideControl={onHideControl} />
      </div>
    );
  }
  return (
    <div class="publicWorksheetEnablePanel">
      <h1>{_l('公开表单')}</h1>
      <div className="description">
        {_l('启用后，将表单公开发布给应用外的用户填写，为你的工作表收集数据')}
        <Support type={3} href="https://help.mingdao.com/worksheet/public-form" text={_l('帮助')} />
      </div>
      <Switch className="publishSwitch" checked={enabled} onClick={onSwitchChange} />
      <span className="status">{enabled ? _l('启用') : _l('关闭')}</span>
      {enabled && (
        <React.Fragment>
          {isDisplayPromptText(worksheetSettings) && (
            <div className="promptText mTop16">{renderLimitInfo(worksheetSettings)}</div>
          )}
          <ShareUrl
            copyShowText
            theme="light"
            className="mainShareUrl mTop16 mBottom20"
            url={shareUrl}
            refreshShareUrl={refreshShareUrl}
            customBtns={[
              {
                tip: _l('打开'),
                icon: 'launch',
                onClick: () => {
                  window.open(`${shareUrl}${window.isMDClient ? '?isMDClient=true' : ''}`);
                },
              },
            ]}
          />
          <Button onClick={() => updateFormVisible(true)}>{_l('表单设置')}</Button>
        </React.Fragment>
      )}
    </div>
  );
}

EnablePanel.propTypes = {
  worksheetInfo: PropTypes.shape({}),
  worksheetId: PropTypes.string,
  shareUrl: PropTypes.string,
  clear: PropTypes.func,
  loadPublicWorksheet: PropTypes.func,
  updateWorksheetVisibleType: PropTypes.func,
  setHederVisible: PropTypes.func,
};

const mapStateToProps = state => ({
  ..._.pick(state.publicWorksheet, [
    'shareUrl',
    'worksheetInfo',
    'worksheetSettings',
    'originalControls',
    'hidedControlIds',
  ]),
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EnablePanel);

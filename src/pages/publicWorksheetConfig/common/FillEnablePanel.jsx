import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Switch, Support, Button } from 'ming-ui';
import Skeleton from 'src/router/Application/Skeleton';
import PublicWorksheetConfigForm from '../common/PublicWorksheetConfigForm';
import ConfigPanel from '../common/ConfigPanel';
import ShareUrl from 'worksheet/components/ShareUrl';
import * as actions from '../redux/actions';
import { VISIBLE_TYPE } from '../enum';
import _ from 'lodash';
import { renderLimitInfo, isDisplayPromptText } from '../utils';

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
        <ConfigPanel onCloseConfig={() => updateFormVisible(false)} enabled={enabled} onSwitchChange={onSwitchChange} />
        <PublicWorksheetConfigForm />
      </div>
    );
  }
  return (
    <div class="publicWorksheetEnablePanel">
      <h1>{_l('公开表单')}</h1>
      <div className="description">
        {_l('启用后，将表单公开发布给应用外的用户填写，为你的工作表收集数据')}
        <Support type={3} href="https://help.mingdao.com/sheet8" text={_l('帮助')} />
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
            customBtns={[{ tip: _l('打开'), icon: 'launch', onClick: () => window.open(shareUrl) }]}
          />
          <Button size="mdbig" onClick={() => updateFormVisible(true)}>
            {_l('设置表单')}
          </Button>
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
  ..._.pick(state.publicWorksheet, ['shareUrl', 'worksheetInfo', 'worksheetSettings']),
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EnablePanel);

import React, { forwardRef, useEffect, useState } from 'react';
import appManagementApi from 'src/api/appManagement';
import { SHARECARDTYPS } from 'src/components/ShareCardConfig/config';
import ShareCardSetting from 'src/pages/FormSet/containers/Share/ShareCardSet';
import SectionTitle from './SectionTitle';
import WeChatSettings from './WeChatSettings';

const WeChatEnhance = forwardRef((props, ref) => {
  const { worksheetInfo = {}, data, setState, addWorksheetControl, handleSettingChanged } = props;
  const [weChatBind, setWeChatBind] = useState({ isBind: false });
  const [expandKeys, setExpandKeys] = useState({ share: false });

  useEffect(() => {
    getWeiXinBindingInfo();
  }, []);

  const getWeiXinBindingInfo = () => {
    appManagementApi.getWeiXinBindingInfo({ appId: worksheetInfo.appId }).then(res => {
      const value = { isBind: res && res.length, name: (res[0] || {}).nickName };
      setWeChatBind(value);
      setState({ weChatBind: value }, false);
    });
  };

  return (
    <div>
      <WeChatSettings
        projectId={worksheetInfo.projectId}
        data={data}
        weChatBind={weChatBind}
        setState={setState}
        addWorksheetControl={addWorksheetControl}
      />
      <SectionTitle
        title={_l('分享卡片')}
        isFolded={expandKeys.share}
        onClick={() => setExpandKeys({ ...expandKeys, share: !expandKeys.share })}
      />
      {!expandKeys.share && (
        <div className="mLeft25">
          <ShareCardSetting
            ref={ref}
            worksheetInfo={worksheetInfo}
            worksheetId={worksheetInfo.worksheetId}
            appId={worksheetInfo.appId}
            type={SHARECARDTYPS.PUBLICWORKSHEET}
            controls={[]}
            showTips={true}
            showBaseImg={true}
            handleSettingChanged={handleSettingChanged}
          />
        </div>
      )}
    </div>
  );
});

export default WeChatEnhance;

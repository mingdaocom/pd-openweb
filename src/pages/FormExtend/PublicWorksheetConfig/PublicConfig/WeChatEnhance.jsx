import React, { forwardRef, useState } from 'react';
import { SHARECARDTYPS } from 'src/components/ShareCardConfig/config';
import ShareCardSetting from 'src/pages/FormSet/containers/Share/ShareCardSet';
import SectionTitle from './SectionTitle';
import WeChatSettings from './WeChatSettings';

const WeChatEnhance = forwardRef((props, ref) => {
  const { worksheetInfo = {}, data, setState, addWorksheetControl, handleSettingChanged } = props;
  const [weChatBind, setWeChatBind] = useState({
    isBind: false,
    appId: data?.weChatSetting?.appId || '',
  });
  const [expandKeys, setExpandKeys] = useState({ share: false });

  return (
    <div>
      <WeChatSettings
        projectId={worksheetInfo.projectId}
        appId={worksheetInfo.appId}
        data={data}
        weChatBind={weChatBind}
        setState={setState}
        addWorksheetControl={addWorksheetControl}
        updateCurrentWeChatServiceAccount={({ weChatServiceAccounts, service }) => {
          service.name = service.nickName;
          service.isBind = weChatServiceAccounts.length;

          setWeChatBind(service);
          setState({ weChatBind: service });
        }}
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

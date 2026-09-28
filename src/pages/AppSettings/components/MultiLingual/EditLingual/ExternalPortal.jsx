import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';
import externalPortalApi from 'src/api/externalPortal';
import { getTranslateInfo } from 'src/utils/services/app';
import { LANG_DATA_TYPE } from '../config';
import { filterHtmlTag } from '../util';
import EditDescription from './EditDescription';
import EditInput from './EditInput';

export default function ExternalPortal(props) {
  const { app, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [portalData, setPortalData] = useState({ appId: '', portalSetModel: {} });
  const correlationId = app.id;
  const data = _.find(translateData, { correlationId }) || {};
  const translateInfo = data.data || {};
  const comparisonLangInfo = getTranslateInfo(app.id, null, correlationId, comparisonLangData);

  useEffect(() => {
    let isCurrent = true;

    externalPortalApi
      .getPortalSet({
        appId: app.id,
      })
      .then(data => {
        if (isCurrent) {
          setPortalData({ appId: app.id, portalSetModel: _.get(data, 'portalSetModel') || {} });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [app.id]);

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: '',
      correlationId,
      type: LANG_DATA_TYPE.app,
      data: {
        ...translateInfo,
        ...info,
      },
    });
  };

  if (portalData.appId !== app.id) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const { customizeName, pageTitle, userAgreement, privacyTerms } = portalData.portalSetModel;

  return (
    <div className="pAll20">
      <div className="Font14 bold mBottom20">{_l('外部门户')}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('门户名称')}</div>
        <Input
          className="flex mRight20"
          value={comparisonLangId ? comparisonLangInfo.portalName : customizeName}
          disabled={true}
        />
        <EditInput
          className="flex"
          disabled={!customizeName}
          value={translateInfo.portalName}
          onChange={value => handleSave({ portalName: value })}
        />
      </div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('登录页名称')}</div>
        <Input
          className="flex mRight20"
          value={comparisonLangId ? comparisonLangInfo.portalTitle : pageTitle}
          disabled={true}
        />
        <EditInput
          className="flex"
          disabled={!pageTitle}
          value={translateInfo.portalTitle}
          onChange={value => handleSave({ portalTitle: value })}
        />
      </div>
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('用户协议')}</div>
        <Input.TextArea
          style={{ resize: 'none' }}
          className="flex mRight20"
          value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.userAgreement : userAgreement)}
          disabled={true}
        />
        <EditDescription
          title={_l('用户协议')}
          value={translateInfo.userAgreement}
          originalValue={comparisonLangId ? comparisonLangInfo.userAgreement : userAgreement}
          onChange={value => handleSave({ userAgreement: value })}
        />
      </div>
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('隐私政策')}</div>
        <Input.TextArea
          style={{ resize: 'none' }}
          className="flex mRight20"
          value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.privacyTerms : privacyTerms)}
          disabled={true}
        />
        <EditDescription
          title={_l('隐私政策')}
          value={translateInfo.privacyTerms}
          originalValue={comparisonLangId ? comparisonLangInfo.privacyTerms : privacyTerms}
          onChange={value => handleSave({ privacyTerms: value })}
        />
      </div>
    </div>
  );
}

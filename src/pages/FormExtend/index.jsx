import React, { createRef, Fragment, useEffect, useRef, useState } from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { CardNav, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import ErrorState from 'src/components/errorPage/errorState';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import Header from 'src/components/worksheetConfigHeader';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper.jsx';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import VerifyModifyDialog from 'src/pages/widgetConfig/widgetSetting/components/VerifyModifyDialog';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { saveSelectExtensionNavType } from 'src/utils/worksheet';
import { NAV_LIST, NAV_NAME } from './enum';
import InvoiceConfig from './InvoiceConfig';
import PayConfig from './PayConfig';
import PublicQuery from './PublicQuery';
import PublicWorksheetConfig from './PublicWorksheetConfig';
import './index.less';

export default function FormExtend(props) {
  const { match = { params: {} } } = props;
  const { worksheetId, type } = match.params;
  const [worksheetInfo, setworksheetInfo] = useState({});
  const [{ configChanged, cancelActionCallback }, setConfigChangedInfo] = useState({});
  const { name, roleType, projectId } = worksheetInfo;
  useEffect(() => {
    worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(setworksheetInfo);
  }, []);
  const isloading = _.isEmpty(worksheetInfo);
  const hasCharge = [2, 4, 6].includes(roleType); //0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者 6:开发者+运营者
  const payConfigRef = createRef();
  const invoiceConfigRef = useRef();
  const featureType = !isloading && !hasCharge ? false : getFeatureStatus(projectId, VersionProductType.PAY);

  // 检查 支付/开票 配置信息是否保存
  const checkConfigChanged = (callback = () => {}) => {
    if (
      (type === 'pay' && payConfigRef?.current?.comparePayConfigData()) ||
      (type === 'invoice' && invoiceConfigRef?.current?.state?.settingChanged)
    ) {
      setConfigChangedInfo({ configChanged: true, cancelActionCallback: callback });
    } else {
      callback();
    }
  };

  const renderCon = () => {
    switch (type) {
      case 'publicform':
        return <PublicWorksheetConfig worksheetId={worksheetId} projectId={projectId} />;
      case 'query':
        return <PublicQuery worksheetId={worksheetId} worksheetInfo={worksheetInfo} projectId={projectId} />;
      case 'pay':
        return <PayConfig ref={payConfigRef} worksheetId={worksheetId} worksheetInfo={worksheetInfo} />;
      case 'invoice':
        return <InvoiceConfig ref={invoiceConfigRef} worksheetInfo={worksheetInfo} />;
      default:
        return <PublicWorksheetConfig worksheetId={worksheetId} projectId={projectId} />;
    }
  };

  const handleClickNav = type => {
    saveSelectExtensionNavType(worksheetId, 'extensionNav', type);
    checkConfigChanged(() => navigateTo(`/worksheet/form/edit/${worksheetId}/${type}`));
  };

  return (
    <div className="formExtendWrapper flexColumn">
      <Header
        worksheetId={worksheetId}
        worksheetName={name}
        saveLoading={false}
        onBack={({ redirectfn }) => {
          checkConfigChanged(redirectfn ? redirectfn : () => navigateToApp(worksheetId));
        }}
        onClose={() => checkConfigChanged(() => navigateToApp(worksheetId))}
      />
      {!isloading && !hasCharge && (
        <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateToApp(worksheetId)}
          />
        </div>
      )}

      {!isloading && hasCharge && (
        <div className="flex extensionWrap">
          <DocumentTitle title={_l('扩展功能 - %0 - %1', NAV_NAME[type || 'publicform'], name || '')} />
          <ScrollView className="sideNavBox">
            <div className="title">{_l('公开发布')}</div>
            <CardNav
              currentNav={type || 'publicform'}
              navList={NAV_LIST[0].map(item => ({
                ...item,
                url: `/worksheet/form/edit/${worksheetId}/${item.key}`,
                onClick: () => handleClickNav(item.key),
              }))}
            />
            {/* 应用管理员、开发者支 */}
            {featureType && _.includes([2, 4], roleType) && (
              <Fragment>
                <div className="title">{_l('支付与开票')}</div>
                <CardNav
                  currentNav={type}
                  navList={NAV_LIST[1].map(item => {
                    return {
                      ...item,
                      url: `/worksheet/form/edit/${worksheetId}/${item.key}`,
                      showUpgradeIcon: featureType === '2',
                      onClick: () => {
                        if (featureType === '2') {
                          buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                          return;
                        }
                        handleClickNav(item.key);
                      },
                    };
                  })}
                />
              </Fragment>
            )}
          </ScrollView>
          <ErrorBoundary>{renderCon()}</ErrorBoundary>
        </div>
      )}

      {configChanged && (
        <VerifyModifyDialog
          onOk={() => {
            setConfigChangedInfo({ configChanged: false });
            type === 'pay' ? payConfigRef?.current?.onSave() : invoiceConfigRef?.current?.onSave();
          }}
          onCancel={() => {
            setConfigChangedInfo({ configChanged: false });
          }}
          onClose={() => {
            setConfigChangedInfo({ configChanged: false });
            cancelActionCallback();
          }}
        />
      )}
    </div>
  );
}

FormExtend.propTypes = {
  match: PropTypes.shape({}),
};

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import worksheetAjax from 'src/api/worksheet';
import Header from 'src/components/worksheetConfigHeader';
import ErrorState from 'src/components/errorPage/errorState';
import FillEnablePanel from './common/FillEnablePanel';
import QueryEnablePanel from './common/QueryEnablePanel';
import './index.less';
import _ from 'lodash';

export default function PublicWorksheetConfig(props) {
  const { match = { params: {} } } = props;
  const { worksheetId } = match.params;
  const [worksheetInfo, setworksheetInfo] = useState({});
  const [hederVisible, setHederVisible] = useState(!/detail/.test(location.hash));
  const { name, roleType } = worksheetInfo;
  useEffect(() => {
    worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(setworksheetInfo);
  }, []);
  const isloading = _.isEmpty(worksheetInfo);
  const hasCharge = [2, 4].includes(roleType);//0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者
  return (
    <div className="publicWorksheetConfig flexColumn">
      {hederVisible && (
        <Header
          worksheetId={worksheetId}
          worksheetName={name}
          showSaveButton={false}
          saveLoading={false}
          onBack={() => navigateToApp(worksheetId)}
          onClose={() => navigateToApp(worksheetId)}
        />
      )}
      <DocumentTitle title={_l('设置公开表单 - %0', name || '')} />
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
        <div className="flex">
          <FillEnablePanel worksheetId={worksheetId} setHederVisible={setHederVisible} />
          <QueryEnablePanel worksheetId={worksheetId} worksheetInfo={worksheetInfo} />
        </div>
      )}
    </div>
  );
}

PublicWorksheetConfig.propTypes = {
  match: PropTypes.shape({}),
};

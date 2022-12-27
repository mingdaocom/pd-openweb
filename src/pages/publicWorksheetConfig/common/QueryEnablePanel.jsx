import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, Button } from 'ming-ui';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import Skeleton from 'src/router/Application/Skeleton';
import ShareUrl from 'worksheet/components/ShareUrl';
import QueryConfigDialog from './QueryConfigDialog';
import { VISIBLE_TYPE } from '../enum';
import _ from 'lodash';

export default function EnablePanel(props) {
  const { worksheetId, worksheetInfo } = props;
  const [queryInfo, setQueryInfo] = useState({});
  const [configVisible, setConfigVisible] = useState();
  const enabled = queryInfo.visibleType === VISIBLE_TYPE.PUBLIC;
  useEffect(() => {
    publicWorksheetAjax.getPublicQuery({ worksheetId }).then(data => {
      if (!data.title) {
        data.title = _l('查询%0', worksheetInfo.name);
      }
      data.queryControlIds = (data.queryControlIds || []).filter(cid =>
        _.find(worksheetInfo.template.controls, c => c.controlId === cid),
      );
      setQueryInfo(data);
    });
  }, []);
  if (_.isEmpty(queryInfo)) {
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
  return (
    <div class="publicWorksheetEnablePanel">
      <h1>{_l('公开查询')}</h1>
      <div className="description">
        {_l('启用后，生成用于公开查询数据的链接，用于订单查询、成绩查询、登记信息查询等场景')}
      </div>
      <Switch
        className="publishSwitch"
        checked={enabled}
        onClick={() => {
          const newVisibleType =
            queryInfo.visibleType === VISIBLE_TYPE.PUBLIC ? VISIBLE_TYPE.CLOSE : VISIBLE_TYPE.PUBLIC;
            publicWorksheetAjax.editPublicQueryState({
            worksheetId,
            visibleType: newVisibleType,
          }).then(url => {
            setQueryInfo({ ...queryInfo, url, visibleType: newVisibleType });
            if (newVisibleType === VISIBLE_TYPE.PUBLIC) {
              setConfigVisible(true);
            }
          });
        }}
      />
      <span className="status">{enabled ? _l('启用') : _l('关闭')}</span>
      {enabled && (
        <React.Fragment>
          <ShareUrl
            theme="light"
            copyShowText
            className="mainShareUrl mTop15 mBottom20"
            url={queryInfo.url}
            customBtns={[{ tip: _l('打开'), icon: 'launch', onClick: () => window.open(queryInfo.url) }]}
          />
          <Button size="mdbig" onClick={() => setConfigVisible(true)}>
            {_l('设置查询链接')}
          </Button>
        </React.Fragment>
      )}
      {configVisible && (
        <QueryConfigDialog
          queryInfo={{ ...queryInfo, worksheet: worksheetInfo }}
          onClose={() => setConfigVisible(false)}
          onSuccess={data => setQueryInfo(data)}
        />
      )}
    </div>
  );
}

EnablePanel.propTypes = {
  worksheetId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
};

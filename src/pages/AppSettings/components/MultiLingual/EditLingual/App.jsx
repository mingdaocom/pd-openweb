import React, { Fragment, useState } from 'react';
import { Input } from 'antd';
import EditInput from './EditInput';
import EditDescription from './EditDescription';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';
import { filterHtmlTag } from '../util';

export default function App(props) {
  const { app, translateData, comparisonLangId, comparisonLangData, selectNode, onEditAppLang } = props;
  const [editAppIntroVisible, setEditAppIntroVisible] = useState(false);
  const data = _.find(translateData, { correlationId: app.id }) || {};
  const translateInfo = data.data || {};
  const comparisonLangInfo = getTranslateInfo(app.id, null, app.id, comparisonLangData);

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: '',
      correlationId: app.id,
      type: LANG_DATA_TYPE.app,
      data: {
        ...translateInfo,
        ...info
      }
    });
  }

  return (
    <Fragment>
      <div className="pAll20">
        <div className="Font14 bold mBottom20">{getTranslateInfo(app.id, null, app.id).name || selectNode.name}</div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('应用名称')}</div>
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : selectNode.name} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.name}
            onChange={value => handleSave({ name: value })}
          />
        </div>
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('应用说明')}</div>
          <Input.TextArea
            style={{ resize: 'none' }}
            className="flex mRight20" value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.description : selectNode.description)}
            disabled={true}
          />
          <EditDescription
            value={translateInfo.description}
            originalValue={selectNode.description}
            onChange={value => handleSave({ description: value })}
          />
        </div>
      </div>
    </Fragment>
  );
}

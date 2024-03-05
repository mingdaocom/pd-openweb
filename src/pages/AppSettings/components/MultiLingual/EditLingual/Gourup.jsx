import React, { Fragment, useState, useEffect } from 'react';
import { Input } from 'antd';
import EditInput from './EditInput';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';

export default function Gourup(props) {
  const { app, translateData, comparisonLangId, comparisonLangData, selectNode, onEditAppLang } = props;
  const data = _.find(translateData, { correlationId: selectNode.key }) || {};
  const translateInfo = data.data || {};

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: app.id,
      correlationId: selectNode.key,
      type: LANG_DATA_TYPE.section,
      data: {
        ...translateInfo,
        ...info
      }
    });
  }

  const name = comparisonLangId ? getTranslateInfo(app.id, selectNode.key, comparisonLangData).name : selectNode.originalTitle;

  return (
    <div className="pAll20">
      <div className="Font14 bold mBottom20">{translateInfo.name || selectNode.originalTitle}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('分组名称')}</div>
        <Input className="flex mRight20" value={name} disabled={true} />
        <EditInput
          className="flex"
          disabled={!name}
          value={translateInfo.name}
          onChange={value => handleSave({ name: value })}
        />
      </div>
    </div>
  );
}

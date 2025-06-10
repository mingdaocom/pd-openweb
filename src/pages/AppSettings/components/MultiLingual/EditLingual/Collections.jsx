import React, { Fragment, useState } from 'react';
import { Input } from 'antd';
import { ScrollView } from 'ming-ui';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

export default function Collections(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const { collections } = app;
  const data = _.find(translateData, { correlationId: selectNode.key }) || {};
  const translateInfo = data.data || {};
  const comparisonLangInfo = getTranslateInfo(app.id, null, selectNode.key, comparisonLangData);
  const { collectionId, name, options = [] } = _.find(collections, { collectionId: selectNode.key }) || {};

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: app.id,
      correlationId: selectNode.key,
      type: LANG_DATA_TYPE.collections,
      data: {
        ...translateInfo,
        ...info,
      },
    });
  };

  const renderOption = option => {
    return (
      <div className="flexRow alignItemsCenter nodeItem">
        <Input
          className="flex mRight20"
          value={comparisonLangId ? comparisonLangInfo[option.key] : option.value}
          disabled={true}
        />
        <EditInput
          className="flex"
          value={translateInfo[option.key]}
          onChange={value => handleSave({ [option.key]: value })}
        />
      </div>
    );
  };

  return (
    <ScrollView className="flex">
      <div className="pAll20">
        <div className="Font14 bold mBottom20">
          {getTranslateInfo(app.id, null, selectNode.key).name || selectNode.title}
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('选项集名称')}</div>
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : name} disabled={true} />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('选项')}</div>
          <div className="flex">{options.filter(n => !n.isDeleted).map(renderOption)}</div>
        </div>
      </div>
    </ScrollView>
  );
}

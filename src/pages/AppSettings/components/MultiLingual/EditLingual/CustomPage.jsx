import React, { Fragment, useState, useEffect } from 'react';
import { LoadDiv } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import EditDescription from './EditDescription';
import customApi from 'statistics/api/custom.js';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';
import { filterHtmlTag } from '../util';

export default function CustomPage(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const data = _.find(translateData, { correlationId: selectNode.key }) || {};
  const translateInfo = data.data || {};

  useEffect(() => {
    if (selectNode.externalLinkInfo) {
      setLoading(false);
      setDesc(selectNode.externalLinkInfo.desc);
    } else {
      setLoading(true);
      customApi.getPage({
        appId: selectNode.key,
      }).then(data => {
        setLoading(false);
        setDesc(data.desc);
      });
    }
  }, [selectNode.key]);

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: selectNode.parentId,
      correlationId: selectNode.key,
      type: LANG_DATA_TYPE.customePage,
      data: {
        ...translateInfo,
        ...info
      }
    });
  }

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const comparisonLangInfo = getTranslateInfo(app.id, null, selectNode.key, comparisonLangData);

  return (
    <div className="pAll20">
      <div className="Font14 bold mBottom20">{translateInfo.name || selectNode.originalTitle}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('自定义页面名称')}</div>
        <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : selectNode.originalTitle} disabled={true} />
        <EditInput
          className="flex"
          value={translateInfo.name}
          onChange={value => handleSave({ name: value })}
        />
      </div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('自定义页面说明')}</div>
        <Input.TextArea style={{ resize: 'none' }} className="flex mRight20" value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.description : desc)} disabled={true} />
        <EditDescription
          value={translateInfo.description}
          originalValue={desc}
          onChange={value => handleSave({ description: value })}
        />
      </div>
    </div>
  );
}

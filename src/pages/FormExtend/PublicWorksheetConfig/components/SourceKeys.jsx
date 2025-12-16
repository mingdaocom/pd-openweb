import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { TextBlock } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import { themes } from '../../enum';
import { getPageConfig } from '../../utils';
import AppearanceConfig from '../AppearanceConfig';

const Con = styled.div`
  :hover .delete {
    display: inline-block;
  }
  :hover .index {
    display: none;
  }
`;

const No = styled.span`
  margin-right: 10px;
  font-size: 14px;
  line-height: 36px;
  width: 24px;
  text-align: center;
  .delete {
    cursor: pointer;
    display: none;
    font-size: 18px;
    color: #9e9e9e;
  }
`;

const ThemeBox = styled.div`
  border-radius: 3px;
  height: 36px;
  width: 36px;
  line-height: 36px;
  background-color: #f1f1f1;
  text-align: center;
  margin-left: 6px;
`;

export default function ({
  url,
  sourceKeys,
  pageConfigs = '[]',
  onDelete = () => {},
  handleUpdateExpandDatas = () => {},
}) {
  const [open, setOpen] = useState();

  const getThemeBgColor = (key = '') => {
    const config = getPageConfig(pageConfigs, key);
    const { themeBgColor, themeColor } = config;

    if (!themeBgColor) {
      return !themes[themeColor] ? '#1677ff' : (themes[themeColor] || {}).main;
    } else {
      return themeBgColor;
    }
  };

  const handleDelete = (key, index) => {
    const configs = safeParse(pageConfigs);
    const newConfigs = configs.filter(l => l.key !== key);

    handleUpdateExpandDatas({ pageConfigs: JSON.stringify(newConfigs) });
    onDelete(index);
  };

  return sourceKeys.map((key, index) => (
    <Fragment>
      <Con key={key} className="mBottom6 flexRow">
        <No>
          <span className="index">{index + 1}</span>
          <i className="icon icon-trash delete" onClick={() => handleDelete(key, index)}></i>
        </No>
        <TextBlock className="ellipsis" style={{ width: 104, marginRight: 6 }}>
          {key}
        </TextBlock>
        <ShareUrl className="flex overflowHidden" url={url + `?source=${encodeURIComponent(key)}`} />
        <ThemeBox className="Hand" onClick={() => setOpen(key)}>
          <Icon icon="task-color" className="Gray_75 Font22 LineHeight36" />
        </ThemeBox>
      </Con>
      <AppearanceConfig
        pageConfigKey={key}
        theme={getThemeBgColor(key)}
        open={key === open}
        pageConfigs={pageConfigs}
        saveExtendDatas={handleUpdateExpandDatas}
        onClose={() => setOpen(undefined)}
      />
    </Fragment>
  ));
}

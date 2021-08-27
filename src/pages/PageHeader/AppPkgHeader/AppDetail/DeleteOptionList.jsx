import React, { useState, useEffect } from 'react';
import { LoadDiv, ScrollView, Dialog } from 'ming-ui';
import { getQuoteControlsById } from 'src/api/worksheet';
import styled from 'styled-components';
import { groupBy, keys, find } from 'lodash';
import { useFetchData } from '../../../widgetConfig/hooks';

const OptionQuoteWrap = styled.div`
  height: 300px;
  .appWrap {
    margin-top: 12px;
    &:first-child {
      margin-top: 0;
    }
  }
  .quoteControlsWrap {
    margin-top: 8px;
  }
  .quote {
    line-height: 32px;
  }
  .separate {
    margin: 0 4px;
  }
`;
export default function DeleteOptionList({ collectionId, name, ...rest }) {
  const [loading, data] = useFetchData(getQuoteControlsById, { collectionId }, { deps: [collectionId] });
  const groupData = groupBy(data, 'appId');
  return (
    <Dialog
      visible
      confirm="danger"
      description={<span className="Gray_9e">{_l('此选项集正在被以下选项使用，删除后这些选项将不可用')}</span>}
      title={
        <span className="Bold" style={{ color: '#f44336' }}>
          {_l('删除选项集 “%0”', name)}
        </span>
      }
      {...rest}>
      <OptionQuoteWrap>
        <ScrollView>
          {loading ? (
            <LoadDiv />
          ) : (
            keys(groupData).map(key => {
              const { appName } = find(data, item => item.appId === key);
              return (
                <div key={key} className="appWrap">
                  <div className="appName Bold">{appName}</div>
                  <div className="quoteControlsWrap">
                    {groupData[key].map(({ controlId, controlName, worksheetName }) => {
                      return (
                        <div key={controlId} className="quote">
                          <span>{worksheetName}</span>
                          <span className="separate">{'-'}</span>
                          <span>{controlName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </ScrollView>
      </OptionQuoteWrap>
    </Dialog>
  );
}

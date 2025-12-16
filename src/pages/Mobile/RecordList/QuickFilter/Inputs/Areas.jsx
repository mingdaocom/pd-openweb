import React, { useRef } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { CityPicker, Icon } from 'ming-ui';

const AreaCon = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  .addBtn {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;
const AreaItem = styled.span`
  max-width: ${props => (props.isMultiple ? '100%' : 'calc(100% - 20px)')};
  display: inline-block;
  height: 28px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  line-height: 28px;
  overflow: hidden;
  .userAvatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .userName {
    display: inline-block;
    width: calc(100% - 42px);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 18px 0 8px;
    vertical-align: middle;
  }
`;

export default function Areas(props) {
  const { values = [], control, isMultiple, onChange = () => {}, projectId } = props;
  const { chooserange = 'CN', commcountries } = control.advancedSetting;
  const tempArea = useRef();

  const deleteCurrentArea = item => {
    onChange({ values: values.filter(v => v.id !== item.id) });
  };

  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <AreaCon>
        {values.map(item => (
          <AreaItem isMultiple={isMultiple}>
            <span className="userName 12">{item.name}</span>
            <Icon icon="close" onClick={() => deleteCurrentArea(item)} />
          </AreaItem>
        ))}
        {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
          <CityPicker
            level={control.enumDefault2}
            chooserange={chooserange}
            commcountries={commcountries}
            showConfirmBtn={true}
            projectId={projectId}
            callback={area => {
              if (_.last(area)) {
                tempArea.current = {
                  name: area.map(c => c.name).join('/'),
                  id: _.last(area).id,
                };
              }
            }}
            onClear={() => {
              tempArea.current = null;
              onChange({ values: [] });
            }}
            handleClose={() => {
              if (tempArea.current) {
                onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
              }
            }}
          >
            <span className="addBtn">
              <Icon icon="add" />
            </span>
          </CityPicker>
        )}
        {!isMultiple && !_.isEmpty(values) && (
          <CityPicker
            level={control.enumDefault2}
            chooserange={chooserange}
            commcountries={commcountries}
            showConfirmBtn={true}
            projectId={projectId}
            callback={area => {
              if (_.last(area)) {
                tempArea.current = {
                  name: area.map(c => c.name).join('/'),
                  id: _.last(area).id,
                };
              }
            }}
            onClear={() => {
              tempArea.current = {};
              onChange({ values: [] });
            }}
            handleClose={() => {
              if (tempArea.current) {
                onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
              }
            }}
          >
            <Icon icon="arrow-right-border" className="rightArrow" />
          </CityPicker>
        )}
      </AreaCon>
    </div>
  );
}

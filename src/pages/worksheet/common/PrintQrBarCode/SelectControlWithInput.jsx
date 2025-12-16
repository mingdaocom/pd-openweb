import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { FlexCenter, VerticalMiddle } from 'worksheet/components/Basics';
import ControlSelect from 'worksheet/components/ControlSelect';

const Title = styled.div`
  font-size: 13px;
  color: #222;
  margin: 14px 0 10px;
  .compressWidth {
    float: right;
    font-size: 18px;
    color: #9e9e9e;
    cursor: pointer;
    &.on {
      color: #1677ff;
    }
  }
`;

const Con = styled.div`
  height: 36px;
  display: flex;
  &.notAllow {
    cursor: not-allowed;
    .dropdownBtn {
      cursor: not-allowed;
    }
  }
`;

const Content = styled(VerticalMiddle)`
  overflow: hidden;
  display: flex;
  flex: 1;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 3px 0 0 3px;
  input {
    width: 100%;
    border: none;
    padding: 0px;
  }
  i.setName {
    cursor: pointer;
    font-size: 20px;
    margin-right: 10px;
    color: #9d9d9d;
  }
  .hoverShow {
    display: none;
  }
  &.text {
    cursor: text;
  }
  &:hover {
    .hoverShow {
      display: inline-block;
    }
  }
`;

const Tag = styled.div`
  display: inline-block;
  max-width: 100%;
  margin-right: 6px;
  border-radius: 12px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  padding: 0 8px 0 12px;
  font-size: 12px;
  box-sizing: border-box;
  height: 24px;
  line-height: 22px;
  max-width: 100%;
  .close {
    color: #9e9e9e;
    margin-left: 4px;
    cursor: pointer;
  }
`;

const Selected = styled.div`
  width: 100%;
  flex: 1;
  .staticValue {
    width: 100%;
  }
`;

const DropdownBtn = styled(FlexCenter)`
  cursor: pointer;
  font-size: 22px;
  color: #bdbdbd;
  width: 36px;
  height: 100%;
  border: 1px solid #d9d9d9;
  border-left: none;
  border-radius: 0 3px 3px 0;
`;

function StaticInput(props) {
  const { value, isEditing, onChange, onBlur } = props;
  const inputRef = useRef();
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  return isEditing ? (
    <input ref={inputRef} value={value} type="text" onChange={e => onChange(e.target.value)} onBlur={onBlur} />
  ) : (
    <div className="staticValue ellipsis">{value}</div>
  );
}

const EditShowNameCon = styled.div`
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;

function EditShowName(props) {
  const { name, onCancel, onChange } = props;
  const [value, setValue] = useState(name);
  return (
    <Dialog
      visible
      title={_l('重命名')}
      onCancel={onCancel}
      onOk={() => {
        onChange(value);
        onCancel();
      }}
    >
      <EditShowNameCon>
        <Input className="w100" value={value} onChange={setValue} />
      </EditShowNameCon>
    </Dialog>
  );
}

export default function SelectControlWithInput(props) {
  const {
    index,
    type = 2,
    forceInLine = false,
    name,
    value,
    disabled,
    className,
    style,
    controls,
    onChange = () => {},
  } = props;
  const [textEditing, setTextEditing] = useState();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const sourceControl = type === 1 && _.find(controls, { controlId: value });
  function update(changes = {}) {
    onChange(
      Object.assign(
        {
          type,
          name,
          value,
          forceInLine,
        },
        changes,
      ),
    );
  }
  return (
    <React.Fragment>
      <Title className="flexRow alignItemsCenter">
        <span className="flex"> {_l('字段%0', index + 1)}</span>
        <Tooltip title={_l('强制单行')}>
          <i
            className={cx('icon-compress_width compressWidth', { on: forceInLine })}
            onClick={() => {
              update({
                forceInLine: !forceInLine,
              });
            }}
          ></i>
        </Tooltip>
      </Title>
      <ControlSelect
        disabled={disabled}
        controls={controls}
        isAppendToBody
        offset={[0, 2]}
        popupStyle={{ width: 272 }}
        onChange={newControl => {
          update({
            type: 1,
            value: newControl.controlId,
          });
        }}
      >
        <Con className={className + (disabled ? ' notAllow' : '')} style={style}>
          <Content
            className={type === 2 ? 'text' : ''}
            onClick={e => {
              if (type === 2) {
                setTextEditing(true);
                e.stopPropagation();
              }
            }}
          >
            <Selected>
              {type === 1 && sourceControl && (
                <Tag>
                  {name || sourceControl.controlName}
                  <i
                    className="icon-close close"
                    onClick={e => {
                      setTextEditing(true);
                      update({
                        type: 2,
                        value: '',
                      });
                      e.stopPropagation();
                    }}
                  ></i>
                </Tag>
              )}
              {type === 2 && (
                <StaticInput
                  value={value}
                  isEditing={textEditing}
                  onChange={newValue => {
                    update({
                      type: 2,
                      value: newValue,
                    });
                  }}
                  onBlur={() => setTextEditing(false)}
                />
              )}
            </Selected>
            {!disabled && type === 1 && (
              <Tooltip title={_l('重命名')}>
                <i
                  className="icon-rename_input setName"
                  onClick={e => {
                    e.stopPropagation();
                    setEditNameVisible(true);
                  }}
                ></i>
              </Tooltip>
            )}
          </Content>
          <Tooltip title={_l('使用动态值')} placement="bottom">
            <DropdownBtn className="dropdownBtn">
              <i className="icon-workflow_other"></i>
            </DropdownBtn>
          </Tooltip>
        </Con>
      </ControlSelect>
      {editNameVisible && (
        <EditShowName
          name={name || _.get(sourceControl, 'controlName') || ''}
          onCancel={() => setEditNameVisible(false)}
          onChange={newName => {
            update({
              name: newName,
            });
          }}
        />
      )}
    </React.Fragment>
  );
}

SelectControlWithInput.propTypes = {
  className: string,
  style: shape({}),
  type: number,
  value: string,
  controls: arrayOf(shape({})),
  onChange: func,
};

import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { canSetAsTitle, getIconByType } from 'src/pages/widgetConfig/util';
import ConcatenateSetting from 'src/pages/widgetConfig/widgetSetting/settings/concatenate.jsx';

const Wrap = styled.div`
  .fieldsWrap .fieldList li {
    max-width: 100%;
  }
  .tagInputarea .CodeMirror .CodeMirror-lines {
    padding: 3px 0;
  }
  .CodeMirror-sizer {
    min-height: 36px;
    .CodeMirror-placeholder {
      line-height: 28px !important;
      color: #bdbdbd !important;
      padding-left: 10px !important;
    }
  }
  .isolate {
    bottom: 100%;
  }
`;

function TitleDrop(props) {
  const { advancedSetting, worksheetControls, handleChange, controls } = props;
  const { viewtitle } = advancedSetting;
  const [{ titleControl }, setState] = useSetState({
    titleControl: worksheetControls.find(o => (viewtitle ? o.controlId === viewtitle : o.attribute === 1)) || {},
  });

  useEffect(() => {
    const { viewtitle } = advancedSetting;
    setState({
      titleControl: worksheetControls.find(o => (viewtitle ? o.controlId === viewtitle : o.attribute === 1)) || {},
    });
  }, [advancedSetting, worksheetControls]);

  return (
    <Dropdown
      className={cx('dropAbstract', { placeholder: !titleControl })}
      data={controls}
      value={!titleControl.controlId ? undefined : titleControl.controlId}
      border
      // cancelAble
      maxHeight={260}
      style={{ width: '100%' }}
      onChange={value => {
        if (value === titleControl.controlId) {
          return;
        }
        if (!value) {
          handleChange('');
        } else {
          handleChange(value);
        }
      }}
      placeholder={_l('记录标题')}
    />
  );
}

export default function (props) {
  const { isCard, advancedSetting, className, worksheetControls, handleChange, title } = props;
  const { viewtitle } = advancedSetting;
  const controls = worksheetControls
    .filter(o => canSetAsTitle(o) && !_.includes(ALL_SYS, o.controlId))
    .map(it => {
      return {
        ...it,
        value: it.controlId,
        text: it.controlName,
        iconName: getIconByType(it.type, false),
      };
    });
  return (
    <Wrap className={className}>
      <div className="title Font13 bold"> {title || _l('标题')}</div>
      {!isCard && <div className="Gray_75 mTop8 Font13">{_l('指定显示在时间块上的内容')}</div>}
      <div className="settingContent mTop8">
        {isCard ? (
          <TitleDrop {...props} controls={controls} />
        ) : (
          <ConcatenateSetting
            data={{
              type: 32,
              dataSource: viewtitle,
            }}
            placeholder={_l('记录标题')}
            classNames={'mTop0'}
            hideTitle
            withSYS={false}
            allControls={controls}
            onChange={data => {
              handleChange(data.dataSource);
            }}
          />
        )}
      </div>
    </Wrap>
  );
}

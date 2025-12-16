import React, { useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { TagTextarea } from 'ming-ui';
import { Button } from 'ming-ui';

const Wrap = styled.div`
  .viewCodeTagTextarea {
    max-width: 500px;
    .CodeMirror {
      min-height: 300px;
      max-width: 500px;
    }
  }
  .saveBtn,
  .cancelBtn {
    line-height: 32px;
    min-height: 32px;
    padding: 0 16px;
    border-radius: 3px;
    min-width: 0;
  }
  .cancelBtn {
    font-size: 14px;
    background: #f5f5f5;
    &:hover {
      background: #eaeaea;
    }
    font-weight: bold;
    display: inline-block;
    box-sizing: border-box;
    text-shadow: none;
    border: none;
    outline: none;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
  }
`;
export default function (props) {
  const tagtextarea = useRef(null);
  const { view, updateCurrentView } = props;
  const [{ environmentparams, version }, setState] = useSetState({
    environmentparams: _.get(view, 'advancedSetting.environmentparams') || '',
    version: 0,
  });

  const saveConfig = () => {
    let value = {};
    if (_.get(tagtextarea, 'current.props.defaultValue')) {
      try {
        value = JSON.parse(_.get(tagtextarea, 'current.props.defaultValue'));
      } catch (error) {
        console.log(error);
        return alert(_l('请输入正确的格式'), 3);
      }
      if (!(_.isObject(value) && !_.isArray(value))) {
        return alert(_l('请输入正确的格式'), 3);
      }
    }
    updateAdvancedSetting(
      {
        environmentparams: JSON.stringify(value),
      },
      () => {
        alert(_l('更新配置成功'));
      },
    );
  };
  const updateAdvancedSetting = (data, cb) => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: data,
        editAdKeys: Object.keys(data),
        editAttrs: ['advancedSetting'],
      }),
      cb,
    );
  };

  return (
    <Wrap>
      <div className="Gray_75 mTop10">
        {_l(
          '配置插件运行时所需要的环境参数，采用JSON格式。优先读取应用中配置的参数，应用中未配置时读取组织中配置的参数。',
        )}
      </div>
      <TagTextarea
        className={cx('flex mTop10 viewCodeTagTextarea')}
        defaultValue={environmentparams}
        codeMirrorMode="javascript"
        getRef={tag => (tagtextarea.current = tag)}
        // lineNumbers
        key={JSON.stringify(version)}
        height={0}
        onChange={(err, value) => {
          if (!err) {
            setState({
              environmentparams: value,
            });
          }
        }}
      />
      <div className="footer pTop12 pBottom12 mTop10">
        <Button
          type="primary"
          onClick={() => {
            if (
              props.saveViewSetLoading ||
              _.isEqual(environmentparams, _.get(props.view, 'advancedSetting.environmentparams'))
            )
              return;

            saveConfig();
          }}
          className="saveBtn"
          disabled={
            props.saveViewSetLoading ||
            _.isEqual(environmentparams, _.get(props.view, 'advancedSetting.environmentparams'))
          }
        >
          {_l('更新配置')}
        </Button>
        <div
          className="cancelBtn Hand Gray_75 mLeft16"
          onClick={() => {
            setState({
              environmentparams: _.get(view, 'advancedSetting.environmentparams') || '',
              version: version + 1,
            });
          }}
        >
          {_l('恢复默认')}
        </div>
      </div>
    </Wrap>
  );
}

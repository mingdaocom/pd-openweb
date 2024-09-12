import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Markdown, Input, Radio, RichText, LoadDiv } from 'ming-ui';
import privateLegalApi from 'src/api/privateLegal';
import { translateNames } from './index';

const AddLegalDialog = props => {
  const { onCancel } = props;
  const [loading, setLoading] = useState(true);
  const [legal, setLegal] = useState(props.legal || {});

  useEffect(() => {
    if (legal.legalId) {
      privateLegalApi.getLegalDetailById({
        legalId: legal.legalId
      }).then(data => {
        setLegal(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const onChange = data => {
    setLegal({
      ...legal,
      ...data
    });
  }
  const onSave = () => {
    if (!legal.name) {
      alert(_l('请输入名称'), 3);
      return;
    }
    if (!legal.key) {
      alert(_l('请输入访问路径'), 3);
      return;
    }
    if (!legal.content) {
      alert(_l('请输入协议内容'), 3);
      return;
    }
    if (legal.legalId) {
      privateLegalApi.editLegal(
        _.pick(legal, ['legalId', 'name', 'key', 'type', 'content'])
      ).then(data => {
        if (data) {
          alert(_l('保存成功'));
          props.onSave();
          onCancel();
        }
      });
    } else {
      privateLegalApi.addLegal(
        _.pick(legal, ['name', 'key', 'type', 'content'])
      ).then(data => {
        if (data) {
          alert(_l('保存成功'));
          props.onSave();
          onCancel();
        }
      });
    }
  }

  const wdith = document.body.clientWidth - 160;

  return (
    <Dialog
      visible
      anim={false}
      overlayClosable={false}
      title={legal.legalId ? _l('编辑') : _l('添加')}
      width={wdith > 1600 ? 1600 : wdith}
      onOk={onSave}
      onCancel={onCancel}
    >
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="flexRow">
            <div className="flexRow alignItemsCenter flex mRight20">
              <div className="mRight10">{_l('名称')}</div>
              <Input className="flex" value={translateNames[legal.name] || legal.name} onChange={value => onChange({ name: value })} />
            </div>
            <div className="flexRow alignItemsCenter flex">
              <div className="mRight10">{_l('访问路径')}</div>
              <Input
                className="flex"
                value={legal.key}
                disabled={legal.preset}
                onChange={value => onChange({ key: value.replace(/[\u4e00-\u9fa5]/g, '').replace(/\s/g, '') })}
                placeholder={_l('如：notice')}
              />
            </div>
          </div>
          <div className="mTop20 mBottom20">
            <div className="mBottom5">{_l('内容')}</div>
            <div className="flexRow alignItemsCenter">
              {[{ text: _l('富文本'), value: 1 }, { text: 'Markdown', value: 2 }].map((item, index) => (
                <Radio
                  key={index}
                  text={item.text}
                  checked={legal.type === item.value}
                  onClick={() => {
                    onChange({ type: item.value });
                  }}
                />
              ))}
            </div>
          </div>
          {legal.type === 1 ? (
            <RichText
              data={legal.content || ''}
              showTool={true}
              onActualSave={(html) => {
                onChange({ content: html });
              }}
            />
          ) : (
            <Markdown
              value={legal.content}
              height={'auto'}
              onSave={value => {
                onChange({ content: value });
              }}
            />
          )}
        </Fragment>
      )}
    </Dialog>
  );
}

export default AddLegalDialog;

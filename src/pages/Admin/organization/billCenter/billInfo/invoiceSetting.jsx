import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Dialog, Input, RadioGroup } from 'ming-ui';
import projectAjax from 'src/api/project';
import { invoiceConfig, newInvoiceConfig } from './config';

const InvoiceSettingWrap = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  &.newInvoiceConfig {
    transition: max-height ease-in 0.25s;
    max-height: 0;
    overflow: hidden;
    &.expanded {
      max-height: 400px;
    }
  }
  li {
    flex-shrink: 0;
    padding: 8px 0;
    line-height: 36px;
    width: 100%;
    &.half {
      width: 48%;
    }
    .name {
      font-weight: 400;
    }
    input {
      width: 100%;
    }
  }
`;

const InvoiceContentWrap = styled.div`
  overflow: auto;
`;

const SaveInvoice = styled.div`
  text-align: right;
`;

export default function InvoiceSetting(props) {
  const { projectId, onClose } = props;
  const [data, setData] = useSetState({});

  useEffect(() => {
    projectAjax.getProjectFinance({ projectId }).then(data => {
      setData(data);
    });
  }, []);

  const saveSetting = () => {
    const saveApi = () => {
      projectAjax
        .updateProjectFinance({ projectId, ...data, invoiceType: data.invoiceType || 1 })
        .then(() => {
          alert(_l('保存成功'));
        })
        .finally(() => {
          onClose();
        });
    };

    let isFieldFill = true;

    invoiceConfig
      .filter(l => l.require)
      .forEach(item => {
        if (!data[item.key]) {
          isFieldFill = false;
          alert(_l('%0属于必填项，请填写后提交', item.text), 2);
          return;
        }
      });

    if (data.invoiceType === 2 && isFieldFill) {
      newInvoiceConfig.forEach(item => {
        if (!data[item.key]) {
          isFieldFill = false;
          alert(_l('%0属于必填项，请填写后提交', item.text), 2);
          return;
        }
      });
    }

    if (!isFieldFill) return;

    saveApi();
  };
  return (
    <Dialog
      visible
      width={480}
      title={<div className="Font17">{_l('发票设置')}</div>}
      style={{ maxHeight: '80%', overflow: 'auto', paddingBottom: 0 }}
      onCancel={onClose}
      footer={
        <SaveInvoice>
          <Button style={{ borderRadius: '16px' }} onClick={saveSetting}>
            {_l('保存')}
          </Button>
        </SaveInvoice>
      }
    >
      <InvoiceContentWrap>
        <InvoiceSettingWrap>
          {invoiceConfig.map(item => {
            const { key, text, verify, half, require = false } = item;
            return (
              <li className={cx({ half })} key={key}>
                <div className="name">
                  {require && <span className="Red mRight3">*</span>}
                  {text}
                </div>
                <Input
                  value={data[key]}
                  onChange={value => setData({ [key]: value })}
                  placeholder={_l('请输入%0', text)}
                  onBlur={e => {
                    const value = e.target.value;
                    if (verify && value && !verify.test(value)) {
                      setData({ [key]: '' });
                      alert(_l('%0填写格式有误', text), 2);
                    }
                  }}
                />
              </li>
            );
          })}
        </InvoiceSettingWrap>
        <RadioGroup
          style={{ marginTop: '16px' }}
          data={[
            { value: 1, text: _l('普票') },
            { value: 2, text: _l('增票') },
          ]}
          checkedValue={data.invoiceType || 1}
          onChange={value => setData({ invoiceType: value })}
        />

        <InvoiceSettingWrap className={cx('newInvoiceConfig', { expanded: data.invoiceType === 2 })}>
          {newInvoiceConfig.map(item => {
            const { key, text, verify, require } = item;
            return (
              <li key={key}>
                <div className="name">
                  {require && <span className="Red mRight3">*</span>}
                  {text}
                </div>
                <Input
                  value={data[key]}
                  onChange={value => setData({ [key]: value })}
                  placeholder={_l('请输入%0', text)}
                  onBlur={e => {
                    const value = e.target.value;
                    if (verify && value && !verify.test(value)) {
                      alert(_l('%0填写格式有误', text), 2);
                      setData({ [key]: '' });
                    }
                  }}
                />
              </li>
            );
          })}
        </InvoiceSettingWrap>
      </InvoiceContentWrap>
    </Dialog>
  );
}

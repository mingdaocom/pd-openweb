import React, { Fragment, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, VerifyPasswordInput } from 'ming-ui';
import { Dropdown, Input, Modal, Select } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import { getVerifyValueError } from 'src/utils/domain/security/verification';

const SectionName = styled.div`
  font-size: 13px;
  color: var(--color-text-title);
  font-weight: 500;
  margin: 0 0 8px;
  position: relative;
  &.withVerify {
    margin-top: 18px;
  }
  &.required {
    &:before {
      position: absolute;
      left: -10px;
      top: 3px;
      color: var(--color-error);
      content: '*';
    }
  }
`;

const TEMPLATE_MENU_STYLE = {
  maxHeight: 250,
  overflowX: 'hidden',
  overflowY: 'auto',
};
const REMARK_TEXT_AREA_AUTO_SIZE = { minRows: 1, maxRows: 10 };
const REMARK_TEXT_AREA_STYLES = { textarea: { paddingBlock: 9, maxHeight: 240 } };

export default function CustomButtonConfirm(props) {
  const {
    title,
    description,
    okText,
    cancelText,
    enableRemark,
    remarkName,
    remarkHint,
    remarkRequired,
    verifyPwd,
    onOk,
    onClose,
    remarkoptions,
    remarktype,
    projectId,
  } = props;

  const getInit = () => {
    let remark = '';
    let list = (_.get(safeParse(remarkoptions), 'template') || []).filter(item => item.selected);

    if (list.length) {
      remark = list[0].value;
    }

    return remark;
  };

  const [{ needPassWord, checkIsPending, remark, showTemplateList, removeNoneVerification, verifyInfo }, setState] =
    useSetState({
      needPassWord: false,
      checkIsPending: !!verifyPwd,
      remark: getInit(),
      showTemplateList: false,
      removeNoneVerification: false,
      verifyInfo: {},
    });
  const remarkRef = useRef();
  useEffect(() => {
    if (verifyPwd) {
      verifyPassword({
        projectId,
        checkNeedAuth: true,
        success: () => {
          setState({ checkIsPending: false });
        },
        fail: result => {
          setState({ checkIsPending: false, needPassWord: true, removeNoneVerification: result === 'showPassword' });
        },
      });
    }

    if (remarkRef.current && !remarkoptions) {
      remarkRef.current.focus();
    }
  }, [projectId, remarkoptions, setState, verifyPwd]);
  /**
   * 意见只能选择模板
   */
  const renderSelectTemplate = () => {
    const options = (_.get(safeParse(remarkoptions), 'template') || []).map(item => {
      return {
        value: item.value,
        label: item.value,
      };
    });
    let param = {
      placeholder: remarkHint,
    };

    if (remark) {
      param.defaultValue = remark;
    }

    return (
      <Select
        showSearch
        allowClear
        className="w100"
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        notFoundContent={<span className="textTertiary">{_l('无匹配结果')}</span>}
        getPopupContainer={triggerNode => triggerNode.parentElement}
        onChange={value => setState({ remark: value })}
        onClear={() => setState({ remark: '' })}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
        options={options}
        {...param}
      />
    );
  };

  /**
   * 渲染可输入的审批意见
   */
  const renderRemarkInput = () => {
    const items = (_.get(safeParse(remarkoptions), 'template') || [])
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.value.indexOf(remark) > -1)
      .map(({ item, index }) => ({
        key: `${index}`,
        label: item.value,
        onClick: () => setState({ remark: item.value, showTemplateList: false }),
      }));

    return (
      <Dropdown
        open={showTemplateList && !!items.length}
        trigger={['click']}
        placement="bottomLeft"
        onOpenChange={open => setState({ showTemplateList: open })}
        menu={{ items, style: TEMPLATE_MENU_STYLE }}
      >
        <div>
          <Input.TextArea
            ref={remarkRef}
            autoSize={REMARK_TEXT_AREA_AUTO_SIZE}
            styles={REMARK_TEXT_AREA_STYLES}
            value={remark}
            onChange={event => setState({ remark: event.target.value, showTemplateList: true })}
            placeholder={remarkHint}
          />
        </div>
      </Dropdown>
    );
  };

  const handleOk = () => {
    if (enableRemark && remarkRequired && !(remark || '').trim()) {
      alert(_l('%0不能为空', remarkName), 3);
      return;
    }

    if (verifyPwd && needPassWord) {
      const error = getVerifyValueError(verifyInfo);

      if (error) {
        alert(error, 3);
        return;
      }

      verifyPassword({
        projectId,
        ...verifyInfo,
        showVerifyType: true,
        closeImageValidation: true,
        success: () => {
          onOk({ remark });
          onClose();
        },
      });
    } else {
      onOk({ remark });
      onClose();
    }
  };

  return (
    <Modal
      open
      className="customButtonConfirm customButtonConfirmDialog"
      title={title}
      onCancel={onClose}
      onOk={handleOk}
      okText={okText || _l('确定')}
      cancelText={cancelText || _l('取消')}
      confirmLoading={checkIsPending}
      mask={{ closable: true }}
      styles={{ body: { overflow: 'initial' } }}
    >
      {description && (
        <div className="Font14 textSecondary mBottom10" style={{ marginTop: -10 }}>
          {description}
        </div>
      )}
      {verifyPwd && needPassWord && (
        <VerifyPasswordInput
          autoFocus={true}
          isRequired={true}
          showVerifyType={true}
          allowNoVerify={!removeNoneVerification}
          onChange={verifyInfo => setState({ verifyInfo })}
        />
      )}
      {enableRemark && (
        <Fragment>
          <SectionName className={cx({ required: remarkRequired, withVerify: verifyPwd && needPassWord })}>
            {remarkName || _l('备注')}
          </SectionName>
          <div className="Relative">
            {remarktype === '1' && !!safeParse(remarkoptions).template ? renderSelectTemplate() : renderRemarkInput()}
          </div>
        </Fragment>
      )}
    </Modal>
  );
}

import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Select } from 'ming-ui/antd-components';
import { sanitizeLinkTextHtml } from 'src/utils/core/sanitizeHtml';
import { browserIsMobile } from 'src/utils/platform/browser/device';

const WrapCon = styled.div`
  .controlDropdown {
    min-height: 48px;
  }
`;

function Drop(props) {
  const { updateCompany = () => {}, updateState = () => {}, info = {} } = props;
  const openSearch = !browserIsMobile();
  const [{ extraDatas, warnList }, setState] = useSetState({
    extraDatas: {},
    warnList: [],
  });

  useEffect(() => {
    setState({
      extraDatas: props.extraDatas,
      warnList: props.warnList,
    });
  }, [props, setState]);

  const selectedValues = _.get(extraDatas, `${info.id}`) || [];
  const isMultiple = info.multiple === 1;

  return (
    <WrapCon>
      <Select
        mode={isMultiple ? 'multiple' : undefined}
        allowClear={isMultiple}
        showPopupSearch={openSearch}
        optionFilterProp="searchText"
        value={isMultiple ? selectedValues : selectedValues[0]}
        className={'w100 controlDropdown flexRow alignItemsCenter'}
        onChange={value => {
          updateState({
            warnList: _.filter(warnList, it => it.tipDom !== `.${info.id}`),
          });
          updateCompany({
            extraDatas: {
              ...extraDatas,
              [info.id]: isMultiple ? value : value === undefined ? [] : [value],
            },
          });
        }}
        options={(info.options || []).map(option => ({
          value: option.id,
          searchText: option.name,
          // 创建组织的自定义选项需要通过 a 标签跳转（如伙伴政策），因此仅开放经过安全清洗的链接 HTML。
          label: <span dangerouslySetInnerHTML={{ __html: sanitizeLinkTextHtml(option.name) }} />,
        }))}
        onOpenChange={props.onVisibleChange}
      />
    </WrapCon>
  );
}

export default Drop;

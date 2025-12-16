import React, { Fragment, useState } from 'react';
import ClipboardButton from 'react-clipboard.js';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Menu, MenuItem, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { getAdvanceSetting } from '../../../util/setting';
import DeleteDialog from './DelateDialog';

const MenuWrap = styled(Menu)`
  width: 160px !important;
  position: relative !important;
  &.List--withIconFront {
    .Item-content {
      padding-left: 16px !important;
      &:hover {
        i {
          color: #fff;
        }
      }
      i {
        font-size: 16px;
        margin-right: 5px;
      }
    }
  }
`;

export default function MoreOption(props) {
  const {
    data = {},
    colorful,
    options = [],
    globalSheetInfo = {},
    addOption = () => {},
    setOptionList = () => {},
    handleChange = () => {},
  } = props;
  const { dataSource, controlName } = data;
  const { appId } = globalSheetInfo;
  const { showtype } = getAdvanceSetting(data);
  const [{ moreVisible, deleteVisible }, setVisible] = useState({
    moreVisible: false,
    deleteVisible: false,
  });
  const hasOther = _.find(options, i => i.key === 'other' && !i.isDeleted);
  // 已删除控件
  const deleteOptions = options.filter(i => i.isDeleted);

  const sortOptions = isAsc => {
    const newOptions = options.sort(
      ({ value: aValue = '', key: aKey = '' } = {}, { value: bValue = '', key: bKey = '' } = {}) => {
        if (aKey === 'other' && bKey !== 'other') return 1;
        if (bKey === 'other' && aKey !== 'other') return -1;
        if (aKey === 'other' && bKey === 'other') return 0;
        // 其他项按升降序排列
        return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      },
    );
    handleChange({ options: newOptions.map((i, idx) => ({ ...i, index: idx + 1 })) });
  };

  const getCopyValue = () => {
    const copyOptions = options.filter(i => !i.isDeleted);
    return copyOptions.reduce((p, c, i) => (i === options.length - 1 ? `${p}${c.value}` : `${p}${c.value}\n`), '');
  };

  const toOptionList = () => {
    Dialog.confirm({
      title: <span className="Bold">{_l('转为选项集')}</span>,
      width: 480,
      description: (
        <span>
          {_l('转为选项集后，在其他工作表也可以使用这组选项。')}
          <Support href="https://help.mingdao.com/worksheet/option-set" type={3} text={_l('帮助')} />
        </span>
      ),
      onOk: () => {
        worksheetAjax
          .saveOptionsCollection({ appId, colorful, options, name: controlName })
          .then(({ code, data, msg }) => {
            if (code === 1) {
              const { collectionId } = data;
              setOptionList(data);
              handleChange({ dataSource: collectionId });
            } else {
              alert(msg);
            }
          });
      },
    });
  };

  return (
    <Fragment>
      <Trigger
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [5, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popupVisible={moreVisible}
        onPopupVisibleChange={visible => setVisible({ moreVisible: visible })}
        popup={
          <MenuWrap>
            {showtype !== '2' && (
              <Tooltip title={_l('显示系统预设选项:其他。用户选择其他后,可输入补充信息')} placement="left">
                <MenuItem
                  disabled={hasOther}
                  onClick={() => {
                    if (!hasOther) {
                      addOption(() => setVisible({ moreVisible: false }));
                    }
                  }}
                >
                  {_l('显示其他项')}
                </MenuItem>
              </Tooltip>
            )}
            <MenuItem onClick={() => sortOptions(true)}>{_l('按拼音A-Z排序')}</MenuItem>
            <MenuItem onClick={() => sortOptions(false)}>{_l('按拼音Z-A排序')}</MenuItem>
            <Tooltip title={_l('将当前字段的所有选项复制为文本,用于为其他选项字段批量添加相同选项')} placement="left">
              <MenuItem>
                <ClipboardButton
                  component="span"
                  data-clipboard-text={getCopyValue()}
                  onSuccess={() => {
                    alert(_l('复制成功，请去批量添加选项'));
                    setVisible({ moreVisible: false });
                  }}
                >
                  {_l('复制所有选项')}
                </ClipboardButton>
              </MenuItem>
            </Tooltip>

            {!_.isEmpty(data) && !dataSource && showtype !== '2' && (
              <Tooltip
                title={_l('将自定义选项转换为选项集，实现在应用中统一维护，并被其他字段引用。')}
                placement="left"
              >
                <MenuItem
                  onClick={() => {
                    toOptionList();
                    setVisible({ moreVisible: false });
                  }}
                >
                  {_l('转为选项集')}
                </MenuItem>
              </Tooltip>
            )}

            {!dataSource && showtype !== '2' && deleteOptions.length > 0 && (
              <MenuItem onClick={() => setVisible({ deleteVisible: true, moreVisible: false })}>
                {_l('查看已删除选项(%0)', deleteOptions.length)}
              </MenuItem>
            )}
          </MenuWrap>
        }
      >
        <div className="setOption">
          <span className="pointer">{_l('更多操作')}</span>
        </div>
      </Trigger>

      {deleteVisible && (
        <DeleteDialog
          options={options}
          colorful={colorful}
          onCancel={() => setVisible({ deleteVisible: false })}
          onOk={newOptions => {
            handleChange({ options: newOptions });
          }}
        />
      )}
    </Fragment>
  );
}

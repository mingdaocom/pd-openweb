import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { formatQuickFilter } from 'src/utils/filter';

const hyphenList = [
  { value: 0, label: _l('空格') + '( )', optionLabel: ' ' },
  { value: 1, label: _l('破折号') + '(-)', optionLabel: '-' },
  { value: 2, label: _l('下划线') + '(_)', optionLabel: '_' },
  { value: 3, label: _l('点') + '(.)', optionLabel: '.' },
];

const nameMethodList = [
  { value: 0, name: _l('记录标题'), example: _l('张三') },
  { value: 1, name: _l('字段名'), example: _l('身份证照片') },
  { value: 2, name: _l('文件原始名'), example: _l('身份证人像面.jpg') },
];

const Container = styled.div`
  font-size: 14px;
  .nameMethodWrap {
    align-items: center;
    height: 32px;
    .Checkbox {
      width: unset !important;
      margin-bottom: 0px;
    }
    .width6 {
      width: 6px;
    }
  }
`;

const { Option } = Select;

class ExportAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hyphen: '-', // 示例
      hyphenValue: 1, //命名方式-连接符
      nameMethodValues: nameMethodList.map(it => it.value), // 选中命名方式
      selectControlIds:
        !_.isEmpty(props.attachmentControls) && props.attachmentControls.length === 1
          ? props.attachmentControls.map(it => it.controlId)
          : [], // 选中字段id
      generateFolder: false, // 为每行记录生成一个文件夹
    };
  }
  checkControlVisible(item) {
    if (!item) return false;

    const { advancedSetting } = item;
    const alldownload = advancedSetting.alldownload || '1';
    const allowdownload = advancedSetting.allowdownload || '1';
    const isDownload = alldownload === '1' || allowdownload === '1';
    const controlPermissions = item.controlPermissions || '111';
    const fieldPermission = item.fieldPermission || '111';
    return fieldPermission[0] === '1' && controlPermissions[0] === '1' && isDownload;
  }

  handleExport = () => {
    const {
      appId,
      viewId,
      worksheetId,
      quickFilter = [],
      filtersGroup = [],
      navGroupFilters,
      selectRowIds = [],
      searchArgs: { filterControls, keyWords, searchType },
    } = this.props;
    const { selectControlIds, hyphenValue, generateFolder, nameMethodValues } = this.state;
    if (!selectControlIds.length) {
      alert(_l('至少选择一个附件字段'), 3);
      return;
    }
    const params = {
      appId,
      viewId,
      worksheetId,
      rowsEstablishRolderType: generateFolder,
      connectorType: hyphenValue,
      controlIDs: selectControlIds,
      fileJointNames: nameMethodValues,
      filterControls,
      keyWords,
      searchType,
      filtersGroup,
      navGroupFilters,
      fastFilters: formatQuickFilter(quickFilter),
      rowIds: selectRowIds,
      isGetWorksheet: true,
    };

    window
      .mdyAPI('', '', params, {
        ajaxOptions: {
          url: `${md.global.Config.AjaxApiUrl}File/DownloadRowsBatchFile`,
        },
        customParseResponse: true,
      })
      .then(res => {
        if (res && res.exception) {
          alert(res.exception, 2);
        }
      });

    this.props.onCancel();
  };

  render() {
    const { onCancel = () => {}, attachmentControls = [], isCharge } = this.props;
    const { hyphen, hyphenValue, nameMethodValues = [], selectControlIds = [], generateFolder } = this.state;

    const exampleArr = nameMethodList.filter(it => _.includes(nameMethodValues, it.value));
    const visibleAttachmentControls = attachmentControls.filter(item => this.checkControlVisible(item));

    return (
      <Dialog
        className="exportSheet"
        visible
        anim={false}
        title={_l('批量导出附件')}
        width={530}
        okText={_l('导出')}
        onCancel={onCancel}
        onOk={this.handleExport}
      >
        <Container>
          <div className="Gray_9e mBottom30">
            {_l('选择需要导出的附件字段，导出附件总数不超过1000个，总大小不超过1GB')}
          </div>
          <div className="bold mBottom10">{_l('选择导出的附件字段')}</div>
          {visibleAttachmentControls.map(item => {
            return (
              <Checkbox
                key={item.controlId}
                size="small"
                text={
                  <Fragment>
                    {item.controlName || ''}
                    {isCharge && !this.checkControlVisible(item) && (
                      <Icon type="workflow_hide" className="Font14 Gray_9e mLeft5" />
                    )}
                  </Fragment>
                }
                checked={_.includes(selectControlIds, item.controlId)}
                onClick={checked => {
                  let copyIds = [...selectControlIds];
                  copyIds = checked ? copyIds.filter(v => v !== item.controlId) : copyIds.concat(item.controlId);
                  this.setState({ selectControlIds: copyIds });
                }}
              ></Checkbox>
            );
          })}
          <div className="bold mTop20">{_l('命名方式')}</div>
          <div className="nameMethodWrap flexRow">
            {nameMethodList.map((it, index) => {
              return (
                <Fragment key={it.value}>
                  <Checkbox
                    size="small"
                    text={it.name}
                    checked={_.includes(nameMethodValues, it.value)}
                    onClick={checked => {
                      if (nameMethodValues.length <= 1 && checked) {
                        return alert(_l('至少选择一种命名方式'), 3);
                      }
                      let copyNameMethodValues = [...nameMethodValues];
                      copyNameMethodValues = checked
                        ? copyNameMethodValues.filter(v => v !== it.value)
                        : copyNameMethodValues.concat(it.value);
                      this.setState({ nameMethodValues: copyNameMethodValues });
                    }}
                  ></Checkbox>
                  {index < nameMethodList.length - 1 && <span className="mLeft16 mRight16 width6">{hyphen}</span>}
                </Fragment>
              );
            })}

            {nameMethodValues.length > 1 && (
              <Fragment>
                <span className="mLeft40 mRight7">{_l('连接符')}</span>
                <Select
                  style={{ width: 65 }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 120 }}
                  optionLabelProp="optionLabel"
                  value={hyphenValue}
                  onChange={(value, option) => {
                    this.setState({ hyphen: option.optionLabel, hyphenValue: value });
                  }}
                >
                  {hyphenList.map(v => (
                    <Option value={v.value} optionLabel={v.optionLabel}>
                      {v.label}
                    </Option>
                  ))}
                </Select>
              </Fragment>
            )}
          </div>
          {!_.isEmpty(nameMethodValues) && (
            <div className="Gray_9e mTop10 Font13">
              {_l('示例：')}
              {exampleArr.map((v, i) => {
                return (
                  <Fragment>
                    <span>{v.example}</span>
                    {i < exampleArr.length - 1 && <span>{hyphen}</span>}
                  </Fragment>
                );
              })}
            </div>
          )}
          <div className="bold mBottom10 mTop30">{_l('选项')}</div>
          <Checkbox
            size="small"
            text={_l('为每行记录生成一个文件夹')}
            checked={generateFolder}
            onClick={checked => this.setState({ generateFolder: !checked })}
          />
          <div className="Gray_9e Font13">{_l('文件夹名和附件名的最大长度为90个汉字。超限的文件不会被导出。')}</div>
        </Container>
      </Dialog>
    );
  }
}

export const exportAttachment = props => functionWrap(ExportAttachment, props);

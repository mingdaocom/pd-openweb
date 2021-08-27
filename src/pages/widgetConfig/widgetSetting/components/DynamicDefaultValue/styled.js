import styled from 'styled-components';

const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

export const DynamicValueInputWrap = styled(FlexCenter)`
  position: relative;
  .tagTextAreaWrap {
    width: calc(100% - 36px);
  }
  .CodeMirror-code {
    line-height: 28px;
  }
  .tagInputarea {
    .tagInputareaIuput {
      border-radius: 3px 0 0 3px;
      min-height: 36px;
      .CodeMirror {
        .CodeMirror-lines {
          padding: 3px 0;
        }
        .CodeMirror-sizer {
          min-height: auto !important;
        }
      }
    }
  }
  .otherFieldWrap {
    box-sizing: border-box;
    width: calc(100% - 36px);
    padding: 5px 8px;
    min-height: 36px;
    line-height: 32px;
    font-size: 14px;
    word-break: break-all;
    border: 1px solid #ccc;
    border-radius: 3px 0 0 3px;
  }
`;
export const OtherFieldWrap = styled(FlexCenter)`
  margin-right: 6px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  padding: 0 12px;
  font-size: 12px;
  box-sizing: border-box;
  height: 24px;
  margin-top: 5px;
  &.timeField {
    margin: 0 6px 0 12px;
  }
  &.haveCloseIcon {
    padding: 0 6px 0 12px;
  }
  &.deleted {
    background-color: #eaeaea;
    color: #9e9e9e;
    border: #ddd;
  }
  /* 文本默认值标签样式 */
  &.tagTextField {
    margin: 0;
  }
  .recordName {
    margin: 0 6px;
    color: #789dba;
  }
  &:hover {
    i {
      color: rgba(51, 51, 51, 0.4);
    }
  }
  i {
    margin-left: 6px;
    color: rgba(51, 51, 51, 0.2);
  }
`;

export const SelectOtherFieldWrap = styled(FlexCenter)`
  position: absolute;
  box-sizing: border-box;
  right: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  justify-content: center;
  transition: all 0.25s;
  color: #bdbdbd;
  &:hover {
    color: #2196f3;
  }
  i {
    font-size: 22px;
  }
`;

export const UserInfo = styled(FlexCenter)`
  border-radius: 24px;
  background-color: #e5e5e5;
  padding-right: 8px;
  font-size: 13px;
  line-height: 24px;
  margin: 5px 6px 0 0;
  .fullName {
    margin: 0 5px;
  }

  .avatar {
    width: 24px;
    border-radius: 50%;
  }

  .removePerson {
    cursor: pointer;
    .icon-close {
      color: #bdbdbd;
      &:hover {
        color: #9e9e9e;
      }
    }
  }
`;

export const OtherFieldList = styled(FlexCenter)`
  flex-wrap: wrap;
  width: calc(100% - 36px);
  box-sizing: border-box;
  width: calc(100% - 36px);
  padding: 0 6px 5px 12px;
  min-height: 36px;
  line-height: 32px;
  font-size: 14px;
  word-break: break-all;
  border: 1px solid #ccc;
  border-radius: 3px 0 0 3px;
  background: ${props => (props.isHaveUniqueField ? '#f8f8f8' : '#fff')};
`;

export const RelateControl = styled(FlexCenter)`
  background: #f0f0f0;
  padding: 0 12px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 5px;
  span {
    margin: 0 4px;
  }
`;

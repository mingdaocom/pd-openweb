import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, LoadDiv } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import fixedDataController from 'src/api/fixedData';

const DialogWrap = styled(Dialog)`
  height: 560px !important;
  max-height: 560px !important;
  .mui-dialog-header {
    border-bottom: 1px solid #ddd;
    display: none;
  }
  .mui-dialog-body {
    padding: 0 !important;
    overflow: hidden !important;
  }
  .Gray_15 {
    color: #151515;
  }
  .container {
    height: 100%;
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }
  .sidebarWrap {
    width: 200px;
    background-color: #fafafa;
  }
  .sidebarItem {
    height: 36px;
    line-height: 36px;
    padding: 0 24px;
    cursor: pointer;
    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }
    &.active {
      font-weight: bold;
      color: #2196f3;
      background-color: #e3f3ff;
    }
  }
  .shortcutSection {
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
    padding: 0 36px 20px;
    overflow-y: auto;
  }
  .shortcutItem {
    height: 36px;
  }
  .shortcutKey {
    min-width: 24px;
    height: 24px;
    line-height: 24px;
    padding: 0px 5px;
    text-align: center;
    border-radius: 3px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    margin-left: 6px;
    font-family: -apple-system、Segoe UI Variable Display、Segoe UI-MONOSPACE;
  }
  .subTitle {
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 10px;
  }
  .sectionTitle {
    margin-top: 30px;
    font-size: 14px;
    font-weight: bold;
    color: #151515;
  }
`;

export default function KeyboardShortcuts(props) {
  const { visible, onClose = () => {} } = props;
  const [activeSection, setActiveSection] = useState(0);
  const [shortcutsData, setShortcutsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fixedDataController
      .loadHostKeys({ langType: getCurrentLangCode() })
      .then(res => {
        setShortcutsData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // 检测操作系统
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? 'shortcut-mac' : 'shortcut-win';

  const renderShortcut = shortcut => {
    if (!shortcut[shortcutKey]) return null;
    return shortcut[shortcutKey].split(' ').map((v, index) => (
      <span key={index} className="shortcutKey">
        {v}
      </span>
    ));
  };

  const renderShortcutsList = shortcuts => {
    if (!shortcuts || shortcuts.length === 0) return null;

    return shortcuts.map((shortcut, index) => (
      <div key={index} className="shortcutItem flexRow alignItemsCenter">
        <span className="Gray_15 flex">{shortcut.action}</span>
        {renderShortcut(shortcut)}
      </div>
    ));
  };

  const renderContent = (data, level = 0) => {
    if (!data) return null;

    return (
      <div className="mTop8">
        {data.shortcuts && renderShortcutsList(data.shortcuts)}

        {data.children &&
          data.children.map((child, index) => (
            <div key={index}>
              {child.section && (
                <div className={level === 0 ? 'sectionTitle subTitle' : 'mTop20 Gray_75'}>{child.section}</div>
              )}

              {renderContent(child, level + 1)}
            </div>
          ))}
      </div>
    );
  };

  const renderSection = (section, sectionIndex) => {
    return (
      <div key={sectionIndex} className="shortcutSection">
        <div className="Font18 bold mTop18 mBottom8">{section.section}</div>
        <div className="Gray_75">{section.description}</div>
        <div className="sectionContent mTop20">{renderContent(section)}</div>
      </div>
    );
  };

  return (
    <DialogWrap
      className="keyboardShortcutsDialog"
      visible={visible}
      title={null}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {loading ? (
        <div className="container justifyCenter alignItemsCenter">
          <LoadDiv />
        </div>
      ) : (
        <div className="container">
          <div className="sidebarWrap">
            <div className="mTop18 mBottom20 pLeft24 bold Font17">{_l('键盘快捷键')}</div>
            {shortcutsData.map((section, index) => (
              <div
                key={index}
                className={`sidebarItem ${activeSection === index ? 'active' : ''}`}
                onClick={() => setActiveSection(index)}
              >
                {section.section}
              </div>
            ))}
          </div>
          {renderSection(shortcutsData[activeSection], activeSection)}
        </div>
      )}
    </DialogWrap>
  );
}

export const dialogKeyboardShortcuts = props => functionWrap(KeyboardShortcuts, { ...props });

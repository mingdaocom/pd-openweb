import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import '../WorksheetRecordLogValue.less';

function TriggerSelect(props) {
  const { text, onSelect, children } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'] }}
      popup={
        <span
          onClick={() => {
            onSelect();
            setVisible(false);
          }}
          className="triggerSelectPopup"
        >
          {text}
        </span>
      }
    >
      {children}
    </Trigger>
  );
}
export default TriggerSelect;

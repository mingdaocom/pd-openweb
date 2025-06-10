import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { emitter } from 'src/utils/common';
import { dateConvertToUserZone } from 'src/utils/project';

function PreferenceTime(props) {
  const { value, type = 1, className = '' } = props;
  const time = dateConvertToUserZone(value);
  const wholeTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
  const [isSimplify, setIsSimplify] = useState((localStorage.getItem('mdTimeFormat') || 'simplify') === 'simplify');

  useEffect(() => {
    emitter.addListener('CHANGE_PREFERENCE_TIME_TYPE', updateStatus);

    return () => {
      emitter.removeListener('CHANGE_PREFERENCE_TIME_TYPE', updateStatus);
    };
  }, []);

  const updateStatus = value => setIsSimplify(value);

  const handleClick = () => {
    const timeFormat = isSimplify ? 'whole' : 'simplify';
    localStorage.setItem('mdTimeFormat', timeFormat);
    emitter.emit('CHANGE_PREFERENCE_TIME_TYPE', !isSimplify);
  };

  return (
    <span className={cx(className, 'Hand Hover_9e')} title={isSimplify ? wholeTime : ''} onClick={handleClick}>
      {isSimplify ? createTimeSpan(time, type) : wholeTime}
    </span>
  );
}

export default PreferenceTime;

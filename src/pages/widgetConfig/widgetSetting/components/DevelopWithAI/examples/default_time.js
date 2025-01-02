// <free_field_name>黑绿风格数位液晶屏时间选择器</free_field_name>
// <file_name>BlackGreenDigitalLCDClockSelector_v1.jsx</file_name>
function BlackGreenDigitalLCDClockSelector({ value, onChange }) {
  const [hours, setHours] = useState((value && value.split(':')[0]) || '00');
  const [minutes, setMinutes] = useState((value && value.split(':')[1]) || '00');

  useEffect(() => {
    setHours((value && value.split(':')[0]) || '00');
    setMinutes((value && value.split(':')[1]) || '00');
  }, [value]);

  const handleHoursChange = e => {
    setHours(e.target.value);
  };

  const handleMinutesChange = e => {
    setMinutes(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black text-green-500 text-[24px] font-mono p-2 rounded-md border border-gray-600 shadow-lg">
        <div className="flex items-center space-x-2">
          <select
            className="h-[36px] border rounded-md border-gray-600 bg-black text-green-500 font-mono focus:outline-none"
            value={hours}
            onChange={handleHoursChange}
          >
            {[...Array(24).keys()].map(hour => (
              <option key={hour} value={String(hour).padStart(2, '0')}>
                {String(hour).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span className="text-green-500">:</span>
          <select
            className="h-[36px] border rounded-md border-gray-600 bg-black text-green-500 font-mono focus:outline-none"
            value={minutes}
            onChange={handleMinutesChange}
          >
            {[...Array(60).keys()].map(minute => (
              <option key={minute} value={String(minute).padStart(2, '0')}>
                {String(minute).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

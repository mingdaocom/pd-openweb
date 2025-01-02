// <free_field_name>输入框</free_field_name>
// <file_name>TextInput_v2.jsx</file_name>
function TextInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  useEffect(() => {
    // 监听外部 value 的变化
    setInputValue(value);
  }, [value]);
  const handleChange = e => {
    if (!isComposing) {
      onChange(e.target.value);
    }
    setInputValue(e.target.value);
  };
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = e => {
    setIsComposing(false);
    onChange(e.target.value); // 在中文输入结束时更新值
  };
  return (
    <input
      className="w-[200px] h-[36px] px-2 border rounded-md border-gray-300"
      value={inputValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
}

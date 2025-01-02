// <free_field_name>数值输入组件</free_field_name>
// <file_name>NumberInputWithButtons_v1.jsx</file_name>
function NumberInputWithButtons({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = e => {
    const newValue = e.target.value;
    if (!isNaN(newValue) && newValue.trim() !== '') {
      setInputValue(newValue);
      onChange(Number(newValue));
    }
  };

  const increment = () => {
    const newValue = (parseFloat(inputValue) || 0) + 1;
    setInputValue(newValue);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = (parseFloat(inputValue) || 0) - 1;
    setInputValue(newValue);
    onChange(newValue);
  };

  const generateRandom = () => {
    const randomValue = Math.floor(Math.random() * 100); // 生成0到99之间的随机数
    setInputValue(randomValue);
    onChange(randomValue);
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={decrement} className="h-[36px] w-[36px] bg-gray-200 rounded-md">
        -
      </button>
      <input
        type="number"
        className="w-[100px] h-[36px] px-2 border rounded-md border-gray-300"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') increment();
          if (e.key === 'ArrowDown') decrement();
        }}
      />
      <button onClick={increment} className="h-[36px] w-[36px] bg-gray-200 rounded-md">
        +
      </button>
      <button onClick={generateRandom} className="h-[36px] px-2 bg-blue-500 text-white rounded-md">
        随机
      </button>
    </div>
  );
}

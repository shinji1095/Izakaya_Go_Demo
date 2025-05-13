export const Select = ({ label, value, onChange, onClick, options, placeholder }) => {
  return (
    <div className="select-container">
      <label>{label}</label>
      <select value={value} onChange={onChange} onClick={onClick}>
        <option value="">{placeholder}</option>
       –

{options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
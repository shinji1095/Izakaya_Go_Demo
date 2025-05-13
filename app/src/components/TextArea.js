export const TextArea = ({ label, value, readOnly }) => {
  return (
    <div className="textarea-container">
      <label>{label}</label>
      <textarea value={value} readOnly={readOnly} />
    </div>
  );
};
import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '10px',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 4px var(--primary-soft)' : '0 1px 2px rgba(0,0,0,0.05)',
    padding: '2px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--primary)' : '#d1d5db' // Slightly darker on hover
    }
  }),
  menu: (provided) => ({
    ...provided,
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    padding: '8px',
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: '500',
    color: state.isSelected ? 'var(--primary)' : 'var(--text-secondary)',
    backgroundColor: state.isSelected 
      ? 'var(--primary-soft)' 
      : state.isFocused 
        ? 'var(--bg-hover)' 
        : 'transparent',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'var(--primary-soft)'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
};

const CustomSelect = ({ options, value, onChange, placeholder, isMulti, name, className }) => {
  // Find standard value string/number from options list to pass correctly to react-select
  let selectValue = value;
  if (value !== undefined && value !== null && !isMulti && typeof value !== 'object') {
     selectValue = options.find(opt => opt.value === value) || null;
  }

  const handleChange = (selected) => {
    if (onChange) {
      // Mock event structure
      if (isMulti) {
        onChange({ target: { name, value: selected || [] } });
      } else {
        onChange({ target: { name, value: selected ? selected.value : '' } });
      }
    }
  };

  return (
    <Select
      className={className}
      options={options}
      value={selectValue}
      onChange={handleChange}
      styles={customStyles}
      placeholder={placeholder || 'Select...'}
      isMulti={isMulti}
      isSearchable={false}
    />
  );
};

export default CustomSelect;

import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

const FormPanel = ({ ...props }) => {
  const renderFields = () =>
    props.items.map(item =>
      (<TextField
        key={item.name}
        label={item.displayName}
        placeholder={item.placeholder}
        required={item.required}
        value={props.form[item.name]}
        onChanged={inputValue => props.handleChange(inputValue, item.name, item.type)}
        onFocus={() => props.handleFocus([item.name])}
        errorMessage={props.error[item.name]}
      />));

  return (
    <div>
      {renderFields()}
    </div>
  );
};

FormPanel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default FormPanel;

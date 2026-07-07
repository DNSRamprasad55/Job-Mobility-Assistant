import { useState } from 'react';

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const reset = () => setValues(initialValues);

  return { values, setValues, handleChange, reset };
}

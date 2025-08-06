import { useState } from 'react';

interface FormState {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

interface FormOptions {
  initialValues?: FormState;
  validators?: {
    [key: string]: (value: any, formValues: FormState) => string | null;
  };
  onSubmit?: (values: FormState) => void | Promise<void>;
}

// 表单Hook
export const useForm = (options: FormOptions = {}) => {
  const { initialValues = {}, validators = {}, onSubmit } = options;
  
  const [values, setValues] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // 验证单个字段
  const validateField = (name: string, value: any): string | null => {
    if (!validators[name]) return null;
    return validators[name](value, values);
  };

  // 验证所有字段
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let formIsValid = true;

    Object.keys(validators).forEach(fieldName => {
      const error = validators[fieldName](values[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };

  // 处理字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;

    // 处理复选框
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    }

    setValues(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // 如果字段已经被触摸过，则实时验证
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  // 直接设置字段值
  const setValue = (name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // 如果字段已经被触摸过，则实时验证
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  // 批量设置多个字段值
  const setMultipleValues = (newValues: FormState) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));

    // 验证已触摸的字段
    Object.keys(newValues).forEach(name => {
      if (touched[name] && validators[name]) {
        const error = validateField(name, newValues[name]);
        setErrors(prev => ({
          ...prev,
          [name]: error || '',
        }));
      }
    });
  };

  // 处理字段失焦
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 标记字段为已触摸
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // 验证字段
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || '',
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 标记所有字段为已触摸
    const allTouched = Object.keys(validators).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // 验证表单
    const formIsValid = validateForm();
    if (!formIsValid) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setMultipleValues,
    resetForm,
    validateForm,
  };
};

export default useForm;
import { useState, useEffect } from 'react';

// 本地存储Hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // 获取初始值
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状态值
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 设置值
  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`
      );
      return;
    }

    try {
      // 允许值是一个函数，类似于useState的setter
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // 保存到state
      setStoredValue(valueToStore);

      // 保存到localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // 触发自定义事件，以便其他useLocalStorage hook可以响应变化
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 移除值
  const removeValue = () => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      );
      return;
    }

    try {
      // 从localStorage移除
      window.localStorage.removeItem(key);

      // 重置state为初始值
      setStoredValue(initialValue);

      // 触发自定义事件
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  // 监听其他组件对localStorage的更改
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // 监听storage事件和自定义事件
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue, removeValue] as const;
};

export default useLocalStorage;
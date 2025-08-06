import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

// 默认断点配置（与Ant Design一致）
const defaultBreakpoints: BreakpointConfig = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// 响应式Hook
export const useResponsive = (customBreakpoints?: Partial<BreakpointConfig>) => {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  // 初始窗口大小
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // 计算当前断点
  const calculateBreakpoints = useCallback(
    (width: number): Breakpoints => ({
      xs: width < breakpoints.sm,
      sm: width >= breakpoints.sm && width < breakpoints.md,
      md: width >= breakpoints.md && width < breakpoints.lg,
      lg: width >= breakpoints.lg && width < breakpoints.xl,
      xl: width >= breakpoints.xl && width < breakpoints.xxl,
      xxl: width >= breakpoints.xxl,
    }),
    [breakpoints]
  );

  // 当前断点状态
  const [currentBreakpoints, setCurrentBreakpoints] = useState<Breakpoints>(
    calculateBreakpoints(windowSize.width)
  );

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setWindowSize({ width, height });
    setCurrentBreakpoints(calculateBreakpoints(width));
  }, [calculateBreakpoints]);

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化
    handleResize();

    // 添加事件监听
    window.addEventListener('resize', handleResize);

    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 判断当前是否为移动设备
  const isMobile = windowSize.width < breakpoints.md;

  // 判断当前是否为平板设备
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;

  // 判断当前是否为桌面设备
  const isDesktop = windowSize.width >= breakpoints.lg;

  // 获取当前断点名称
  const getBreakpointName = useCallback((): keyof BreakpointConfig => {
    const { width } = windowSize;
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [windowSize, breakpoints]);

  return {
    windowSize,
    breakpoints: currentBreakpoints,
    isMobile,
    isTablet,
    isDesktop,
    breakpointName: getBreakpointName(),
  };
};

export default useResponsive;
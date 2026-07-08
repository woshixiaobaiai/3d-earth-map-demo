// 应用配置文件
// 请在此处填写您的百度地图 AK 和其他配置

export const APP_CONFIG = {
  // 百度地图 AK（浏览器端）
  BAIDU_MAP_AK: 'gf6b2R08Vj9yxXyfo68cOFe5n8j3b7UN',
  // 百度地图 SK（用于 SN 校验，服务器端 AK 用）
  BAIDU_MAP_SK: '7z2N8THaHuMgSLxDw8ZnwJL4WU2Jfia5',

  // Cesium Ion Token (可选，用于加载 Cesium 官方地形和影像)
  CESIUM_ION_TOKEN: '',

  // 默认城市配置 (北京天安门)
  DEFAULT_LOCATION: {
    lng: 116.397428,
    lat: 39.90923,
    name: '北京天安门',
  },

  // 地球初始视角
  EARTH_INITIAL_VIEW: {
    longitude: 116.397428,
    latitude: 39.90923,
    height: 15000000, // 初始高度：15000公里（太空视角）
    heading: 0,
    pitch: -90, // 俯视
  },

  // 飞行动画配置
  FLIGHT: {
    DURATION: 3000, // 飞行总时长（毫秒）
    CITY_LEVEL_HEIGHT: 5000, // 城市级别高度（米）
    STREET_LEVEL_HEIGHT: 1000, // 街道级别高度（米）- 稍微高一点避免穿地
  },

  // 百度地图默认配置
  BAIDU_MAP: {
    DEFAULT_ZOOM: 18,
    DEFAULT_TILT: 60, // 倾斜角度
    DEFAULT_HEADING: 0,
  },

  // 地球自动旋转
  EARTH_AUTO_ROTATE: {
    ENABLED: true,
    SPEED: 0.1, // 旋转速度
  },

  // 动画配置
  ANIMATION: {
    TRANSITION_DURATION: 800, // 淡入淡出过渡时间
    MARKER_PULSE_DURATION: 2000, // 定位点脉冲动画周期
  },
};

// 应用状态类型
export type AppMode = 'earth' | 'flying' | 'city' | 'error' | 'loading';

// 坐标点类型
export interface Coordinate {
  lng: number;
  lat: number;
  name?: string;
  address?: string;
  coordType?: 'wgs84' | 'bd09' | 'gcj02'; // 坐标系类型
}

// 验证配置
export function validateConfig(): { valid: boolean; message?: string } {
  // 现在优先使用 Mock 数据，即使没有 AK 也能正常演示
  if (!APP_CONFIG.BAIDU_MAP_AK || APP_CONFIG.BAIDU_MAP_AK === 'YOUR_BAIDU_MAP_AK') {
    return {
      valid: true, // 标记为有效，不显示警告
    };
  }
  return { valid: true };
}

// WebGL 检测 - 更全面的检测
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');

    // 尝试 WebGL 2
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return true;
    }

    // 尝试 WebGL 1
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl1) {
      return true;
    }

    return false;
  } catch (e) {
    console.warn('WebGL 检测异常:', e);
    return false;
  }
}

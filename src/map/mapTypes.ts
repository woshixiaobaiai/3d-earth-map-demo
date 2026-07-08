// 地图相关类型定义

import { Coordinate } from '../utils/config';

// Cesium Earth Props
export interface CesiumEarthProps {
  onReady?: () => void;
  onFlightComplete?: () => void;
  targetLocation?: Coordinate | null;
  isFlying?: boolean;
  autoRotate?: boolean;
}

// Baidu 3D Map Props
export interface Baidu3DMapProps {
  location?: Coordinate | null;
  visible?: boolean;
  onReady?: () => void;
}

// 地理编码结果
export interface GeocodeResult {
  success: boolean;
  location?: Coordinate;
  message?: string;
}

// 地图状态
export interface MapState {
  mode: 'earth' | 'city';
  zoom: number;
  center: Coordinate;
  heading: number;
  tilt: number;
}

// 动画状态
export interface AnimationState {
  isFlying: boolean;
  flightProgress: number;
  isTransitioning: boolean;
}

// Cesium Viewer 实例引用
export type CesiumViewer = any;

// 百度地图实例引用
export type BaiduMapInstance = any;

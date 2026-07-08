/**
 * 坐标系统转换工具
 *
 * 常见坐标系统：
 * - WGS84: GPS 坐标系统，Cesium 使用
 * - GCJ02: 中国国测局坐标，高德、腾讯地图使用
 * - BD09: 百度坐标系统
 */

// WGS84 转 GCJ02 (火星坐标)
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  const a = 6378245.0; // 长半轴
  const ee = 0.006693421622965943; // 偏心率平方
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLat2 = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  const dLng2 = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  const mgLat = lat + dLat2;
  const mgLng = lng + dLng2;
  return [mgLng, mgLat];
}

// GCJ02 转 BD09 (百度坐标)
export function gcj02ToBd09(lng: number, lat: number): [number, number] {
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * Math.PI);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * Math.PI);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return [bdLng, bdLat];
}

// BD09 转 GCJ02
export function bd09ToGcj02(lng: number, lat: number): [number, number] {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
  const ggLng = z * Math.cos(theta);
  const ggLat = z * Math.sin(theta);
  return [ggLng, ggLat];
}

// GCJ02 转 WGS84
export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - 0.006693421622965943 * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLat2 = (dLat * 180.0) / (((6378245.0 * (1 - 0.006693421622965943)) / (magic * sqrtMagic)) * Math.PI);
  const dLng2 = (dLng * 180.0) / ((6378245.0 / sqrtMagic) * Math.cos(radLat) * Math.PI);
  const mgLat = lat + dLat2;
  const mgLng = lng + dLng2;
  return [lng * 2 - mgLng, lat * 2 - mgLat];
}

// WGS84 直接转 BD09
export function wgs84ToBd09(lng: number, lat: number): [number, number] {
  const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat);
  return gcj02ToBd09(gcjLng, gcjLat);
}

// BD09 直接转 WGS84
export function bd09ToWgs84(lng: number, lat: number): [number, number] {
  const [gcjLng, gcjLat] = bd09ToGcj02(lng, lat);
  return gcj02ToWgs84(gcjLng, gcjLat);
}

// 辅助函数
function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) / 3.0;
  return ret;
}

// 判断是否在中国境内（简化判断）
export function isInChina(lng: number, lat: number): boolean {
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

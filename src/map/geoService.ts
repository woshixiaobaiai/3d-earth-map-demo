/**
 * 地理编码服务
 * 包含完整错误处理，确保演示流程不中断
 */

import { Coordinate } from '../utils/config';

export interface GeocodeResult {
  success: boolean;
  location?: Coordinate;
  message?: string;
}

// Mock 数据：常用城市坐标（WGS84）
const MOCK_LOCATIONS: Record<string, Coordinate> = {
  '北京': { lng: 116.4074, lat: 39.9042, name: '北京市', address: '中国北京市' },
  '北京市': { lng: 116.4074, lat: 39.9042, name: '北京市', address: '中国北京市' },
  '天安门': { lng: 116.3974, lat: 39.9092, name: '天安门', address: '北京市东城区天安门' },
  '北京天安门': { lng: 116.3974, lat: 39.9092, name: '天安门', address: '北京市东城区天安门' },
  '上海': { lng: 121.4737, lat: 31.2304, name: '上海市', address: '中国上海市' },
  '上海市': { lng: 121.4737, lat: 31.2304, name: '上海市', address: '中国上海市' },
  '陆家嘴': { lng: 121.5017, lat: 31.2397, name: '上海陆家嘴', address: '上海市浦东新区陆家嘴' },
  '上海陆家嘴': { lng: 121.5017, lat: 31.2397, name: '上海陆家嘴', address: '上海市浦东新区陆家嘴' },
  '深圳': { lng: 114.0579, lat: 22.5431, name: '深圳市', address: '中国广东省深圳市' },
  '深圳市': { lng: 114.0579, lat: 22.5431, name: '深圳市', address: '中国广东省深圳市' },
  '南山区': { lng: 113.9478, lat: 22.5372, name: '深圳南山区', address: '广东省深圳市南山区' },
  '深圳南山区': { lng: 113.9478, lat: 22.5372, name: '深圳南山区', address: '广东省深圳市南山区' },
  '广州': { lng: 113.2644, lat: 23.1291, name: '广州市', address: '中国广东省广州市' },
  '杭州': { lng: 120.1551, lat: 30.2741, name: '杭州市', address: '中国浙江省杭州市' },
  '成都': { lng: 104.0668, lat: 30.5728, name: '成都市', address: '中国四川省成都市' },
  '西安': { lng: 108.9398, lat: 34.3416, name: '西安市', address: '中国陕西省西安市' },
  '重庆': { lng: 106.5516, lat: 29.5630, name: '重庆市', address: '中国重庆市' },
  '武汉': { lng: 114.3054, lat: 30.5931, name: '武汉市', address: '中国湖北省武汉市' },
  '南京': { lng: 118.7969, lat: 32.0603, name: '南京市', address: '中国江苏省南京市' },
  '天津': { lng: 117.2009, lat: 39.0842, name: '天津市', address: '中国天津市' },
  '苏州': { lng: 120.5853, lat: 31.2989, name: '苏州市', address: '中国江苏省苏州市' },
  '长沙': { lng: 112.9388, lat: 28.2282, name: '长沙市', address: '中国湖南省长沙市' },
  '郑州': { lng: 113.6253, lat: 34.7466, name: '郑州市', address: '中国河南省郑州市' },
  '青岛': { lng: 120.3826, lat: 36.0671, name: '青岛市', address: '中国山东省青岛市' },
  '大连': { lng: 121.6147, lat: 38.9140, name: '大连市', address: '中国辽宁省大连市' },
  '厦门': { lng: 118.0894, lat: 24.4798, name: '厦门市', address: '中国福建省厦门市' },
  '智谷大厦': { lng: 116.1915, lat: 40.0712, name: '北京海淀智谷大厦', address: '北京市海淀区智谷大厦' },
  '北京海淀智谷大厦': { lng: 116.1915, lat: 40.0712, name: '北京海淀智谷大厦', address: '北京市海淀区智谷大厦' },
};

/**
 * 使用 Mock 数据进行地理编码
 */
function geocodeWithMock(address: string): GeocodeResult {
  const trimmedAddress = address.trim();

  // 精确匹配
  if (MOCK_LOCATIONS[trimmedAddress]) {
    return {
      success: true,
      location: MOCK_LOCATIONS[trimmedAddress],
    };
  }

  // 模糊匹配 - 检查地址是否包含城市关键词
  const matchedKey = Object.keys(MOCK_LOCATIONS).find(
    (key) => key.includes(trimmedAddress) || trimmedAddress.includes(key)
  );

  if (matchedKey) {
    return {
      success: true,
      location: {
        ...MOCK_LOCATIONS[matchedKey],
        name: trimmedAddress,
      },
    };
  }

  return {
    success: false,
    message: '未找到该地址',
  };
}

/**
 * 地理编码主函数
 * 优先使用百度 JS API，失败则自动降级到 Mock 数据
 */
export async function geocode(address: string): Promise<GeocodeResult> {
  if (!address.trim()) {
    return {
      success: false,
      message: '请输入地址',
    };
  }

  console.log('🔍 开始地理编码:', address);

  // 1. 尝试使用百度地图 JS API 地理编码（如果已加载）
  if ((window as any).BMapGL) {
    try {
      const BMapGL = (window as any).BMapGL;
      const geocoder = new BMapGL.Geocoder();

      return new Promise((resolve) => {
        // 超时保护，防止卡死
        const timeout = setTimeout(() => {
          console.log('⏱️ 百度 API 超时，使用 Mock 数据');
          resolve(geocodeWithMock(address));
        }, 3000);

        geocoder.getPoint(
          address,
          (point: any) => {
            clearTimeout(timeout);
            if (point) {
              console.log('✅ 百度 JS API 搜索成功:', point.lng.toFixed(4), point.lat.toFixed(4));
              resolve({
                success: true,
                location: {
                  lng: point.lng,
                  lat: point.lat,
                  name: address,
                  address: address,
                  coordType: 'bd09', // JS API 返回百度坐标系
                } as Coordinate & { coordType?: string },
              });
            } else {
              console.log('📍 未找到精确地址，使用 Mock 数据');
              const mockResult = geocodeWithMock(address);
              resolve(mockResult);
            }
          },
          '全国'
        );
      });
    } catch (e: any) {
      console.log('⚠️ JS API 地理编码出错，使用 Mock 数据:', e?.message || JSON.stringify(e));
    }
  }

  // 2. 使用 Mock 数据作为兜底（保证演示流畅）
  const mockResult = geocodeWithMock(address);
  if (mockResult.success) {
    console.log('✅ 使用内置城市坐标:', mockResult.location!.name);
    return mockResult;
  }

  // 3. 最后返回默认地点（北京），绝对不失败
  console.log('📍 使用默认地点：北京');
  return {
    success: true,
    location: MOCK_LOCATIONS['北京'],
    message: '未找到该地址，已自动定位到北京',
  };
}

/**
 * 获取所有可用的演示城市
 */
export function getDemoCities(): Coordinate[] {
  return Object.values(MOCK_LOCATIONS);
}

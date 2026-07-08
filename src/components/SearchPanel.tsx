/**
 * 搜索面板组件 - 科技感玻璃拟态风格
 */

import { useState, useCallback } from 'react';

interface SearchPanelProps {
  onSearch: (address: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function SearchPanel({ onSearch, isLoading = false, disabled = false }: SearchPanelProps) {
  const [address, setAddress] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (address.trim() && !isLoading && !disabled) {
        onSearch(address.trim());
      }
    },
    [address, isLoading, disabled, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleClear = useCallback(() => {
    setAddress('');
  }, []);

  return (
    <div className="search-container">
      <div className={`search-panel ${isFocused ? 'focused' : ''}`}>
        {/* 搜索图标 */}
        <div className="search-icon-wrapper">
          <svg viewBox="0 0 24 24" className="search-icon-svg">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* 搜索输入框 */}
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="搜索城市、地标、详细地址..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading || disabled}
          />

          {/* 清除按钮 */}
          {address && !isLoading && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* 搜索按钮 */}
          <button
            type="submit"
            className="search-btn"
            disabled={isLoading || disabled || !address.trim()}
          >
            {isLoading ? (
              <div className="loading-spinner-inner" />
            ) : (
              <svg viewBox="0 0 24 24" className="search-arrow">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* 快捷搜索标签 */}
      <div className="quick-search">
        <span className="quick-label">热门:</span>
        {['北京', '上海', '深圳', '杭州', '成都'].map((city) => (
          <button
            key={city}
            className="quick-tag"
            onClick={() => onSearch(city)}
            disabled={isLoading}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}

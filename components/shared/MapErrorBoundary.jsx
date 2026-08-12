'use client';
import { Component } from 'react';

export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MapErrorBoundary] Map crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-[#f5f5f5] rounded-[30px]">
          <div className="text-center px-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[#bbb] mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[14px] font-medium text-[#666]">No se pudo cargar el mapa</p>
            <p className="text-[12px] text-[#999] mt-1">Refresca la página o probá más tarde</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

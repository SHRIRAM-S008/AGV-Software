import { useState, useEffect } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { Battery, Activity, Package, AlertTriangle, CheckCircle, Clock, Zap, MapPin } from 'lucide-react';
import type { AGV } from '@/types/agv';

export const AGVFleetMonitor = () => {
  const agvs = useWarehouseStore((state) => state.agvs);
  const selectedAgvId = useWarehouseStore((state) => state.selectedAgvId);
  const setSelectedAgvId = useWarehouseStore((state) => state.setSelectedAgvId);
  const updateDashboardMetrics = useWarehouseStore((state) => state.updateDashboardMetrics);

  useEffect(() => {
    updateDashboardMetrics();
    const interval = setInterval(updateDashboardMetrics, 3000);
    return () => clearInterval(interval);
  }, [updateDashboardMetrics]);

  const getStatusColor = (status: AGV['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'moving': return 'bg-green-100 text-green-700 border-green-300';
      case 'charging': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: AGV['status']) => {
    switch (status) {
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'moving': return <Activity className="w-4 h-4" />;
      case 'charging': return <Zap className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'paused': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryIcon = (level: number) => {
    if (level > 60) return <Battery className="w-4 h-4" />;
    if (level > 30) return <Battery className="w-4 h-4" />;
    return <Battery className="w-4 h-4" />;
  };

  const handleAGVClick = (agvId: string) => {
    setSelectedAgvId(selectedAgvId === agvId ? null : agvId);
  };

  const selectedAGV = agvs.find(agv => agv.id === selectedAgvId);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          AGV Fleet Monitor
        </h2>
        <div className="text-sm text-gray-500">
          {agvs.filter(agv => agv.status === 'moving').length} active / {agvs.length} total
        </div>
      </div>

      {/* AGV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {agvs.map((agv) => (
          <div
            key={agv.id}
            onClick={() => handleAGVClick(agv.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedAgvId === agv.id 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* AGV Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${getStatusColor(agv.status)}`}>
                  {getStatusIcon(agv.status)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{agv.name}</div>
                  <div className="text-xs text-gray-500">{agv.id}</div>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getBatteryColor(agv.battery)}`}>
                {getBatteryIcon(agv.battery)}
                <span className="text-sm font-medium">{agv.battery}%</span>
              </div>
            </div>

            {/* AGV Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agv.status)}`}>
                  {agv.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Position:</span>
                <span className="font-mono text-xs">
                  ({agv.position.x}, {agv.position.y})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Speed:</span>
                <span className="font-medium">{agv.speed} m/s</span>
              </div>

              {agv.currentJob && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Job:</span>
                  <span className="font-medium text-xs truncate max-w-[100px]" title={agv.currentJob.id}>
                    {agv.currentJob.id}
                  </span>
                </div>
              )}

              {agv.path && agv.path.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Path:</span>
                  <span className="font-medium text-xs">
                    {agv.path.length} points
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected AGV Details */}
      {selectedAGV && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            {selectedAGV.name} - Detailed View
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Current Status</div>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedAGV.status)}`}>
                {getStatusIcon(selectedAGV.status)}
                <span>{selectedAGV.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Battery Level</div>
              <div className={`flex items-center space-x-1 ${getBatteryColor(selectedAGV.battery)}`}>
                {getBatteryIcon(selectedAGV.battery)}
                <span className="font-semibold">{selectedAGV.battery}%</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Current Position</div>
              <div className="font-mono text-sm">
                ({selectedAGV.position.x}, {selectedAGV.position.y})
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Distance Traveled</div>
              <div className="font-semibold">
                {selectedAGV.distanceTraveled || 0}m
              </div>
            </div>

            {selectedAGV.currentJob && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Current Job</div>
                <div className="font-semibold text-sm truncate" title={selectedAGV.currentJob.id}>
                  {selectedAGV.currentJob.id}
                </div>
              </div>
            )}

            {selectedAGV.path && selectedAGV.path.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Path Progress</div>
                <div className="font-semibold">
                  {selectedAGV.path.length} waypoints
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Operating Speed</div>
              <div className="font-semibold">
                {selectedAGV.speed} m/s
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Last Updated</div>
              <div className="font-semibold text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Path Visualization */}
          {selectedAGV.path && selectedAGV.path.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Path Waypoints</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {selectedAGV.path.map((point, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded text-center ${
                      index === 0 ? 'bg-green-100 text-green-700' :
                      index === selectedAGV.path.length - 1 ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {index === 0 ? 'START' : index === selectedAGV.path.length - 1 ? 'END' : `P${index}`}
                    <div className="font-mono">({point.x}, {point.y})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useEffect } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { Battery, Package, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const DashboardMetrics = () => {
  const dashboardMetrics = useWarehouseStore((state) => state.dashboardMetrics);
  const updateDashboardMetrics = useWarehouseStore((state) => state.updateDashboardMetrics);

  useEffect(() => {
    updateDashboardMetrics();
    const interval = setInterval(updateDashboardMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateDashboardMetrics]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metrics = [
    {
      title: 'Active AGVs',
      value: `${dashboardMetrics.activeAGVs}/${dashboardMetrics.totalAGVs}`,
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      trend: dashboardMetrics.activeAGVs > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Jobs Pending',
      value: dashboardMetrics.jobsPending.toString(),
      icon: <Package className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200',
      trend: dashboardMetrics.jobsPending > 5 ? 'warning' : 'normal'
    },
    {
      title: 'Jobs Active',
      value: dashboardMetrics.jobsActive.toString(),
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      trend: dashboardMetrics.jobsActive > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Jobs Completed',
      value: dashboardMetrics.jobsCompleted.toString(),
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50 border-green-200',
      trend: 'positive'
    },
    {
      title: 'Avg Battery Level',
      value: `${dashboardMetrics.averageBatteryLevel}%`,
      icon: <Battery className={`w-6 h-6 ${getBatteryColor(dashboardMetrics.averageBatteryLevel)}`} />,
      color: 'bg-gray-50 border-gray-200',
      trend: dashboardMetrics.averageBatteryLevel > 50 ? 'positive' : 'warning'
    },
    {
      title: 'System Health',
      value: dashboardMetrics.systemHealth.toUpperCase(),
      icon: getHealthIcon(dashboardMetrics.systemHealth),
      color: getHealthColor(dashboardMetrics.systemHealth),
      trend: 'neutral'
    },
    {
      title: 'Total Distance',
      value: `${dashboardMetrics.totalDistanceTraveled}m`,
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200',
      trend: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${metric.color} transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {metric.icon}
              <span className="text-sm font-medium text-gray-600">{metric.title}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          {metric.trend && (
            <div className="mt-1 text-xs text-gray-500">
              {metric.trend === 'positive' && '↑ Good'}
              {metric.trend === 'warning' && '⚠ Attention'}
              {metric.trend === 'neutral' && '→ Stable'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

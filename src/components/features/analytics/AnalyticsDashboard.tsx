import { useEffect, useState } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { TrendingUp, TrendingDown, Activity, Clock, Package, Battery, BarChart3, PieChart } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export const AnalyticsDashboard = () => {
  const agvs = useWarehouseStore((state) => state.agvs);
  const jobs = useWarehouseStore((state) => state.jobs);
  const analytics = useWarehouseStore((state) => state.analytics);
  const dashboardMetrics = useWarehouseStore((state) => state.dashboardMetrics);

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Calculate simple analytics data
  const statusDistribution = agvs.reduce((acc, agv) => {
    acc[agv.status] = (acc[agv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const batteryDistribution = agvs.reduce((acc, agv) => {
    const range = agv.battery > 60 ? 'High' : agv.battery > 30 ? 'Medium' : 'Low';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobCompletionRate = jobs.length > 0 
    ? (jobs.filter(job => job.status === 'completed').length / jobs.length * 100).toFixed(1)
    : '0';

  const avgJobDuration = analytics?.averageCompletionTime || 0;

  const efficiencyMetrics = [
    {
      title: 'Job Completion Rate',
      value: `${jobCompletionRate}%`,
      icon: <Package className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
      trend: jobCompletionRate !== '0' ? 'up' : 'neutral'
    },
    {
      title: 'Avg Job Duration',
      value: `${avgJobDuration.toFixed(1)}s`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
      trend: avgJobDuration < 30 ? 'up' : 'down'
    },
    {
      title: 'Fleet Utilization',
      value: `${dashboardMetrics.activeAGVs}/${dashboardMetrics.totalAGVs}`,
      icon: <Activity className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100',
      trend: dashboardMetrics.activeAGVs > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Avg Battery Level',
      value: `${dashboardMetrics.averageBatteryLevel}%`,
      icon: <Battery className="w-5 h-5" />,
      color: dashboardMetrics.averageBatteryLevel > 50 ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100',
      trend: dashboardMetrics.averageBatteryLevel > 50 ? 'up' : 'down'
    }
  ];

  const renderSimpleBarChart = (data: Record<string, number>, title: string, colors: string[]) => {
    const entries = Object.entries(data);
    const maxValue = Math.max(...entries.map(([_, value]) => value), 1);

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="space-y-2">
          {entries.map(([key, value], index) => (
            <div key={key} className="flex items-center">
              <span className="text-xs text-gray-600 w-16 truncate">{key}</span>
              <div className="flex-1 mx-2">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${(value / maxValue) * 100}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 w-8 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetricCard = (metric: typeof efficiencyMetrics[0]) => (
    <div className={`p-4 rounded-lg border ${metric.color} border-opacity-20`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded ${metric.color}`}>
          {metric.icon}
        </div>
        {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
        {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
      </div>
      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
      <div className="text-sm text-gray-600">{metric.title}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {efficiencyMetrics.map((metric, index) => (
          <div key={index}>
            {renderMetricCard(metric)}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AGV Status Distribution */}
        {renderSimpleBarChart(
          statusDistribution,
          'AGV Status Distribution',
          ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#6b7280']
        )}

        {/* Battery Level Distribution */}
        {renderSimpleBarChart(
          batteryDistribution,
          'Battery Level Distribution',
          ['#10b981', '#f59e0b', '#ef4444']
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Performance Trends
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jobs Completed</span>
              <span className="text-sm font-medium text-green-600">
                +{dashboardMetrics.jobsCompleted} today
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Distance Traveled</span>
              <span className="text-sm font-medium text-blue-600">
                {dashboardMetrics.totalDistanceTraveled}m total
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-medium text-green-600">99.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Current Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active AGVs</span>
              <span className="text-sm font-medium text-blue-600">
                {dashboardMetrics.activeAGVs} of {dashboardMetrics.totalAGVs}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jobs in Progress</span>
              <span className="text-sm font-medium text-purple-600">
                {dashboardMetrics.jobsActive}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Jobs</span>
              <span className="text-sm font-medium text-orange-600">
                {dashboardMetrics.jobsPending}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Battery className="w-5 h-5 mr-2 text-yellow-600" />
            Fleet Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Battery</span>
              <span className={`text-sm font-medium ${
                dashboardMetrics.averageBatteryLevel > 50 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {dashboardMetrics.averageBatteryLevel}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Health</span>
              <span className={`text-sm font-medium ${
                dashboardMetrics.systemHealth === 'good' ? 'text-green-600' :
                dashboardMetrics.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {dashboardMetrics.systemHealth.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alerts</span>
              <span className="text-sm font-medium text-red-600">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Detailed Metrics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Job Completion Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {jobCompletionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  95%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    parseFloat(jobCompletionRate) >= 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {parseFloat(jobCompletionRate) >= 95 ? 'On Target' : 'Below Target'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Average Job Duration
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {avgJobDuration.toFixed(1)}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  30s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    avgJobDuration <= 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {avgJobDuration <= 30 ? 'On Target' : 'Above Target'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Fleet Utilization
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round((dashboardMetrics.activeAGVs / dashboardMetrics.totalAGVs) * 100)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  80%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (dashboardMetrics.activeAGVs / dashboardMetrics.totalAGVs) >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(dashboardMetrics.activeAGVs / dashboardMetrics.totalAGVs) >= 0.8 ? 'Good' : 'Low'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

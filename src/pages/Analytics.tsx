import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Zap, Clock, AlertTriangle, 
  Package, Truck, Battery, Target, Calendar, Filter, Download,
  BarChart3, LineChartIcon, PieChartIcon, MapPin, Thermometer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { realisticAGVFleet, positionStreamData } from '@/data/agvData';
import { realisticInventoryData, realisticRacks } from '@/data/wmsData';
import SplitText from '@/components/common/SplitText';
import { TopMenu } from '@/components/layout/TopMenu';



interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const Analytics = () => {
  const [selectedChart, setSelectedChart] = useState<'jobs' | 'distance' | 'energy' | 'completion'>('jobs');

  
  const menuItems = [
    { label: '01. Home', ariaLabel: 'Go to home', link: '/' },
    { label: '02. Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
    { label: '03. Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: '04. Fleet Management', ariaLabel: 'Manage AGV fleet', link: '/agv-fleet' },
    { label: '05. Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: '06. WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' },
    { label: '07. Settings', ariaLabel: 'System settings', link: '/settings' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];


  // Generate mock analytics data based on time range
  const generateJobsData = (days: number) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      completed: Math.floor(Math.random() * 50) + 30,
      pending: Math.floor(Math.random() * 20) + 5,
      failed: Math.floor(Math.random() * 5) + 1,
    }));
  };

  const generateDistanceData = (days: number) => {
    return realisticAGVFleet.map(agv => ({
      name: agv.id,
      distance: Math.floor(Math.random() * 500) + 200,
      efficiency: Math.floor(Math.random() * 30) + 70,
    }));
  };

  const generateEnergyData = (days: number) => {
    return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      date: new Date(Date.now() - (Math.min(days, 7) - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'short' }),
      consumption: Math.floor(Math.random() * 100) + 50,
      charging: Math.floor(Math.random() * 80) + 40,
    }));
  };

  const generateCompletionData = () => {
    return [
      { type: 'Pick Jobs', avgTime: 12, count: 45 },
      { type: 'Restock', avgTime: 8, count: 32 },
      { type: 'Move', avgTime: 15, count: 28 },
      { type: 'Return', avgTime: 6, count: 18 },
    ];
  };

  const generateInventoryHeatmap = () => {
    const heatmapData = [];
    for (let rack = 0; rack < 4; rack++) {
      for (let shelf = 0; shelf < 3; shelf++) {
        for (let bin = 0; bin < 5; bin++) {
          heatmapData.push({
            rack: `R${rack + 1}`,
            shelf: `S${shelf + 1}`,
            bin: `B${bin + 1}`,
            movements: Math.floor(Math.random() * 50) + 10,
            utilization: Math.floor(Math.random() * 40) + 60,
          });
        }
      }
    }
    return heatmapData;
  };

  const jobsData = generateJobsData(7);
  const distanceData = generateDistanceData(7);
  const energyData = generateEnergyData(7);
  const completionData = generateCompletionData();
  const heatmapData = generateInventoryHeatmap();

  const metricCards: MetricCard[] = [
    {
      title: 'Total Jobs',
      value: jobsData.reduce((sum, day) => sum + day.completed, 0),
      change: 12.5,
      icon: <Package className="w-4 h-4" />,
      color: 'blue'
    },
    {
      title: 'Collisions Avoided',
      value: 247,
      change: -5.2,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'green'
    },
    {
      title: 'Total Distance',
      value: `${distanceData.reduce((sum, agv) => sum + agv.distance, 0)}m`,
      change: 8.3,
      icon: <Truck className="w-4 h-4" />,
      color: 'purple'
    },
    {
      title: 'Energy Used',
      value: `${energyData.reduce((sum, day) => sum + day.consumption, 0)}kWh`,
      change: -3.1,
      icon: <Zap className="w-4 h-4" />,
      color: 'yellow'
    },
    {
      title: 'Avg Completion Time',
      value: '11.2 min',
      change: -7.8,
      icon: <Clock className="w-4 h-4" />,
      color: 'orange'
    },
    {
      title: 'Fleet Efficiency',
      value: '87%',
      change: 4.2,
      icon: <Activity className="w-4 h-4" />,
      color: 'green'
    }
  ];

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHeatmapColor = (movements: number) => {
    if (movements > 40) return 'bg-red-500';
    if (movements > 30) return 'bg-orange-500';
    if (movements > 20) return 'bg-yellow-500';
    if (movements > 10) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <TopMenu menuItems={menuItems} socialItems={socialItems}>
      <div style={{ height: '100vh', background: '#ffffff' }}>
      <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div>
            <SplitText
              text="Analytics & Statistics"
              className="text-xl font-bold text-gray-900"
              delay={40}
              duration={0.5}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              tag="h1"
            />
            <p className="text-xs text-gray-600">Warehouse performance insights and metrics</p>
          </div>
        </div>
        
              </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metric Cards */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricCards.map((metric, index) => (
            <div key={index} className={`border rounded-lg p-3 ${getMetricColor(metric.color)}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  {metric.icon}
                  <span className="text-xs font-medium">{metric.title}</span>
                </div>
                <div className={`flex items-center text-xs ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div className="text-lg font-bold">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Jobs Chart */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Number of Jobs</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedChart('jobs')}
                    className={`p-1 rounded ${selectedChart === 'jobs' ? 'bg-gray-100' : 'text-gray-600'}`}
                  >
                    <BarChart3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distance Traveled */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Distance Traveled per AGV</h3>
                <button className="p-1 rounded text-gray-600">
                  <Truck className="w-3 h-3" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="distance" fill="#8b5cf6" name="Distance (m)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Energy Consumption */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Energy Consumption</h3>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">kWh</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="consumption" stackId="1" stroke="#f59e0b" fill="#fbbf24" name="Consumption" />
                  <Area type="monotone" dataKey="charging" stackId="1" stroke="#10b981" fill="#34d399" name="Charging" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Job Completion Time */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Average Job Completion Time</h3>
                <Clock className="w-3 h-3 text-orange-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="avgTime" fill="#f97316" name="Avg Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Movement Heatmap */}
          <div className="border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Inventory Movement Heatmap</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600">Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600">High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Critical</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, rackIndex) => (
                <div key={rackIndex} className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 text-center">Rack {rackIndex + 1}</div>
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 3 }, (_, shelfIndex) => (
                      <div key={shelfIndex} className="space-y-1">
                        {Array.from({ length: 5 }, (_, binIndex) => {
                          const data = heatmapData[rackIndex * 15 + shelfIndex * 5 + binIndex];
                          return (
                            <div
                              key={binIndex}
                              className={`w-full h-4 rounded ${getHeatmapColor(data.movements)} opacity-80`}
                              title={`${data.rack}-${data.shelf}-${data.bin}: ${data.movements} movements`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Collision Risks */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Collision Risks Avoided</h3>
                <AlertTriangle className="w-3 h-3 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Last Week</span>
                  <span className="font-medium">261</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Reduction</span>
                  <span className="font-medium text-green-600">-5.2%</span>
                </div>
              </div>
            </div>

            {/* AGV Utilization */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">AGV Utilization</h3>
                <Activity className="w-3 h-3 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium">3 / 5</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Charging</span>
                  <span className="font-medium">1 / 5</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Idle</span>
                  <span className="font-medium">1 / 5</span>
                </div>
              </div>
            </div>

            {/* Warehouse Efficiency */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Warehouse Efficiency</h3>
                <Target className="w-3 h-3 text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Space Utilization</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Throughput</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-medium">96.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </TopMenu>
  );
};

export default Analytics;

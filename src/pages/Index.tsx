import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Package, AlertTriangle, Box, Navigation, Battery, Activity, BarChart3, Clock, Zap, Shield, Map, TrendingUp, Bell, CheckCircle, AlertCircle, Timer, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Iridescence from '@/components/common/Iridescence';
import SplitText from '@/components/common/SplitText';
import StaggeredMenu from '@/components/common/StaggeredMenu';
import { useEffect } from 'react';

const Index = () => {
  const menuItems = [
    { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
    { label: 'Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: 'Analytics', ariaLabel: 'View analytics and statistics', link: '/analytics' },
    { label: 'Fleet Management', ariaLabel: 'Manage AGV fleet', link: '/agv-fleet' },
    { label: 'Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: 'WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' },
    { label: 'Settings', ariaLabel: 'System settings', link: '/settings' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] overflow-auto">
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#000000"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={true}
        colors={['#ffffff', '#f5f5f5', '#e5e5e5']}
        accentColor="#000000"
        isFixed={true}
      />
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 relative">
        <div className="absolute inset-0 z-0">
          <Iridescence
            color={[0.2, 0.4, 0.8]}
            mouseReact={false}
            amplitude={0.1}
            speed={1.0}
          />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 rounded-full mb-6">
              <Bot className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-300">Next Generation Fleet Management</span>
            </div>
            
            <SplitText
              text="AGV Monitoring & Control System"
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
              delay={50}
              duration={0.8}
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              tag="h1"
            />
            
            <SplitText
              text="Real-Time Digital Twin Dashboard"
              className="text-2xl md:text-3xl text-gray-300 mb-8"
              delay={80}
              duration={0.6}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              tag="p"
            />
            
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Monitor, track, and control AGVs in real time with a live 3D digital twin and intelligent fleet analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Link to="/dashboard">
                  View Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 hover:text-white px-8 py-4 text-lg">
                <Link to="/warehouse">
                  View Warehouse
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Quick Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-3">
                <Navigation className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-sm text-gray-300">Live AGV tracking</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-3">
                <Bot className="h-8 w-8 text-purple-400" />
              </div>
              <span className="text-sm text-gray-300">Fleet management</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <span className="text-sm text-gray-300">Error alerts</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-3">
                <Box className="h-8 w-8 text-green-400" />
              </div>
              <span className="text-sm text-gray-300">3D warehouse twin</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-3">
                <Navigation className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-300">Route visualization</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mb-3">
                <Battery className="h-8 w-8 text-cyan-400" />
              </div>
              <span className="text-sm text-gray-300">Battery & health monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is AGV Section */}
      <section className="py-20 px-6 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <SplitText
            text="What is an AGV?"
            className="text-4xl font-bold mb-12 text-center"
            delay={60}
            duration={0.7}
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            tag="h2"
          />
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-lg text-gray-300 mb-6">
                An <span className="font-bold text-blue-400">Automated Guided Vehicle (AGV)</span> is a mobile robot that follows markers or wires in the floor, or uses vision, magnets, or lasers for navigation. These intelligent vehicles are designed to move materials around manufacturing facilities, warehouses, and distribution centers without human intervention.
              </p>
              
              <p className="text-lg text-gray-300 mb-6">
                AGVs are essential components of modern automation systems, providing reliable, efficient, and cost-effective material handling solutions. They can transport raw materials, work-in-progress goods, and finished products throughout your facility 24/7.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-10 w-10 text-blue-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Material Transport</h4>
                  <p className="text-sm text-gray-400">Move goods efficiently</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-10 w-10 text-green-400" />
                  </div>
                  <h4 className="font-semibold mb-2">24/7 Operation</h4>
                  <p className="text-sm text-gray-400">Continuous productivity</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Navigation className="h-10 w-10 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Smart Navigation</h4>
                  <p className="text-sm text-gray-400">Intelligent pathfinding</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-blue-400" />
                  <span className="font-semibold">Autonomous Operation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Navigation className="h-6 w-6 text-green-400" />
                  <span className="font-semibold">Precision Navigation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-purple-400" />
                  <span className="font-semibold">Heavy Load Capacity</span>
                </div>
                <div className="flex items-center gap-3">
                  <Battery className="h-6 w-6 text-yellow-400" />
                  <span className="font-semibold">Extended Battery Life</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <span className="font-semibold">Safety Sensors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is AGV Software Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <SplitText
            text="What is AGV Software?"
            className="text-4xl font-bold mb-12 text-center"
            delay={60}
            duration={0.7}
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            tag="h2"
          />
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-purple-400">Complete Fleet Management</h3>
              <p className="text-gray-300 mb-4">
                AGV software is the brain that orchestrates your entire fleet of autonomous vehicles. It provides centralized control, real-time monitoring, and intelligent decision-making capabilities that transform individual AGVs into a coordinated, efficient material handling system.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Real-time fleet visibility and control</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Intelligent route optimization and traffic management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Predictive maintenance and health monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Seamless integration with warehouse systems</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Why AGV Software Matters Today</h3>
              <p className="text-lg text-gray-300 mb-6">
                In today's competitive industrial landscape, efficiency and automation are no longer optional—they're essential. AGV software transforms your material handling operations from manual processes to intelligent, automated systems that can adapt, learn, and optimize continuously.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h4 className="font-semibold mb-3 text-blue-400">Increased Efficiency</h4>
                  <p className="text-sm text-gray-400">Reduce operational costs by up to 40% through automation and optimization</p>
                </div>
                
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h4 className="font-semibold mb-3 text-green-400">24/7 Operations</h4>
                  <p className="text-sm text-gray-400">Continuous material handling without human fatigue or limitations</p>
                </div>
                
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h4 className="font-semibold mb-3 text-purple-400">Data-Driven Decisions</h4>
                  <p className="text-sm text-gray-400">Real-time analytics for optimized fleet performance and maintenance</p>
                </div>
                
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h4 className="font-semibold mb-3 text-yellow-400">Future-Ready</h4>
                  <p className="text-sm text-gray-400">Scalable solution that grows with your business needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Features Section */}
      <section className="py-20 px-6 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Complete <span className="text-blue-400">System Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced monitoring, fleet management, and analytics capabilities for modern warehouse automation
            </p>
          </div>

          {/* Monitoring Features */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-blue-400">A. Monitoring Features</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Live AGV Location</h4>
                <p className="text-gray-400 text-sm">Real-time positioning with centimeter-level accuracy across your entire warehouse floor</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Speed, Direction, Battery</h4>
                <p className="text-gray-400 text-sm">Comprehensive telemetry data including velocity, heading, and power metrics</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Task in Progress</h4>
                <p className="text-gray-400 text-sm">Live status updates on current operations and job completion progress</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Obstacle Detection</h4>
                <p className="text-gray-400 text-sm">Advanced sensor fusion for real-time obstacle identification and avoidance</p>
              </div>
            </div>
          </div>

          {/* Fleet Management */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Box className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-purple-400">B. Fleet Management</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Assign Tasks</h4>
                <p className="text-gray-400 text-sm">Drag-and-drop interface for intelligent task distribution across your fleet</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Priority Queues</h4>
                <p className="text-gray-400 text-sm">Dynamic task prioritization based on urgency and resource availability</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Auto-Scheduling</h4>
                <p className="text-gray-400 text-sm">AI-powered optimization for maximum fleet efficiency and throughput</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Collision Avoidance</h4>
                <p className="text-gray-400 text-sm">Predictive path planning with real-time traffic management</p>
              </div>
            </div>
          </div>

          {/* 3D Warehouse Digital Twin */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-400">C. 3D Warehouse Digital Twin</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">3D Model Visualization</h4>
                <p className="text-gray-400 text-sm">Interactive 3D representation of racks, routes, and work stations</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Real-Time Path Animation</h4>
                <p className="text-gray-400 text-sm">Live visualization of AGV movements and route execution</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Route Heatmaps</h4>
                <p className="text-gray-400 text-sm">Visual analytics showing most frequently used paths and bottlenecks</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <Route className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Interactive Navigation</h4>
                <p className="text-gray-400 text-sm">Pan, zoom, and rotate through your entire warehouse layout</p>
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-red-400">D. Alerts & Notifications</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4">
                  <Battery className="h-6 w-6 text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Low Battery Alerts</h4>
                <p className="text-gray-400 text-sm">Automatic notifications when AGVs need charging with scheduling suggestions</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">AGV Stuck Detection</h4>
                <p className="text-gray-400 text-sm">Immediate alerts when vehicles encounter obstacles or malfunctions</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Route Blocked</h4>
                <p className="text-gray-400 text-sm">Real-time notifications when paths are obstructed with reroute options</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Task Completion</h4>
                <p className="text-gray-400 text-sm">Automated notifications when jobs are finished with performance metrics</p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-cyan-400">E. Analytics</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-full flex items-center justify-center mb-4">
                  <Timer className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Job Completion Times</h4>
                <p className="text-gray-400 text-sm">Detailed metrics on task duration and performance trends</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Efficiency Graphs</h4>
                <p className="text-gray-400 text-sm">Visual representations of fleet productivity and utilization rates</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4">
                  <Battery className="h-6 w-6 text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Battery Usage Patterns</h4>
                <p className="text-gray-400 text-sm">Analysis of power consumption and charging optimization opportunities</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold mb-3">Route Optimization</h4>
                <p className="text-gray-400 text-sm">AI-driven suggestions for improving path efficiency and reducing travel time</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

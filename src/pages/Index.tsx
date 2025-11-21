import { AGVPanel } from '@/components/dashboard/AGVPanel';
import { JobPanel } from '@/components/dashboard/JobPanel';
import { SimulationControls } from '@/components/dashboard/SimulationControls';
import { WarehouseScene } from '@/components/warehouse/WarehouseScene';

const Index = () => {
  return (
    <div className="h-full grid grid-cols-12 gap-4 p-4 overflow-hidden">
      {/* Left Sidebar - AGV Status & Controls */}
      <div className="col-span-3 overflow-auto space-y-4">
        <SimulationControls />
        <AGVPanel />
      </div>

      {/* Center - 3D Warehouse */}
      <div className="col-span-6 overflow-hidden">
        <WarehouseScene />
      </div>

      {/* Right Sidebar - Job Queue */}
      <div className="col-span-3 overflow-auto">
        <JobPanel />
      </div>
    </div>
  );
};

export default Index;

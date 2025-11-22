import { useState } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { Plus, MapPin, Flag, Package, X } from 'lucide-react';
import type { Position, Job } from '@/types/agv';

interface JobCreationFormProps {
  onClose?: () => void;
}

export const JobCreationForm = ({ onClose }: JobCreationFormProps) => {
  const addJob = useWarehouseStore((state) => state.addJob);
  const warehouseSize = useWarehouseStore((state) => state.warehouseSize);
  
  const [formData, setFormData] = useState({
    pickupLocation: { x: 2, y: 2, z: 0 } as Position,
    dropoffLocation: { x: warehouseSize.width - 2, y: warehouseSize.length - 2, z: 0 } as Position,
    priority: 'medium' as Job['priority'],
    description: '',
    estimatedDuration: 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickupLocation || formData.pickupLocation.x < 0 || formData.pickupLocation.y < 0) {
      newErrors.pickupLocation = 'Valid pickup location is required';
    }
    if (!formData.dropoffLocation || formData.dropoffLocation.x < 0 || formData.dropoffLocation.y < 0) {
      newErrors.dropoffLocation = 'Valid dropoff location is required';
    }
    if (formData.pickupLocation.x === formData.dropoffLocation.x && 
        formData.pickupLocation.y === formData.dropoffLocation.y) {
      newErrors.dropoffLocation = 'Dropoff location must be different from pickup location';
    }
    if (formData.pickupLocation.x > warehouseSize.width || formData.pickupLocation.y > warehouseSize.length) {
      newErrors.pickupLocation = 'Pickup location is outside warehouse bounds';
    }
    if (formData.dropoffLocation.x > warehouseSize.width || formData.dropoffLocation.y > warehouseSize.length) {
      newErrors.dropoffLocation = 'Dropoff location is outside warehouse bounds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newJob = {
      ...formData,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropoffLocation, // Note: using dropLocation to match interface
      description: formData.description || `Job from (${formData.pickupLocation.x}, ${formData.pickupLocation.y}) to (${formData.dropoffLocation.x}, ${formData.dropoffLocation.y})`,
      estimatedDuration: formData.estimatedDuration,
      itemName: 'Package', // Default item name
      quantity: 1, // Default quantity
      assignedAgv: '', // Will be assigned automatically
    };

    addJob(newJob);
    
    // Reset form
    setFormData({
      pickupLocation: { x: 2, y: 2, z: 0 },
      dropoffLocation: { x: warehouseSize.width - 2, y: warehouseSize.length - 2, z: 0 },
      priority: 'medium',
      description: '',
      estimatedDuration: 5,
    });
    
    onClose?.();
  };

  const handlePositionChange = (field: 'pickupLocation' | 'dropoffLocation', axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [axis]: numValue
      }
    }));
  };

  const setQuickLocation = (field: 'pickupLocation' | 'dropoffLocation', location: 'home' | 'far' | 'center') => {
    const positions = {
      home: { x: 2, y: 2, z: 0 },
      far: { x: warehouseSize.width - 2, y: warehouseSize.length - 2, z: 0 },
      center: { x: Math.floor(warehouseSize.width / 2), y: Math.floor(warehouseSize.length / 2), z: 0 }
    };
    
    setFormData(prev => ({
      ...prev,
      [field]: positions[location]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Create New Job
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pickup Location
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <input
                type="number"
                min="0"
                max={warehouseSize.width}
                value={formData.pickupLocation.x}
                onChange={(e) => handlePositionChange('pickupLocation', 'x', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="X coordinate"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                max={warehouseSize.length}
                value={formData.pickupLocation.y}
                onChange={(e) => handlePositionChange('pickupLocation', 'y', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Y coordinate"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickLocation('pickupLocation', 'home')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              AGV Home
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation('pickupLocation', 'center')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation('pickupLocation', 'far')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Far Corner
            </button>
          </div>
          {errors.pickupLocation && (
            <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
          )}
        </div>

        {/* Dropoff Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Dropoff Location
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <input
                type="number"
                min="0"
                max={warehouseSize.width}
                value={formData.dropoffLocation.x}
                onChange={(e) => handlePositionChange('dropoffLocation', 'x', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="X coordinate"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                max={warehouseSize.length}
                value={formData.dropoffLocation.y}
                onChange={(e) => handlePositionChange('dropoffLocation', 'y', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Y coordinate"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickLocation('dropoffLocation', 'home')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              AGV Home
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation('dropoffLocation', 'center')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation('dropoffLocation', 'far')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Far Corner
            </button>
          </div>
          {errors.dropoffLocation && (
            <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Flag className="w-4 h-4 inline mr-1" />
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Job['priority'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional job details..."
          />
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 5 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Create Job
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

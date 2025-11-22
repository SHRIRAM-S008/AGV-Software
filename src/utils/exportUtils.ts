import { WMSExportData, InventoryItem, Rack, WMSJob, WMSAlert, InventoryMetrics } from '@/types';

// CSV Export Functions
export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle special characters and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// JSON Export Functions
export const exportToJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, `${filename}.json`, 'application/json');
};

// PDF Export (Simple text-based PDF generation)
export const exportToPDF = async (data: WMSExportData, filename: string) => {
  // For now, we'll create a simple text-based PDF
  // In a real application, you might want to use a library like jsPDF
  const pdfContent = generatePDFContent(data);
  downloadFile(pdfContent, `${filename}.txt`, 'text/plain');
  
  // Note: This is a simplified version. For actual PDF generation,
  // you would need to integrate a PDF library like jsPDF
  console.log('PDF export requires a PDF library. Currently exporting as text file.');
};

// Inventory Export Functions
export const exportInventory = (items: InventoryItem[], format: 'csv' | 'json' | 'pdf') => {
  const filename = `inventory_export_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csvData = items.map(item => ({
        'SKU Code': item.skuCode,
        'Item Name': item.name,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit Type': item.unitType,
        'Rack': item.location.rack,
        'Shelf': item.location.shelf,
        'Slot': item.location.slot,
        'Priority': item.handlingPriority,
        'Weight': item.weight,
        'Min Stock': item.minStockLevel,
        'Max Stock': item.maxStockLevel,
        'Expiry Date': item.expiryDate?.toISOString().split('T')[0] || '',
        'Batch Number': item.batchNumber || '',
        'Created Date': item.createdAt.toISOString().split('T')[0],
        'Updated Date': item.updatedAt.toISOString().split('T')[0]
      }));
      exportToCSV(csvData, filename);
      break;
      
    case 'json':
      exportToJSON({ items, exportedAt: new Date().toISOString() }, filename);
      break;
      
    case 'pdf':
      exportToPDF({
        timestamp: new Date(),
        format: 'pdf',
        data: {
          inventory: items,
          racks: [],
          jobs: [],
          alerts: [],
          metrics: {} as InventoryMetrics
        }
      }, filename);
      break;
  }
};

// Rack Export Functions
export const exportRacks = (racks: Rack[], format: 'csv' | 'json' | 'pdf') => {
  const filename = `racks_export_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csvData = racks.flatMap(rack => 
        rack.shelves.map(shelf => ({
          'Rack ID': rack.id,
          'Rack Name': rack.name,
          'Shelf ID': shelf.id,
          'Shelf Name': shelf.name,
          'Level': shelf.level,
          'Capacity': shelf.capacity,
          'Current Load': shelf.currentLoad,
          'Utilization': `${Math.round((shelf.currentLoad / shelf.capacity) * 100)}%`,
          'Weight Limit': shelf.weightLimit,
          'Current Weight': shelf.currentWeight,
          'Is Accessible': rack.isAccessible
        }))
      );
      exportToCSV(csvData, filename);
      break;
      
    case 'json':
      exportToJSON({ racks, exportedAt: new Date().toISOString() }, filename);
      break;
      
    case 'pdf':
      exportToPDF({
        timestamp: new Date(),
        format: 'pdf',
        data: {
          inventory: [],
          racks: racks,
          jobs: [],
          alerts: [],
          metrics: {} as InventoryMetrics
        }
      }, filename);
      break;
  }
};

// Jobs Export Functions
export const exportJobs = (jobs: WMSJob[], format: 'csv' | 'json' | 'pdf') => {
  const filename = `jobs_export_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csvData = jobs.map(job => ({
        'Job ID': job.id,
        'Type': job.type,
        'Item Name': job.itemName,
        'SKU Code': job.skuCode,
        'Quantity': job.quantity,
        'Priority': job.priority,
        'Status': job.status,
        'Assigned AGV': job.assignedAgv || 'Unassigned',
        'Source Rack': job.sourceLocation.rack,
        'Source Shelf': job.sourceLocation.shelf,
        'Source Slot': job.sourceLocation.slot,
        'Target Rack': job.targetLocation.rack,
        'Target Shelf': job.targetLocation.shelf,
        'Target Slot': job.targetLocation.slot,
        'Estimated Time': job.estimatedTime || '',
        'Actual Time': job.actualTime || '',
        'Created By': job.createdBy,
        'Created Date': job.createdAt.toISOString().split('T')[0],
        'Assigned Date': job.assignedAt?.toISOString().split('T')[0] || '',
        'Started Date': job.startedAt?.toISOString().split('T')[0] || '',
        'Completed Date': job.completedAt?.toISOString().split('T')[0] || '',
        'Notes': job.notes || ''
      }));
      exportToCSV(csvData, filename);
      break;
      
    case 'json':
      exportToJSON({ jobs, exportedAt: new Date().toISOString() }, filename);
      break;
      
    case 'pdf':
      exportToPDF({
        timestamp: new Date(),
        format: 'pdf',
        data: {
          inventory: [],
          racks: [],
          jobs: jobs,
          alerts: [],
          metrics: {} as InventoryMetrics
        }
      }, filename);
      break;
  }
};

// Alerts Export Functions
export const exportAlerts = (alerts: WMSAlert[], format: 'csv' | 'json' | 'pdf') => {
  const filename = `alerts_export_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csvData = alerts.map(alert => ({
        'Alert ID': alert.id,
        'Type': alert.type,
        'Severity': alert.severity,
        'Title': alert.title,
        'Message': alert.message,
        'Item ID': alert.itemId || '',
        'Rack ID': alert.rackId || '',
        'AGV ID': alert.agvId || '',
        'Timestamp': alert.timestamp.toISOString(),
        'Acknowledged': alert.acknowledged,
        'Acknowledged By': alert.acknowledgedBy || '',
        'Acknowledged At': alert.acknowledgedAt?.toISOString() || ''
      }));
      exportToCSV(csvData, filename);
      break;
      
    case 'json':
      exportToJSON({ alerts, exportedAt: new Date().toISOString() }, filename);
      break;
      
    case 'pdf':
      exportToPDF({
        timestamp: new Date(),
        format: 'pdf',
        data: {
          inventory: [],
          racks: [],
          jobs: [],
          alerts: alerts,
          metrics: {} as InventoryMetrics
        }
      }, filename);
      break;
  }
};

// Complete WMS Export
export const exportCompleteWMS = (data: WMSExportData, format: 'csv' | 'json' | 'pdf') => {
  const filename = `wms_complete_export_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      // Export multiple CSV files
      exportInventory(data.data.inventory, 'csv');
      exportRacks(data.data.racks, 'csv');
      exportJobs(data.data.jobs, 'csv');
      exportAlerts(data.data.alerts, 'csv');
      break;
      
    case 'json':
      exportToJSON(data, filename);
      break;
      
    case 'pdf':
      exportToPDF(data, filename);
      break;
  }
};

// Utility function to download files
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Simple PDF content generator (text-based)
const generatePDFContent = (data: WMSExportData): string => {
  let content = '';
  
  // Header
  content += '='.repeat(80) + '\n';
  content += 'WAREHOUSE MANAGEMENT SYSTEM REPORT\n';
  content += '='.repeat(80) + '\n\n';
  content += `Generated: ${data.timestamp.toLocaleString()}\n`;
  content += `Format: ${data.format.toUpperCase()}\n\n`;
  
  // Inventory Summary
  if (data.data.inventory.length > 0) {
    content += 'INVENTORY SUMMARY\n';
    content += '-'.repeat(40) + '\n';
    content += `Total Items: ${data.data.inventory.length}\n`;
    content += `Total Categories: ${new Set(data.data.inventory.map(item => item.category)).size}\n`;
    content += `Low Stock Items: ${data.data.inventory.filter(item => item.quantity <= item.minStockLevel).length}\n`;
    content += `Expired Items: ${data.data.inventory.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length}\n\n`;
    
    content += 'INVENTORY DETAILS\n';
    content += '-'.repeat(40) + '\n';
    data.data.inventory.forEach((item, index) => {
      content += `${index + 1}. ${item.name} (${item.skuCode})\n`;
      content += `   Location: ${item.location.rack}${item.location.shelf}${item.location.slot}\n`;
      content += `   Quantity: ${item.quantity} ${item.unitType}\n`;
      content += `   Category: ${item.category}\n`;
      content += `   Priority: ${item.handlingPriority}\n`;
      if (item.expiryDate) {
        content += `   Expiry: ${item.expiryDate.toLocaleDateString()}\n`;
      }
      content += '\n';
    });
  }
  
  // Jobs Summary
  if (data.data.jobs.length > 0) {
    content += '\nJOBS SUMMARY\n';
    content += '-'.repeat(40) + '\n';
    content += `Total Jobs: ${data.data.jobs.length}\n`;
    content += `Pending: ${data.data.jobs.filter(job => job.status === 'pending').length}\n`;
    content += `In Progress: ${data.data.jobs.filter(job => job.status === 'in_progress').length}\n`;
    content += `Completed: ${data.data.jobs.filter(job => job.status === 'completed').length}\n`;
    content += `Failed: ${data.data.jobs.filter(job => job.status === 'failed').length}\n\n`;
  }
  
  // Alerts Summary
  if (data.data.alerts.length > 0) {
    content += '\nALERTS SUMMARY\n';
    content += '-'.repeat(40) + '\n';
    content += `Total Alerts: ${data.data.alerts.length}\n`;
    content += `Critical: ${data.data.alerts.filter(alert => alert.severity === 'critical').length}\n`;
    content += `Warning: ${data.data.alerts.filter(alert => alert.severity === 'warning').length}\n`;
    content += `Info: ${data.data.alerts.filter(alert => alert.severity === 'info').length}\n`;
    content += `Unacknowledged: ${data.data.alerts.filter(alert => !alert.acknowledged).length}\n\n`;
  }
  
  // Footer
  content += '\n' + '='.repeat(80) + '\n';
  content += 'END OF REPORT\n';
  content += '='.repeat(80) + '\n';
  
  return content;
};

// Export validation and error handling
export const validateExportData = (data: any[], type: string): boolean => {
  if (!Array.isArray(data)) {
    console.error(`Export data for ${type} must be an array`);
    return false;
  }
  
  if (data.length === 0) {
    console.warn(`No data to export for ${type}`);
    return false;
  }
  
  return true;
};

// Batch export function for multiple formats
export const batchExport = async (
  data: WMSExportData,
  formats: ('csv' | 'json' | 'pdf')[]
): Promise<void> => {
  for (const format of formats) {
    try {
      exportCompleteWMS(data, format);
      console.log(`Successfully exported ${format.toUpperCase()} format`);
    } catch (error) {
      console.error(`Failed to export ${format.toUpperCase()}:`, error);
    }
  }
};

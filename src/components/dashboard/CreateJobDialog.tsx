import { useCallback, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { Badge } from '@/components/ui/badge';
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
  import { useToast } from '@/hooks/use-toast';
  import { useWarehouseStore } from '@/store/warehouseStore';
  import { cn } from '@/lib/utils';
  import {
    AlertCircle,
    Navigation2,
    PackagePlus,
    Sparkles,
    Users,
    MapPin,
    CheckCircle2,
  } from 'lucide-react';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const MIN_COORD = 0;
const MAX_COORD = 30;

const LOCATION_PRESETS = [
  { label: 'Inbound Dock A', value: { x: 4, y: 6 } },
  { label: 'Inbound Dock B', value: { x: 8, y: 6 } },
  { label: 'Storage Row 3', value: { x: 16, y: 18 } },
  { label: 'Packing Area', value: { x: 24, y: 10 } },
  { label: 'Outbound Dock', value: { x: 26, y: 24 } },
] as const;

const PRIORITY_COPY: Record<Priority, string> = {
  low: 'Flexible timing · bundle with slow routes',
  medium: 'Standard processing · typical workload',
  high: 'Time-sensitive · prioritise next available AGV',
  urgent: 'Critical dispatch · pre-empt other tasks',
};

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  urgent: 'outline',
};

export const CreateJobDialog = ({ open, onOpenChange }: CreateJobDialogProps) => {
  const { toast } = useToast();
  const { addJob, agvs } = useWarehouseStore(
    (state) => ({
      addJob: state.addJob,
      agvs: state.agvs,
    }),
    shallow
  );

  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    priority: 'medium' as Priority,
    pickupX: 5,
    pickupY: 5,
    dropX: 25,
    dropY: 25,
    assignmentMode: 'auto' as 'auto' | 'manual',
    manualAgvId: '',
  });

  const resetForm = useCallback(() => {
    setFormData({
      itemName: '',
      quantity: 1,
      priority: 'medium',
      pickupX: 5,
      pickupY: 5,
      dropX: 25,
      dropY: 25,
      assignmentMode: 'auto',
      manualAgvId: '',
    });
  }, []);

  const coordinateValid = useMemo(() => {
    const withinBounds = (value: number) => value >= MIN_COORD && value <= MAX_COORD;
    return {
      pickup: withinBounds(formData.pickupX) && withinBounds(formData.pickupY),
      drop: withinBounds(formData.dropX) && withinBounds(formData.dropY),
    };
  }, [formData.pickupX, formData.pickupY, formData.dropX, formData.dropY]);

  const closestAgv = useMemo(() => {
    if (agvs.length === 0) return null;

    let best = agvs[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const agv of agvs) {
      const dx = agv.position.x - formData.pickupX;
      const dy = agv.position.y - formData.pickupY;
      const distance = Math.hypot(dx, dy);

      if (distance < bestDistance) {
        bestDistance = distance;
        best = agv;
      }
    }

    return {
      agv: best,
      distance: Number(bestDistance.toFixed(1)),
    };
  }, [agvs, formData.pickupX, formData.pickupY]);

  const assignmentLabel = useMemo(() => {
    if (formData.assignmentMode === 'manual') {
      const manual = agvs.find((vehicle) => vehicle.id === formData.manualAgvId);
      return manual ? `Manual · ${manual.name}` : 'Manual · select AGV';
    }

    return closestAgv ? `Auto · ${closestAgv.agv.name}` : 'Auto assignment';
  }, [formData.assignmentMode, formData.manualAgvId, agvs, closestAgv]);

  const validateForm = useCallback((): string | null => {
    if (!formData.itemName.trim()) return 'Please provide an item name.';
    if (!Number.isFinite(formData.quantity) || formData.quantity < 1) return 'Quantity must be at least 1.';
    if (!coordinateValid.pickup) return 'Pickup coordinates must be between 0 and 30.';
    if (!coordinateValid.drop) return 'Drop coordinates must be between 0 and 30.';
    if (formData.assignmentMode === 'manual' && !formData.manualAgvId) return 'Select an AGV or choose automatic assignment.';
    if (formData.pickupX === formData.dropX && formData.pickupY === formData.dropY) {
      return 'Pickup and drop locations must be different.';
    }
    return null;
  }, [formData, coordinateValid]);

  const handleNumericChange = useCallback(
    (field: 'quantity' | 'pickupX' | 'pickupY' | 'dropX' | 'dropY') =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = Number(event.target.value);
        setFormData((prev) => ({
          ...prev,
          [field]: Number.isNaN(nextValue) ? prev[field] : nextValue,
        }));
      },
    []
  );

  const applyPreset = useCallback((type: 'pickup' | 'drop', x: number, y: number) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupX' : 'dropX']: x,
      [type === 'pickup' ? 'pickupY' : 'dropY']: y,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const error = validateForm();
    if (error) {
      toast({
        title: 'Check the entry',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    onOpenChange(false);

    addJob({
      itemName: formData.itemName.trim(),
      quantity: formData.quantity,
      priority: formData.priority,
      assignedAgv: formData.assignmentMode === 'manual' ? formData.manualAgvId : 'Auto',
      pickupLocation: { x: formData.pickupX, y: formData.pickupY, z: 0 },
      dropLocation: { x: formData.dropX, y: formData.dropY, z: 0 },
    });

    toast({
      title: 'Job created',
      description: `${formData.itemName} · ${formData.quantity} unit${formData.quantity === 1 ? '' : 's'} queued`,
    });

    resetForm();
  }, [addJob, formData, onOpenChange, resetForm, toast, validateForm]);

  const priorityBadgeVariant = PRIORITY_BADGE[formData.priority];

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? resetForm() : onOpenChange(next))}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <PackagePlus className="h-4 w-4 text-primary" />
            Create Job
          </DialogTitle>
          <DialogDescription>
            Define the payload and locations—dispatching can auto-select the best available AGV.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="itemName" className="text-sm">
                Item or Payload
              </Label>
              <Badge variant={priorityBadgeVariant} className="text-xs capitalize">
                Priority · {formData.priority}
              </Badge>
            </div>
            <Input
              id="itemName"
              value={formData.itemName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  itemName: event.target.value,
                }))
              }
              placeholder="e.g. Pallet #204 · Electronics"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Keep it descriptive so operators know what’s moving.</p>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,150px)_1fr]">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={handleNumericChange('quantity')}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: value,
                    }))
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Choose priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low · backfill when idle</SelectItem>
                    <SelectItem value="medium">Medium · standard queue</SelectItem>
                    <SelectItem value="high">High · time sensitive</SelectItem>
                    <SelectItem value="urgent">Urgent · immediate dispatch</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{PRIORITY_COPY[formData.priority]}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Navigation2 className="h-4 w-4 text-primary" />
              Route Coordinates
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  Pickup
                  {!coordinateValid.pickup && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      Out of bounds
                    </span>
                  )}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={formData.pickupX}
                    onChange={handleNumericChange('pickupX')}
                    placeholder="X"
                    className={cn('font-mono', !coordinateValid.pickup && 'border-destructive')}
                  />
                  <Input
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={formData.pickupY}
                    onChange={handleNumericChange('pickupY')}
                    placeholder="Y"
                    className={cn('font-mono', !coordinateValid.pickup && 'border-destructive')}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_PRESETS.slice(0, 3).map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="xs"
                      onClick={() => applyPreset('pickup', preset.value.x, preset.value.y)}
                      className="h-7 rounded-full border border-dashed border-border px-3 text-[11px]"
                    >
                      <MapPin className="mr-1 h-3 w-3 text-primary" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  Drop-off
                  {!coordinateValid.drop && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      Out of bounds
                    </span>
                  )}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={formData.dropX}
                    onChange={handleNumericChange('dropX')}
                    placeholder="X"
                    className={cn('font-mono', !coordinateValid.drop && 'border-destructive')}
                  />
                  <Input
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={formData.dropY}
                    onChange={handleNumericChange('dropY')}
                    placeholder="Y"
                    className={cn('font-mono', !coordinateValid.drop && 'border-destructive')}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_PRESETS.slice(2).map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="xs"
                      onClick={() => applyPreset('drop', preset.value.x, preset.value.y)}
                      className="h-7 rounded-full border border-dashed border-border px-3 text-[11px]"
                    >
                      <MapPin className="mr-1 h-3 w-3 text-primary" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Coordinates must stay between {MIN_COORD}–{MAX_COORD}. Pick and drop points cannot match.
            </p>
          </div>

          <div className="grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Assignment
              </div>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="flex items-center gap-1 text-[11px]">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {assignmentLabel}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {formData.assignmentMode === 'manual'
                      ? 'Manual mode overrides auto-selection.'
                      : closestAgv
                        ? `Closest AGV: ${closestAgv.agv.name} · ${closestAgv.distance}m away`
                        : 'No active AGVs detected.'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,160px)_1fr]">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.assignmentMode === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      assignmentMode: 'auto',
                      manualAgvId: '',
                    }))
                  }
                >
                  Smart routing
                </Button>
                <Button
                  type="button"
                  variant={formData.assignmentMode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      assignmentMode: 'manual',
                      manualAgvId: prev.manualAgvId || (agvs[0]?.id ?? ''),
                    }))
                  }
                  disabled={agvs.length === 0}
                >
                  Manual pick
                </Button>
              </div>

              {formData.assignmentMode === 'manual' && (
                <Select
                  value={formData.manualAgvId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      manualAgvId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AGV" />
                  </SelectTrigger>
                  <SelectContent>
                    {agvs.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} · {vehicle.status} · {vehicle.battery ?? 100}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {closestAgv && formData.assignmentMode === 'auto' && (
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Closest unit is <strong className="font-semibold">{closestAgv.agv.name}</strong> (
                {closestAgv.distance} m from pickup)
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Dispatch summary
            </div>
            <ul className="mt-2 grid gap-1 font-mono">
              <li>
                {formData.quantity} × {formData.itemName || '—'}
              </li>
              <li>
                Pickup → ({formData.pickupX}, {formData.pickupY}) · Drop → ({formData.dropX}, {formData.dropY})
              </li>
              <li>Priority → {formData.priority}</li>
              <li>Assignment → {assignmentLabel}</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create job</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
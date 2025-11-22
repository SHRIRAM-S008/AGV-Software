import { useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';

import { useWarehouseStore } from '@/store/warehouseStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const SPEED_PRESETS = [
  { label: '¼×', value: 0.25, hint: 'Slow-motion for debugging' },
  { label: '½×', value: 0.5, hint: 'Detailed monitoring' },
  { label: '1×', value: 1, hint: 'Real-time playback' },
  { label: '2×', value: 2, hint: 'Accelerated review' },
  { label: '4×', value: 4, hint: 'Stress test mode' },
] as const;

const getSpeedDescriptor = (speed: number) => {
  if (speed < 0.75) return 'Slow-mo';
  if (speed > 1.5) return 'Turbo';
  return 'Real-time';
};

export const SimulationControls = () => {
  const selectIsPlaying = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.isSimulationPlaying,
    []
  );
  const selectSimulationSpeed = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.simulationSpeed,
    []
  );
  const selectSetSimulationPlaying = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.setSimulationPlaying,
    []
  );
  const selectSetSimulationSpeed = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.setSimulationSpeed,
    []
  );
  const selectResetSimulation = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.resetSimulation,
    []
  );

  const isSimulationPlaying = useWarehouseStore(selectIsPlaying);
  const simulationSpeed = useWarehouseStore(selectSimulationSpeed);
  const setSimulationPlaying = useWarehouseStore(selectSetSimulationPlaying);
  const setSimulationSpeed = useWarehouseStore(selectSetSimulationSpeed);
  const resetSimulation = useWarehouseStore(selectResetSimulation);

  const speedLabel = useMemo(() => `${Number(simulationSpeed.toFixed(2)).toString().replace(/\.0+$/, '')}×`, [simulationSpeed]);
  const speedDescriptor = useMemo(() => getSpeedDescriptor(simulationSpeed), [simulationSpeed]);

  const applySpeed = useCallback(
    (value: number) => {
      const clamped = Math.min(4, Math.max(0.25, Number(value.toFixed(2))));
      setSimulationSpeed(clamped);
    },
    [setSimulationSpeed]
  );

  return (
    <Card className="border-border bg-card/90 p-4 shadow-sm backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gauge className="h-4 w-4 text-primary" />
              Simulation Controls
            </span>
            <p className="text-xs text-muted-foreground">Tune playback and reset the sandbox state.</p>
          </div>
          <Badge variant={isSimulationPlaying ? 'default' : 'secondary'} className="flex items-center gap-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isSimulationPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
              )}
            />
            {isSimulationPlaying ? 'Running' : 'Paused'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isSimulationPlaying ? 'secondary' : 'default'}
            size="sm"
            onClick={() => setSimulationPlaying(!isSimulationPlaying)}
            className="flex-1 gap-2"
          >
            {isSimulationPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={resetSimulation} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Clears active jobs and repositions AGVs
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium text-foreground">Speed</span>
              <span>{speedDescriptor}</span>
            </div>
            <span className="font-mono text-foreground">{speedLabel}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SPEED_PRESETS.map((preset) => (
              <Tooltip key={preset.value}>
                <TooltipTrigger asChild>
                  <Button
                    variant={Math.abs(simulationSpeed - preset.value) < 0.01 ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => applySpeed(preset.value)}
                  >
                    {preset.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">{preset.hint}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Slider
            value={[simulationSpeed]}
            onValueChange={(value) => applySpeed(value[0])}
            min={0.25}
            max={4}
            step={0.25}
            aria-label="Simulation speed"
            className="w-full"
          />

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0.25×</span>
            <span>1×</span>
            <span>4×</span>
          </div>

          <div aria-live="polite" className="sr-only">
            Simulation speed {speedLabel} ({speedDescriptor})
          </div>
        </div>
      </div>
    </Card>
  );
};
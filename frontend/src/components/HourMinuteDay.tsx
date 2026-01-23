import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useChartStore } from "store/useStore"

export function HourMinuteDay() {
  const selectedInterval = useChartStore((state) => state.selectedInterval);
  const selectedPeriod = useChartStore((state) => state.selectedPeriod);
  const setSelectedInterval = useChartStore((state) => state.setSelectedInterval);
  const setSelectedPeriod = useChartStore((state) => state.setSelectedPeriod);

  const minuteIntervals = ["1m", "3m", "5m", "30m"];
  const periodOptions = [
    { label: "1H", seconds: 60 * 60 },
    { label: "1D", seconds: 24 * 60 * 60 },
    { label: "7D", seconds: 7 * 24 * 60 * 60 }
  ];

  // Find which period label is currently active (if any)
  const getActivePeriodLabel = () => {
    if (!selectedPeriod) return null;
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(selectedPeriod);
    
    // Check which period matches (with some tolerance)
    for (const p of periodOptions) {
      if (Math.abs(diff - p.seconds) < 60) return p.label;
    }
    return null;
  };

  const activePeriodLabel = getActivePeriodLabel();

  const handleInterval = (interval: string) => {
    setSelectedInterval(interval); // This also resets period to null
  };

  const handlePeriod = (label: string, seconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - seconds;
    
    // If clicking the same period, toggle it off (go back to auto)
    if (activePeriodLabel === label) {
      setSelectedPeriod(null);
    } else {
      setSelectedPeriod(String(startTime));
    }
  };

  return (
    <div className="flex justify-between items-start gap-8">
      {/* Interval Buttons */}
      <ButtonGroup>
        {minuteIntervals.map((interval) => (
          <Button
            key={interval}
            variant="outline"
            size="sm"
            onClick={() => handleInterval(interval)}
            className={
              selectedInterval === interval
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                : ""
            }
          >
            {interval}
          </Button>
        ))}
      </ButtonGroup>

      {/* Period Buttons */}
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPeriod(null)}
          className={
            selectedPeriod === null
              ? "bg-green-500 text-white hover:bg-green-600 hover:text-white"
              : ""
          }
        >
          Auto
        </Button>
        {periodOptions.map((period) => (
          <Button
            key={period.label}
            variant="outline"
            size="sm"
            onClick={() => handlePeriod(period.label, period.seconds)}
            className={
              activePeriodLabel === period.label
                ? "bg-green-500 text-white hover:bg-green-600 hover:text-white"
                : ""
            }
          >
            {period.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
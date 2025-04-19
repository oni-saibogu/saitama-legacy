import moment, { type Moment } from "moment";
import { useEffect, useMemo, useState } from "react";

type TimerProps = {
  epoch?: Moment;
  maxTimeInMinutes: number;
};

export default function Timer({ epoch, maxTimeInMinutes }: TimerProps) {
  const [epochSeconds, setEposhSeconds] = useState(0);
  const relativeEpoch = useMemo(() => {
    const end = moment(epoch).add(maxTimeInMinutes, "minutes");
    const current = moment(epoch).add(epochSeconds, "seconds");

    return moment.duration(end.diff(current));
  }, [epoch, epochSeconds, maxTimeInMinutes]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEposhSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <p>
      {relativeEpoch.minutes().toString().padStart(2, "0")}:
      {relativeEpoch.seconds().toString().padStart(2, "0")}
    </p>
  );
}

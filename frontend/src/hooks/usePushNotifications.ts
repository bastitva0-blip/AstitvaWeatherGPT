import { useCallback, useState } from "react";
import { isPushGranted, requestPermission } from "../lib/push";

export function usePushNotifications() {
  const [granted, setGranted] = useState(isPushGranted());

  const enable = useCallback(async () => {
    const ok = await requestPermission();
    setGranted(ok);
    return ok;
  }, []);

  return { granted, enable };
}

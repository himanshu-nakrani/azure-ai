import { ModuleHook } from "@/lib/types";

interface ScenarioHookProps {
  hook: ModuleHook;
}

export default function ScenarioHook({ hook }: ScenarioHookProps) {
  return (
    <div className="scenario-hook">
      <p className="scenario-hook-label">You&apos;re on the hook for</p>
      <p className="scenario-hook-setup">{hook.setup}</p>
      <p className="scenario-hook-challenge">
        <span className="scenario-hook-arrow">→</span>
        {hook.challenge}
      </p>
    </div>
  );
}
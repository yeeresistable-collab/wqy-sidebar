import { useLocation, useNavigate } from "react-router-dom";
import { PolicyDraftingFlow } from "@/components/policy-drafting/PolicyDraftingFlow";

export default function PolicyDraftingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { initialTitle?: string } | undefined;

  return (
    <div className="h-full overflow-hidden p-6 md:p-8">
      <div className="h-full min-h-0">
        <PolicyDraftingFlow
          onBack={() => navigate("/policy-writing")}
          initialTitle={state?.initialTitle}
        />
      </div>
    </div>
  );
}

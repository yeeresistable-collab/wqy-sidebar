import { useNavigate } from "react-router-dom";
import { PolicyAssessmentFlow } from "@/components/policy-assessment/PolicyAssessmentFlow";

export default function PolicyPreEvaluationPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden p-6 md:p-8">
      <div className="h-full min-h-0">
        <PolicyAssessmentFlow onBack={() => navigate("/policy-writing")} />
      </div>
    </div>
  );
}

import CreateProblemForm from "@/features/problem/CreateProblemForm";
import { useParams } from "react-router-dom";

export default function UpdateProblem() {
  const { id: problemId } = useParams();
  return (
    <>
      <CreateProblemForm action="update" problemId={problemId} />
    </>
  );
}

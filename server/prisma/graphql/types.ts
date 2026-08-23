export interface ProblemsResponse {
  problemsetQuestionList: {
    total: number;
    questions: ProblemsResponseQuestion[];
  };
}

export interface ProblemsResponseQuestion {
  acRate: number;
  difficulty: "Easy" | "Medium" | "Hard";
  frontendQuestionId: string;
  paidOnly: boolean;
  title: string;
  titleSlug: string;
}

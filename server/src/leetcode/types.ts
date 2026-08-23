export interface ProblemsResponse {
  problemsetQuestionList: {
    total: number;
    questions: ProblemsResponseQuestion[];
  };
}

export interface ProblemsResponseQuestion {
  questionId: string;
  isPaidOnly: boolean;
  acRate: number;
  difficulty: "Easy" | "Medium" | "Hard";
  title: string;
  titleSlug: string;
}

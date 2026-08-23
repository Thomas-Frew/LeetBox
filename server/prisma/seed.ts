import axios from "axios";

import { prisma } from "../src/lib/db.js";
import { getProblems } from "../src/leetcode/queries.js";
import { graphqlEndpoint } from "../src/leetcode/constants.js";
import type { ProblemsResponse } from "../src/leetcode/types.js";

async function main() {
  const reqBody = {
    query: getProblems,
    variables: { categorySlug: "", skip: 0, limit: 100, filters: {} },
  };

  const response = await axios.post(graphqlEndpoint, reqBody, {
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
  });

  if (response.data.errors) {
    throw new Error(`GraphQL: ${JSON.stringify(response.data.errors)}`);
  }

  const { data } = response.data as { data: ProblemsResponse };

  const questions = data.problemsetQuestionList.questions
    .filter((q) => !q.isPaidOnly)
    .map((q) => ({
      id: Number(q.questionId),
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
    }));

  await prisma.$transaction([
    prisma.question.deleteMany({}),
    prisma.question.createMany({ data: questions }),
  ]);

  console.log(`seeded ${questions.length} questions`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

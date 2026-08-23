import { getProblems } from "./graphql/queries";
import { ProblemsResponse } from "./graphql/types";
import { graphqlEndpoint } from "./graphql/constants";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const prisma = new PrismaClient({ adapter });
import axios from "axios";

async function main() {
  let reqBody = {
    query: getProblems,
    variables: { categorySlug: "", skip: 0, limit: 100, filters: {} },
  };

  let headers = {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com",
  };

  let response = await axios.post(graphqlEndpoint, reqBody, {
    headers: headers,
  });

  if (response.data.errors) {
    throw new Error(`GraphQL: ${JSON.stringify(response.data.errors)}`);
  }

  const { data } = response.data as { data: ProblemsResponse };

  const questions = data.problemsetQuestionList.questions
    .filter((q) => !q.paidOnly)
    .map((q) => ({
      id: Number(q.frontendQuestionId),
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
    }));

  await prisma.$transaction([
    prisma.question.deleteMany({}),
    prisma.question.createMany({
      data: questions,
    }),
  ]);

  console.log(`seeded ${questions.length} questions`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

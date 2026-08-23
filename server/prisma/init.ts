import { getProblems } from "./graphql/queries";
import { graphqlEndpoint } from "./graphql/constants";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const prisma = new PrismaClient({ adapter });
import axios from "axios"

async function main() {
    let reqBody = {
        query: getProblems,
        variables: { categorySlug: "", skip: 0, limit: 100, filters: {} }
    }

    let headers = {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
    }

    let response = await axios.post(
        graphqlEndpoint,
        reqBody,
        {
            headers: headers
        }
    );

    console.log(response.data.data.problemsetQuestionList.questions[0]);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

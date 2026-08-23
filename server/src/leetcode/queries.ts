export const getProblems = /* GraphQL */ `
  query problemsetQuestionList(
    $categorySlug: String
    $limit: Int
    $skip: Int
    $filters: QuestionListFilterInput
  ) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        freqBar
        questionId: questionFrontendId
        isFavor
        isPaidOnly
        status
        title
        titleSlug
        topicTags {
          id
          name
          slug
        }
        hasSolution
        hasVideoSolution
      }
    }
  }
`;

export const setPaginationObjectForFrontend = (
    currentRound = 1,
    skip = 0,
    totalRounds = 0,
    limit = 10
) => ({
    currentRound,
    skip,
    totalRounds,
    limit
});
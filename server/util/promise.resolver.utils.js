export async function waitForPromises(promises, promiseLabels, next) {
    const results = await Promise.allSettled(promises);
    const rejectedResults = results.filter(
        (result) => result.status === "rejected"
    )
    if(rejectedResults.length === 1) {
        return next(new Error(rejectedResults[0].reason));
    }
    if(rejectedResults.length > 1) {
        return next(new AggregateError(rejectedResults.map((result) => result.reason), `${rejectedResults.length} promises failed`));
    }

    const successfulResults = results.filter((result) => result.status === "fulfilled")
    return successfulResults.map((result, index) => ({
        promise: promiseLabels[index],
        value: result.value
    }));
}

export function processResultsForAllPromises(resolvedPromises, defaultErrorMessage) {
    return {
        statusCode: 207,
        data: resolvedPromises.map(((resolvedPromise) => {
            if(!!resolvedPromise.value && resolvedPromise.value !== "not found") {
                return {
                    sourceDB: resolvedPromise.promise,
                    statusCode: 200
                }
            } else {
                return {
                    sourceDB: resolvedPromise.promise,
                    statusCode: 400,
                    message: `${defaultErrorMessage} ${resolvedPromise.promise}`
                }
            }
        }))
    }
}
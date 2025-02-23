/* Imports */
import {Temporal} from "@js-temporal/polyfill";

// Constants
const
    BENCHMARKS_DISABLED = "Benchmarks Not Enabled In DotEnv",
    BENCHMARKS_ENABLED = process.env.BENCHMARK_REQUESTS === 'true';

/* Exports */
export const captureTimestamp = () => Temporal.Now.instant();
export const compileTrackerData = (benchmarksCollected, apiBenchmarkEnd) => {
    // Set End TS of API Processing
    benchmarksCollected.timeStamps.apiCompletedAPIRequestTS = apiBenchmarkEnd;

    /* Time Elapses */
    // Elapsed Seconds Since Frontend Sent Request
    benchmarksCollected.timeElapsedSince.frontendRequestAndAPICompletion =
        apiBenchmarkEnd
            .since(benchmarksCollected.timeStamps.frontendAPIRequestTS)
            .milliseconds;

    // Elapsed Seconds Since Server Received Request
    benchmarksCollected.timeElapsedSince.sinceServerReceivedRequestAndAPICompletion =
        apiBenchmarkEnd
            .since(benchmarksCollected.timeStamps.serverReceivedAPIRequestTS)
            .milliseconds;

    // Elapsed Seconds Since API Completed Request
    benchmarksCollected.timeElapsedSince.apiCompletedRequestTS =
        apiBenchmarkEnd
            .since(benchmarksCollected.timeStamps.apiReceivedRequestTS)
            .milliseconds;

    return benchmarksCollected;
};
export const trackAPIReceiveTime = (req) => {
    if(BENCHMARKS_ENABLED) {
        req.apiBenchmarkerFor.timeStamps.apiReceivedRequestTS = captureTimestamp();
    }
    return req;
};
export const processBenchmarks = (req) => {
    if(BENCHMARKS_ENABLED) {
        return compileTrackerData(req.apiBenchmarkerFor, captureTimestamp())
    }

    return {
        message: BENCHMARKS_DISABLED
    };
};
import {Temporal} from "@js-temporal/polyfill";
import {captureTimestamp} from "../util/api.benchmarker.utils.js";

export const apiBenchmarkMiddleware = (req, res, next) => {
    if(process.env.BENCHMARK_REQUESTS === 'true') {
        console.log("BENCHMARKS ENABLED");

        // Set Server Received TS
        req.apiBenchmarkerFor = {
            timeStamps: {
                frontendAPIRequestTS: Temporal.Instant.from(req.body.frontendAPIRequestTS),
                serverReceivedAPIRequestTS: captureTimestamp(),
                apiReceivedRequestTS: null
            },
            timeElapsedSince: {
                frontendRequestAndAPICompletion: null,
                sinceServerReceivedRequestAndAPICompletion: null,
                apiCompletedRequestTS: null
            }
        }
    }
    return next();
}
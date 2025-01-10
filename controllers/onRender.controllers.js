export const OnRenderHealthCheckEndpoint = (req, res, next) => {
    return res.status(200).json({
        message: "Health Check",
        data: null
    });
}
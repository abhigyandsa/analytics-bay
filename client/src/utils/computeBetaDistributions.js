

export const computeBetaDistributions = (outreachData, enrichedReplies) => {
    const outreachCounts = {};
    const replyCounts = {};

    outreachData.forEach(entry => {
        if (!entry.employee) return;
        outreachCounts[entry.employee] = (outreachCounts[entry.employee] || 0) + 1;
    });

    enrichedReplies.forEach(reply => {
        if (!reply.employee) return;
        replyCounts[reply.employee] = (replyCounts[reply.employee] || 0) + 1;
    });

    const allEmployees = new Set([...Object.keys(outreachCounts), ...Object.keys(replyCounts)]);

    return Array.from(allEmployees).map(emp => {
        const success = replyCounts[emp] || 0;
        const attempts = outreachCounts[emp] || 0;
        const failure = attempts - success;

        const alpha = success + 1;
        const beta = failure + 1;

        return {
            employee: emp,
            alpha,
            beta
        };
    });
};

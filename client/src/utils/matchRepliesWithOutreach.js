const parseDate = (str) => {
  if (!str || typeof str !== "string") {
    console.warn("Invalid date input:", str);
    return new Date("Invalid");
  }

  const [day, month, year] = str.split("/").map(Number);
  const d = new Date(year, month - 1, day);

  if (isNaN(d)) {
    console.warn("Invalid parsed date:", str);
  }

  return d;
};

export const matchRepliesWithOutreach = (outreachData, repliesData) => {
  const outreachByProfile = {};

  outreachData.forEach(entry => {
    const profile = entry.profile_link;

    if (!profile || !entry.date) return;

    if (!outreachByProfile[profile]) {
      outreachByProfile[profile] = [];
    }

    outreachByProfile[profile].push({
      ...entry,
      dateObj: parseDate(entry.date)
    });
  });

  // Sort outreach messages per profile chronologically
  for (const profile in outreachByProfile) {
    outreachByProfile[profile].sort((a, b) => a.dateObj - b.dateObj);
  }

  // Match replies
  const matchedReplies = repliesData.map(reply => {
    const profile = reply.profile_link;
    if (!profile || !reply.date) {
      return { ...reply, employee: null, replyDateObj: new Date("Invalid") };
    }
    const replyDateObj = parseDate(reply.date);

    const outreachList = outreachByProfile[profile] || [];

    // Find the latest outreach before the reply
    const lastOutreach = [...outreachList]
      .filter(entry => entry.dateObj <= replyDateObj)
      .pop();

    if (!lastOutreach) {
      console.warn("No matching outreach found for reply:", reply);
    }

    return {
      ...reply,
      employee: lastOutreach ? lastOutreach.employee : null,
      replyDateObj,
    };
  });

  return matchedReplies;
};


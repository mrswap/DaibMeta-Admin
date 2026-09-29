import React from "react";

const TruncateText = ({ text, maxLength = 20, className = "" }) => {
  if (!text) return "-";

  const isLong = text.length > maxLength;
  const truncated = isLong ? text.slice(0, maxLength) + "..." : text;

  return (
    <span title={text} className={className}>
      {truncated}
    </span>
  );
};

export default TruncateText;

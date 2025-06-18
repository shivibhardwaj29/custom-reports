import React from "react";
import { Tooltip } from "antd";

const AuthorList = ({ authors = [], searchInput = "" }) => {
  const sortedAuthors = authors.slice().sort((a, b) => {
    const getFullName = (author) =>
      `${author?.contributor_id?.first_name || ""} ${
        author?.contributor_id?.last_name || ""
      }`.trim();

    const aName = getFullName(a);
    const bName = getFullName(b);

    const aIncludes = aName.toLowerCase().includes(searchInput?.toLowerCase());
    const bIncludes = bName.toLowerCase().includes(searchInput?.toLowerCase());

    if (aIncludes && !bIncludes) return -1;
    if (!aIncludes && bIncludes) return 1;

    return aName.localeCompare(bName);
  });

  const getFormattedName = (author) => {
    const { first_name, last_name } = author?.contributor_id || {};
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();
    return author?.is_corr ? `${fullName} (Corresponding)` : fullName;
  };

  const visibleAuthors = sortedAuthors.slice(0, 3).map(getFormattedName);
  const hiddenAuthors = sortedAuthors.slice(3).map(getFormattedName);

  return (
    <div>
      {visibleAuthors.join(", ")}
      {hiddenAuthors.length > 0 && (
        <>
          ,{" "}
          <Tooltip title={hiddenAuthors.join(", ")}>
            <span style={{ color: "#1890ff", cursor: "pointer" }}>
              ...and {hiddenAuthors.length} more
            </span>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default AuthorList;

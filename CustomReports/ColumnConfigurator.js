import React, { useEffect, useRef, useState } from "react";
import { Tree, Drawer, Button, Radio } from "antd";
import { ARTICLE_CONFIG, PUBLISHED_ARTICLE_FIELDS } from "./ArticleConfig";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { toCamelCase } from "../../../enums/JournalEnums";
import { getValueFromPath, STANDARD_REPORTS_NAMES } from "../ReportEnum";
import { getCurrentTaskFromProcessList } from "../../../utils/taskUtils";
import AuthorList from "./AuthorList";
import { JOURNAL_CONFIG, JOURNAL_METADATA_FIELDS } from "./JournalConfig";
import { ISSUE_CONFIG } from "./IssueConfig";
import { formatDateWithTime } from "../../../utils/formatDateTime";
import { ARTICLE_STATUS } from "../../Articles/constants";
import { ISSUE_STATUS } from "../../Issues/IssueEnums";
import { WORKFLOW_ENTITY_TYPE } from "../../ConfigurationManagement/configEnum";

const ColumnConfigurator = ({
  isStandardReport = false,
  currentReport = "",
  visible,
  onClose,
  columns,
  setColumns,
  handleSort,
  getSortIcon,
  debouncedFilters,
  entitySelected,
  setEntitySelected,
  onReset,
}) => {
  const [treeData, setTreeData] = useState(
    isStandardReport
      ? currentReport === STANDARD_REPORTS_NAMES.PUBLISHED_ARTICLE
        ? PUBLISHED_ARTICLE_FIELDS
        : JOURNAL_METADATA_FIELDS
      : ARTICLE_CONFIG
  );
  const [filteredTreeData, setFilteredTreeData] = useState(
    isStandardReport
      ? currentReport === STANDARD_REPORTS_NAMES.PUBLISHED_ARTICLE
        ? PUBLISHED_ARTICLE_FIELDS
        : JOURNAL_METADATA_FIELDS
      : ARTICLE_CONFIG
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const wrapperRef = useRef();

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const columnKeys = columns?.map((col) => col.key);
    // console.log(columnKeys, "columnKeys");
    setCheckedKeys(columnKeys);
  }, [columns]);

  const enhanceWithCheckboxes = (nodes, level = 0) =>
    nodes?.map((node) => {
      const isLeaf = !node.children;
      return {
        ...node,
        checkable: isLeaf,
        rawTitle: node.title,
        title: (
          <div
            style={{
              position: "relative",
              paddingLeft: level > 0 ? "10px" : "0",
              marginLeft: level > 0 ? "10px" : "0",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {node.title}
          </div>
        ),
        children: node.children
          ? enhanceWithCheckboxes(node.children, level + 1)
          : undefined,
      };
    });

  useEffect(() => {
    if (!isStandardReport) {
      const enhanced = enhanceWithCheckboxes(
        entitySelected === "Article"
          ? ARTICLE_CONFIG
          : entitySelected === "Journal"
          ? JOURNAL_CONFIG
          : ISSUE_CONFIG
      );
      setTreeData(enhanced);
      setFilteredTreeData(enhanced);
    }
  }, [entitySelected, isStandardReport]);

  const filterTreeData = (nodes, term) => {
    const expandedKeys = [];

    const filter = (nodes) => {
      return nodes
        .map((node) => {
          const titleStr = node?.rawTitle || "";
          const children = node.children ? filter(node.children) : [];

          const isMatch = titleStr.toLowerCase().includes(term.toLowerCase());

          if (isMatch || children.length > 0) {
            if (children.length > 0) {
              expandedKeys.push(node.key);
            }
            return {
              ...node,
              children,
            };
          }
          return null;
        })
        .filter((node) => node !== null);
    };

    return { filtered: filter(nodes), expandedKeys };
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const { filtered, expandedKeys } = filterTreeData(treeData, term);
      setFilteredTreeData(filtered);
      setExpandedKeys(expandedKeys);
    } else {
      setFilteredTreeData(treeData);
      setExpandedKeys([]);
    }
  };

  const flattenTree = (nodes) => {
    let result = [];
    nodes.forEach((node) => {
      if (!node.children) {
        result.push(node);
      } else {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  };

  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys);
  };

  const handleSave = () => {
    if (checkedKeys?.length > 0) {
      setColumns((currentCols) => {
        const allLeafNodes = flattenTree(
          isStandardReport
            ? currentReport === STANDARD_REPORTS_NAMES.PUBLISHED_ARTICLE
              ? PUBLISHED_ARTICLE_FIELDS
              : JOURNAL_METADATA_FIELDS
            : entitySelected === "Article"
            ? ARTICLE_CONFIG
            : entitySelected === "Journal"
            ? JOURNAL_CONFIG
            : ISSUE_CONFIG
        );
        const existingKeys = currentCols?.map((col) => col.key);
        const newKeys = checkedKeys.filter(
          (key) => !existingKeys.includes(key)
        );

        const remainingCols = currentCols.filter((col) =>
          checkedKeys.includes(col.key)
        );
        if (isStandardReport) {
          setEntitySelected(
            currentReport === STANDARD_REPORTS_NAMES.PUBLISHED_ARTICLE
              ? "Article"
              : "Journal"
          );
        }
        const newColumns = allLeafNodes
          .filter((node) => newKeys.includes(node.key))
          .map((node) => ({
            title: (
              <span
                className="flex gap-5"
                onClick={() => handleSort(node.dataIndex)}
                style={{ cursor: "pointer" }}
              >
                {node.rawTitle || node.title} {getSortIcon(node.dataIndex)}
              </span>
            ),
            rawTitle: node.rawTitle || node.title,
            dataIndex: node.dataIndex,
            key: node.key,
            domainCategory: node?.domainCategory,
            type: node?.type,
            labelKey: node?.labelKey,
            options: node?.options,
            entity: node?.entity,
            render: (val, record) => {
              if (node.title === "Current Task") {
                const currentTask = getCurrentTaskFromProcessList(
                  record?.entity_map?.process_list
                );
                return (
                  currentTask?.process_id?.process_name ??
                  (record?.issue_status === ISSUE_STATUS.PUBLISHED ||
                  record?.article_status === ARTICLE_STATUS.PUBLISHED
                    ? "Published"
                    : null)
                );
              } else if (node.title === "Author") {
                // console.log("Node dataIndex:", node.dataIndex);
                // console.log(
                //   debouncedFilters?.[node.dataIndex]?.value,
                //   "debouncedFilters?.[node.dataIndex]?.value"
                // );

                return (
                  <AuthorList
                    authors={record?.entity_map?.authors || []}
                    searchInput={
                      debouncedFilters?.[String(node.dataIndex).trim()]
                        ?.value || ""
                    }
                  />
                );
              } else if (node.title === "Assigned User") {
                const currentTask = getCurrentTaskFromProcessList(
                  record?.entity_map?.process_list
                );
                const latestAssignment =
                  currentTask?.entity_process_assignment_id?.at(-1);
                const user = latestAssignment?.user_id;
                const fullName = [user?.fname, user?.lname]
                  .filter(Boolean)
                  .join(" ");
                return fullName || null;
              } else if (
                [
                  "article_status",
                  "journal_status",
                  "issue_type",
                  "cover_month",
                  "issue_status",
                  "journal_article_info.oa_type",
                ]?.includes(node.key)
              ) {
                return toCamelCase(getValueFromPath(record, node.dataIndex));
              } else if (["created_on", "updated_on"]?.includes(node.key)) {
                return formatDateWithTime(
                  getValueFromPath(record, node.dataIndex)
                );
              } else if (
                [
                  "updated_by",
                  "created_by",
                  "supplier_contact_id",
                  "partner_contact_id",
                ]?.includes(node?.key)
              ) {
                const user = record?.[node?.key];
                const fullName = [user?.fname, user?.lname]
                  .filter(Boolean)
                  .join(" ");
                return fullName || null;
              } else if (["workflow_alias"]?.includes(node?.key)) {
                return record?.journal_workflow_id?.workflow_alias;
              } else if (["Article Categories"]?.includes(node?.title)) {
                const categories = Array.from(
                  new Set(
                    (record?.journal_article_info?.journal_article_type || [])
                      .map(
                        (item) =>
                          item?.article_type_id?.article_category_id
                            ?.category_name
                      )
                      .filter(Boolean)
                  )
                );
                return categories.length ? categories.join(", ") : null;
              } else if (
                [
                  "journal_workflows.article",
                  "journal_workflows.issue",
                ]?.includes(node?.key)
              ) {
                const defaultArticle = record?.journal_workflows?.find(
                  (wf) =>
                    wf.is_default &&
                    wf.workflow_id?.entity_type ===
                      (node?.key === "journal_workflows.article"
                        ? WORKFLOW_ENTITY_TYPE.ARTICLE
                        : WORKFLOW_ENTITY_TYPE.ISSUE)
                );
                return defaultArticle?.workflow_alias || "";
              } else if (node?.type === "boolean") {
                const value = getValueFromPath(record, node.dataIndex);
                return value === true ? "Yes" : value === false ? "No" : null;
              } else {
                return getValueFromPath(record, node.dataIndex);
              }
            },
          }));
        console.log([...currentCols, ...newColumns]);

        return [...remainingCols, ...newColumns];
      });

      onClose();
    }
  };

  const onChange = (e) => {
    setEntitySelected(e.target.value);
    setCheckedKeys([]);
    onReset();
    console.log("Selected:", e.target.value);
  };

  return (
    <Drawer
      placement="right"
      open={visible}
      width={650}
      closable={false}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "16px",
        },
      }}
    >
      {" "}
      <div className="flex justify-between items-center">
        <div className="text-[#3a3b3c] text-xl font-medium leading-normal">
          Add/Remove Field
        </div>
        <div className="flex gap-3">
          <Button
            icon={<CloseOutlined />}
            onClick={onClose}
            type="button"
            style={{
              border: "1px solid black",
              fontSize: "20px",
              padding: "6px 6px",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
      {!isStandardReport && (
        <div className="mt-5">
          <Radio.Group onChange={onChange} value={entitySelected}>
            <div className="ms-2 flex gap-10">
              <Radio value="Article">Article</Radio>
              <Radio value="Journal">Journal</Radio>
              <Radio value="Issue">Issue</Radio>
            </div>
          </Radio.Group>
        </div>
      )}
      <div
        className="search-input mb-3 mt-5 p-4"
        style={{
          height: "32px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #d9d9d9",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          boxShadow: "none",
        }}
      >
        <SearchOutlined style={{ color: "#aaa", marginRight: "8px" }} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "14px",
            color: "#333",
            width: "200px",
          }}
          placeholder="Search"
        />
      </div>
      <div className="flex-1 overflow-auto min-h-[0] mb-4">
        <Tree
          treeData={filteredTreeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          checkedKeys={checkedKeys}
          onCheck={onCheck}
          showLine={{ showLeafIcon: false }}
          checkable
          defaultExpandAll={true}
        />
      </div>
      <div className="p-4 border-t border-gray-300 flex justify-between items-center bg-white">
        <div className="text-sm text-gray-500">
          {checkedKeys?.length > 0 ? checkedKeys?.length + " selected" : ""}
        </div>

        <div className="flex gap-3">
          <Button
            color="default"
            variant="outlined"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            color="default"
            variant="solid"
            className="btn-primary"
            onClick={handleSave}
            disabled={checkedKeys?.length === 0}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default ColumnConfigurator;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Table,
  Dropdown,
  Menu,
  Pagination,
  Select,
  Card,
  message,
  DatePicker,
} from "antd";
import {
  FilterOutlined,
  HeartFilled,
  HeartOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  ARTICLE_FIELDS,
  dateTypeFilterOptions,
  dropdownTypeFilterOptions,
  filterOptions,
  JOURNAL_FIELDS,
  operatorsWithoutValue,
  STANDARD_REPORTS_NAMES,
} from "../ReportEnum";
import { DndProvider } from "react-dnd";
import DraggableHeaderCell from "../../components/shared/DraggableHeaderCell";
import { HTML5Backend } from "react-dnd-html5-backend";
import ColumnConfigurator from "./ColumnConfigurator";
import { CombinedSortIcon } from "../../../utils/TableSort";
import useReportData from "../../../hooks/useReportData";
import { EntityNames } from "../../../services/entities";
import Loader from "../../components/Loader";
import { fetchEntityData } from "../../../store/slices/fetchEntitySlice";
import { debounce } from "lodash";
import PageTitle from "../../components/shared/PageTitle";
import CustomBreadcrumb from "../../components/shared/CustomBreadcrumb";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import SaveModal from "./SaveModal";
import { toCamelCase, VISIBILITY_OPTS_VALS } from "../../../enums/JournalEnums";
import { usePostData } from "../../../hooks/useData";
import { ENDPOINTS } from "../../../services/endpoints";
import dayjs from "dayjs";
import { getCurrentTaskFromProcessList } from "../../../utils/taskUtils";
import AuthorList from "./AuthorList";
import { ISSUE_STATUS, issueFields } from "../../Issues/IssueEnums";
import { formatDateWithTime } from "../../../utils/formatDateTime";
import { ARTICLE_STATUS } from "../../Articles/constants";
import { WORKFLOW_ENTITY_TYPE } from "../../ConfigurationManagement/configEnum";
import RoleEnum from "../../../enums/RoleEnum";
import { STANDARD_REPORTS } from "../StandardReports/StandardFields";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const { RangePicker } = DatePicker;

const CustomReport = ({ isStandardReport = false, currentReport }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sortOrder, setSortOrder] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [entitySelected, setEntitySelected] = useState("Article");
  const [isSaved, setIsSaved] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchInputs, setSearchInputs] = useState({});
  const currentPage = pageIndex + 1;
  const { data, loading, fetchReportData, totalRecords } = useReportData();
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const { mutate } = usePostData();
  const authorDataIndex = "entity_map.authors.contributor_id.first_name";

  const getSortIcon = (field) => (
    <CombinedSortIcon sortOrder={sortField === field ? sortOrder : null} />
  );

  const [columns, setColumns] = useState([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [savedReport, setSavedReport] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reportState, setReportState] = useState({
    columns: [],
    filters: {},
    sort: {
      field: null,
      order: null,
    },
    pagination: {
      pageIndex: 0,
      limit: 10,
    },
    entitySelected: entitySelected,
  });
  const breadcrumbItems = [
    {
      label: "Reports",
      onClick: () => navigate("/reports"),
    },
    {
      label: "Custom Reports",
      onClick: () => navigate("/report/custom-reports"),
    },
    { label: savedReport ? savedReport?.report_name : "Create New Report" },
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      const nextOrder =
        sortOrder === "ASC" ? "DESC" : sortOrder === "DESC" ? null : "ASC";
      setSortOrder(nextOrder);
      if (!nextOrder) {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  const handleInputChange = (key, dataIndex, value) => {
    const isMultiSelect = Array.isArray(value);
    const finalValue = isMultiSelect ? value.join(",") : value;
    setPageIndex(0);
    setFilters((prev) => ({
      ...prev,
      [dataIndex]: {
        ...prev[dataIndex],
        value: finalValue,
        filterType: isMultiSelect
          ? "in"
          : prev[dataIndex]?.filterType || "like",
      },
    }));
  };

  const debouncedHandleInputChange = useCallback(
    debounce((key, value) => {
      setPageIndex(0);
      setDebouncedFilters((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          value,
        },
      }));
    }, 800),
    []
  );
  const handlePaginationChange = (page, size) => {
    setPageIndex(page - 1);
    setLimit(size);
  };

  const handleFilterSelect = (key, dataIndex, filterType) => {
    const col = columns.find((c) => c.dataIndex === dataIndex);
    const isOperatorWithoutValue = operatorsWithoutValue.includes(filterType);
    const newValue = isOperatorWithoutValue
      ? ""
      : filters[dataIndex]?.value || "";
    console.log(newValue, "newValue");

    setFilters((prev) => ({
      ...prev,
      [dataIndex]: {
        ...prev[dataIndex],
        filterType,
        value: newValue,
      },
    }));
    setPageIndex(0);

    if (isOperatorWithoutValue) {
      setSearchInputs((prev) => ({ ...prev, [dataIndex]: "" }));
      setDebouncedFilters((prev) => ({
        ...prev,
        [dataIndex]: { value: "" },
      }));
      if (col.type === "dropdown") {
        setFilters((prev) => {
          const updated = { ...prev };
          if (updated[dataIndex]) {
            const { value, ...rest } = updated[dataIndex];
            updated[dataIndex] = rest;
          }
          return updated;
        });
      }
    } else {
      if (newValue && newValue !== "") {
        if (col?.type !== "dropdown") {
          setSearchInputs((prev) => ({
            ...prev,
            [dataIndex]: prev[dataIndex] || "",
          }));
          setDebouncedFilters((prev) => ({
            ...prev,
            [dataIndex]: {
              value: searchInputs[dataIndex] || "",
            },
          }));
        } else {
          setDebouncedFilters((prev) => ({
            ...prev,
            [dataIndex]: {
              value: newValue,
            },
          }));
        }
      }
    }
  };

  const getFilterMenu = (colKey, colDataIndex, colType) => {
    let options;

    if (colType === "dropdown") {
      options = dropdownTypeFilterOptions;
    } else if (["date", "dateTime"]?.includes(colType)) {
      options = dateTypeFilterOptions;
    } else {
      options = filterOptions;
    }

    return (
      <Menu
        onClick={({ key }) => handleFilterSelect(colKey, colDataIndex, key)}
        selectedKeys={[filters[colDataIndex]?.filterType]}
      >
        {options.map((option) => (
          <Menu.Item key={option?.value}>{option?.label}</Menu.Item>
        ))}
      </Menu>
    );
  };

  const getMoreMenu = (colKey, colDataIndex) => (
    <Menu
      onClick={({ key }) => {
        handleMoreAction(colKey, colDataIndex, key);
      }}
    >
      <Menu.Item key="Reset">Reset</Menu.Item>
      <Menu.Item key="Remove" className="text-red-500">
        Remove Column
      </Menu.Item>
    </Menu>
  );

  const handleMoreAction = (colKey, colDataIndex, action) => {
    if (action === "Reset") {
      setSearchInputs((prev) => ({ ...prev, [colDataIndex]: "" }));
      setPageIndex(0);
      setFilters((prev) => {
        const updated = { ...prev };
        delete updated[colDataIndex];
        return updated;
      });
      debouncedHandleInputChange(colDataIndex, "");
    } else if (action === "Remove") {
      setColumns((prevCols) => prevCols.filter((col) => col.key !== colKey));
      setFilters((prev) => {
        const updated = { ...prev };
        delete updated[colDataIndex];
        return updated;
      });
      debouncedHandleInputChange(colDataIndex, "");
    }
  };

  const moveColumn = useCallback(
    (dragIndex, hoverIndex) => {
      const updated = [...columns];
      const dragged = updated[dragIndex];
      updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, dragged);
      setColumns(updated);
    },
    [columns]
  );

  const loadEntityOptions = async (
    rawTitle,
    dataIndex,
    entity,
    labelKey,
    page = 0,
    size = 5000,
    domainCategory
  ) => {
    const isIncludeIdInValue = [
      "Current Task",
      "Assigned User",
      "Author",
      "Created By",
      "Modified By",
      "Article Workflow",
      "Issue Workflow",
      "Workflow Alias",
      "Article Categories",
      "Supplier Contact",
      "Partner Contact",
    ]?.includes(rawTitle);
    const workflowEntity = entity === EntityNames.JOURNAL_WORKFLOW;
    const currentData = dynamicOptions[dataIndex] || {
      options: [],
      page: 0,
      hasMore: true,
      loading: false,
    };
    if (currentData.loading || !currentData.hasMore) return;
    setDynamicOptions((prev) => ({
      ...prev,
      [dataIndex]: {
        ...currentData,
        loading: true,
      },
    }));

    let body =
      labelKey !== "fname"
        ? {
            fields: `id,${labelKey}`,
          }
        : {
            fields: "id,fname,lname",
          };
    if (workflowEntity) {
      body = {
        ...body,
        logicalOperator: "AND",
        filters: [
          {
            path: "workflow_id.entity_type",
            operator: "equals",
            value:
              rawTitle === "Article Workflow" || rawTitle === "Workflow Alias"
                ? "ARTICLE"
                : "ISSUE",
          },
          {
            path: "is_default",
            operator: "is-true",
            value: null,
          },
        ],
      };
    }
    if (domainCategory) {
      body = {
        ...body,
        logicalOperator: "AND",
        filters: [
          {
            path: "domain_category",
            operator: "equals",
            value: domainCategory,
          },
        ],
      };
    }
    if (rawTitle === "Supplier Contact") {
      body = {
        ...body,
        logicalOperator: "AND",
        filters: [
          {
            path: "user_roles.role_id.role_group_alias_id.role_group_name",
            operator: "equals",
            value: RoleEnum.SUPPLIER,
          },
        ],
      };
    }
    if (rawTitle === "Partner Contact") {
      body = {
        ...body,
        logicalOperator: "AND",
        filters: [
          {
            path: "user_roles.role_id.role_group_alias_id.role_group_name",
            operator: "equals",
            value: RoleEnum.PARTNER,
          },
        ],
      };
    }
    try {
      const response = await dispatch(
        fetchEntityData({
          entity,
          page,
          size,
          body,
        })
      );

      const content = response?.payload?.data?.data?.content || [];
      console.log(content, "content");

      const existingValues = new Set(
        currentData.options.map((opt) => opt.value)
      );
      const newOptions = content
        .filter((item) => {
          const label =
            labelKey !== "fname"
              ? item[labelKey]
              : `${item?.fname || ""} ${item?.lname || ""}`.trim();

          const value = isIncludeIdInValue ? item.id : label;
          return label && !existingValues.has(value);
        })
        .map((item) => ({
          label:
            labelKey !== "fname"
              ? item[labelKey]
              : `${item?.fname || ""} ${item?.lname || ""}`.trim(),
          value: isIncludeIdInValue
            ? item.id
            : labelKey !== "fname"
            ? item[labelKey]
            : `${item?.fname || ""} ${item?.lname || ""}`.trim(),
        }));

      console.log(newOptions, "newOptions");

      const updatedOptions = [...currentData.options, ...newOptions];

      console.log("Updated Options for", dataIndex, updatedOptions);
      const hasMore = content.length === size;

      setDynamicOptions((prev) => ({
        ...prev,
        [dataIndex]: {
          options: updatedOptions,
          page: page + 1,
          hasMore,
          loading: false,
        },
      }));
    } catch (err) {
      console.error(`Error loading options for ${entity}`, err);
      setDynamicOptions((prev) => ({
        ...prev,
        [dataIndex]: {
          ...currentData,
          loading: false,
        },
      }));
    }
  };

  const renderHeaderTitle = (col) => {
    const isIncludeIdInValue = [
      "Current Task",
      "Assigned User",
      "Author",
      "Created By",
      "Modified By",
      "Article Workflow",
      "Issue Workflow",
      "Workflow Alias",
      "Article Categories",
      "Supplier Contact",
      "Partner Contact",
    ]?.includes(col?.rawTitle);
    return (
      <div className="flex flex-col gap-1">
        <div
          className="flex justify-between items-center w-full"
          style={{ cursor: "pointer" }}
        >
          <span>{col.rawTitle}</span>
          <span className="flex items-center gap-2">
            {!isIncludeIdInValue && (
              <span onClick={() => handleSort(col.dataIndex)}>
                {getSortIcon(col.dataIndex)}
              </span>
            )}

            <Dropdown
              overlay={getMoreMenu(col.key, col.dataIndex)}
              trigger={["click"]}
            >
              <MoreOutlined
                style={{
                  cursor: "pointer",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </span>
        </div>
        {col.type === "dropdown" ? (
          <div
            className="flex items-center border border-gray-300 rounded px-2 bg-[#f5f5f5]"
            style={{ height: "32px", width: "100%", minWidth: 200 }}
            // onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              overlay={getFilterMenu(col.key, col.dataIndex, col?.type)}
              trigger={["click"]}
            >
              <FilterOutlined
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: "pointer",
                  color: filters[col.dataIndex]?.filterType
                    ? "#1677ff"
                    : "#aaa",
                  marginRight: "8px",
                }}
              />
            </Dropdown>
            <Select
              mode="multiple"
              showSearch
              placeholder="Select"
              optionFilterProp="label"
              value={(() => {
                const isIncludeIdInValue =
                  [
                    "entity_map.process_list.process_id.id",
                    "entity_map.process_list.entity_process_assignment_id.user_id.id",
                    "created_by.id",
                    "updated_by.id",
                  ].includes(col.dataIndex) ||
                  [
                    "Article Workflow",
                    "Issue Workflow",
                    "Workflow Alias",
                    "Article Categories",
                    "Supplier Contact",
                    "Partner Contact",
                  ]?.includes(col?.rawTitle);

                const values = filters[col.dataIndex]?.value
                  ? filters[col.dataIndex].value.split(",").filter((v) => v)
                  : [];

                return isIncludeIdInValue
                  ? values.map((v) => parseInt(v, 10))
                  : values;
              })()}
              maxTagCount={0}
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
              style={{ flex: 1, backgroundColor: "transparent", width: "100%" }}
              className="custom-select-bg border-none shadow-none"
              onDropdownVisibleChange={(open) => {
                console.log("Dropdown opened for", col.dataIndex, open);
                if (open && col?.entity) {
                  const currentPage = dynamicOptions[col.dataIndex]?.page || 0;
                  if (
                    !dynamicOptions[col.dataIndex]?.options?.length &&
                    !dynamicOptions[col.dataIndex]?.loading
                  ) {
                    loadEntityOptions(
                      col.rawTitle,
                      col.dataIndex,
                      col.entity,
                      col?.labelKey ?? col.key,
                      currentPage,
                      5000,
                      col?.domainCategory
                    );
                  }
                }
              }}
              onPopupScroll={(e) => {
                const target = e.target;
                const { scrollTop, scrollHeight, clientHeight } = target;

                const data = dynamicOptions[col.dataIndex];
                const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

                if (atBottom && data?.hasMore && !data?.loading) {
                  loadEntityOptions(
                    col.rawTitle,
                    col.dataIndex,
                    col.entity,
                    col?.labelKey ?? col.key,
                    data.page,
                    5000,
                    col?.domainCategory
                  );
                }
              }}
              onChange={(value) => {
                handleInputChange(col.key, col.dataIndex, value);
                debouncedHandleInputChange(col.dataIndex, value.join(","));
              }}
              options={
                dynamicOptions[col.dataIndex]?.options?.length
                  ? dynamicOptions[col.dataIndex].options
                  : col.options || []
              }
              notFoundContent={
                dynamicOptions[col.dataIndex]?.loading ? (
                  <Loader size="small" />
                ) : (
                  <span className="text-sm text-gray-500">No Data</span>
                )
              }
              disabled={operatorsWithoutValue?.includes(
                filters[col.dataIndex]?.filterType
              )}
              bordered={false}
              dropdownStyle={{ zIndex: 1050 }}
            />
          </div>
        ) : col.type === "date" ? (
          <div
            className="flex items-center border border-gray-300 rounded px-2 bg-[#f5f5f5]"
            style={{ height: "32px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              overlay={getFilterMenu(col.key, col.dataIndex, col?.type)}
              trigger={["click"]}
            >
              <FilterOutlined
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: "pointer",
                  color: filters[col.dataIndex]?.filterType
                    ? "#1677ff"
                    : "#aaa",
                  marginRight: "8px",
                }}
              />
            </Dropdown>

            {filters[col.dataIndex]?.filterType === "between" ? (
              <RangePicker
                onChange={(dates, dateStrings) => {
                  const filterValue = dateStrings.join(",");
                  setFilters((prev) => ({
                    ...prev,
                    [col.dataIndex]: {
                      ...prev[col.dataIndex],
                      value: filterValue,
                      filterType: "between",
                    },
                  }));
                  debouncedHandleInputChange(col.dataIndex, filterValue);
                }}
                value={
                  typeof filters[col.dataIndex]?.value === "string"
                    ? filters[col.dataIndex].value
                        .split(",")
                        .map((d) => (d ? dayjs(d, "YYYY-MM-DD") : null))
                    : Array.isArray(filters[col.dataIndex]?.value)
                    ? filters[col.dataIndex].value.map((d) =>
                        d ? dayjs(d, "YYYY-MM-DD") : null
                      )
                    : []
                }
                style={{ border: "none", background: "transparent", flex: 1 }}
                className="w-full"
                placeholder={["From", "To"]}
              />
            ) : (
              <DatePicker
                onChange={(date, dateString) => {
                  setFilters((prev) => ({
                    ...prev,
                    [col.dataIndex]: {
                      ...prev[col.dataIndex],
                      value: dateString,
                      filterType: "like",
                    },
                  }));
                  debouncedHandleInputChange(col.dataIndex, dateString);
                }}
                value={
                  filters[col.dataIndex]?.value
                    ? dayjs(filters[col.dataIndex]?.value, "YYYY-MM-DD")
                    : null
                }
                style={{ border: "none", background: "transparent", flex: 1 }}
                className="w-full"
                placeholder="Select Date"
              />
            )}
          </div>
        ) : col.type === "dateTime" ? (
          <div
            className="flex items-center border border-gray-300 rounded px-2 bg-[#f5f5f5]"
            style={{ height: "32px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              overlay={getFilterMenu(col.key, col.dataIndex, col?.type)}
              trigger={["click"]}
            >
              <FilterOutlined
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: "pointer",
                  color: filters[col.dataIndex]?.filterType
                    ? "#1677ff"
                    : "#aaa",
                  marginRight: "8px",
                }}
              />
            </Dropdown>

            {filters[col.dataIndex]?.filterType === "between" ? (
              <RangePicker
                showTime
                onChange={(dates, dateStrings) => {
                  const filterValue = dateStrings.join(",");
                  setFilters((prev) => ({
                    ...prev,
                    [col.dataIndex]: {
                      ...prev[col.dataIndex],
                      value: filterValue,
                      filterType: "between",
                    },
                  }));
                  debouncedHandleInputChange(col.dataIndex, filterValue);
                }}
                value={
                  typeof filters[col.dataIndex]?.value === "string"
                    ? filters[col.dataIndex].value
                        .split(",")
                        .map((d) => (d ? dayjs(d) : null))
                    : Array.isArray(filters[col.dataIndex]?.value)
                    ? filters[col.dataIndex].value.map((d) =>
                        d ? dayjs(d) : null
                      )
                    : []
                }
                style={{ border: "none", background: "transparent", flex: 1 }}
                className="w-full"
                placeholder={["From", "To"]}
              />
            ) : (
              <DatePicker
                showTime
                onChange={(date, dateString) => {
                  setFilters((prev) => ({
                    ...prev,
                    [col.dataIndex]: {
                      ...prev[col.dataIndex],
                      value: dateString,
                      filterType: "like",
                    },
                  }));
                  debouncedHandleInputChange(col.dataIndex, dateString);
                }}
                value={
                  filters[col.dataIndex]?.value
                    ? dayjs(filters[col.dataIndex]?.value)
                    : null
                }
                style={{ border: "none", background: "transparent", flex: 1 }}
                className="w-full"
                placeholder="Select Date & Time"
              />
            )}
          </div>
        ) : (
          <div
            className="flex items-center border border-gray-300 rounded px-2 bg-[#f5f5f5]"
            style={{ height: "32px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              overlay={getFilterMenu(col.key, col.dataIndex, col?.type)}
              trigger={["click"]}
            >
              <FilterOutlined
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: "pointer",
                  color: filters[col.dataIndex]?.filterType
                    ? "#1677ff"
                    : "#aaa",
                  marginRight: "8px",
                }}
              />
            </Dropdown>
            <input
              type="text"
              value={searchInputs[col.dataIndex] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInputs((prev) => ({ ...prev, [col.dataIndex]: val }));
                setFilters((prev) => ({
                  ...prev,
                  [col.dataIndex]: {
                    ...prev[col.dataIndex],
                    value: val,
                    filterType: prev[col.dataIndex]?.filterType || "like",
                  },
                }));
                debouncedHandleInputChange(col.dataIndex, val);
              }}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                color: "#333",
                flex: 1,
              }}
              placeholder="Search"
              disabled={operatorsWithoutValue?.includes(
                filters[col.dataIndex]?.filterType
              )}
            />
          </div>
        )}
      </div>
    );
  };

  const mergedColumns = useMemo(() => {
    return columns.map((col, index) => {
      const isAuthorCol = col.dataIndex === authorDataIndex;

      return {
        ...col,
        onHeaderCell: () => ({
          index,
          moveColumn,
          style: {
            ...col.style,
            minWidth: 200,
          },
        }),
        width: col.type === "dropdown" ? 200 : col.width || 60,
        title: renderHeaderTitle(col),
        ...(isAuthorCol && {
          render: (val, record) => (
            <AuthorList
              authors={record?.entity_map?.authors || []}
              searchInput={debouncedFilters?.[authorDataIndex]?.value || ""}
            />
          ),
        }),
      };
    });
  }, [
    columns,
    filters,
    sortField,
    sortOrder,
    dynamicOptions,
    debouncedFilters,
  ]);

  useEffect(() => {
    columns.forEach((col) => {
      if (
        col.type === "dropdown" &&
        col.entity &&
        !dynamicOptions[col.dataIndex]
      ) {
        loadEntityOptions(
          col.rawTitle,
          col.dataIndex,
          col.entity,
          col?.labelKey ?? col.key,
          0,
          5000,
          col?.domainCategory
        );
      }
    });
  }, [columns]);

  useEffect(() => {
    setReportState({
      columns,
      filters,
      sort: {
        field: sortField,
        order: sortOrder,
      },
      pagination: {
        pageIndex,
        limit,
      },
      entitySelected: entitySelected,
    });
  }, [
    columns,
    filters,
    sortField,
    sortOrder,
    pageIndex,
    limit,
    entitySelected,
  ]);

  useEffect(() => {
    const fetchReport = async () => {
      const response = await dispatch(
        fetchEntityData({
          entity: EntityNames.CUSTOM_REPORT,
          page: 0,
          size: 1,
          body: {
            fields:
              "id,report_name,visibility,report_roles.role_id.id,report_roles.role_id.role_name,is_favourite,report_json",
            logicalOperator: "AND",
            filters: [
              {
                path: "id",
                operator: "equals",
                value: id?.toString(),
              },
            ],
          },
        })
      );
      const content = response?.payload?.data?.data?.content?.[0] || null;
      if (content) {
        setSavedReport(content);
        try {
          const parsedReport = JSON.parse(content?.report_json || "{}");

          const {
            columns = [],
            filters = {},
            sort = {},
            entitySelected = "",
            pagination = {},
          } = parsedReport;

          const safeFilters = Object.keys(filters).map((key) => ({
            path: key,
            ...filters[key],
          }));

          const { field: sortField = null, order: sortOrder = null } = sort;
          const { pageIndex = 0, limit = 10 } = pagination;

          setSortField(sortField);
          setSortOrder(sortOrder);
          setPageIndex(pageIndex);
          setEntitySelected(entitySelected);
          setLimit(limit);

          const updatedColumns = columns.map((col) => ({
            ...col,
            render: (_, record) => {
              const value = col?.dataIndex
                ?.split(".")
                .reduce(
                  (acc, part) => (acc && acc[part] ? acc[part] : undefined),
                  record
                );

              if (col.rawTitle === "Current Task") {
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
              } else if (col.rawTitle === "Author") {
                return (
                  <AuthorList
                    authors={record?.entity_map?.authors || []}
                    searchInput={
                      debouncedFilters?.[String(col.dataIndex).trim()]?.value ||
                      ""
                    }
                  />
                );
              } else if (col.rawTitle === "Assigned User") {
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
                ]?.includes(col.key)
              ) {
                return toCamelCase(value);
              } else if (["created_on", "updated_on"]?.includes(col.key)) {
                return formatDateWithTime(value);
              } else if (["Article Categories"]?.includes(col?.rawTitle)) {
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
                  "updated_by",
                  "created_by",
                  "supplier_contact_id",
                  "partner_contact_id",
                ]?.includes(col?.key)
              ) {
                const user = record?.[col?.key];
                const fullName = [user?.fname, user?.lname]
                  .filter(Boolean)
                  .join(" ");
                return fullName || null;
              } else if (["workflow_alias"]?.includes(col?.key)) {
                return record?.journal_workflow_id?.workflow_alias;
              } else if (
                [
                  "journal_workflows.article",
                  "journal_workflows.issue",
                ]?.includes(col?.key)
              ) {
                const defaultArticle = record.journal_workflows?.find(
                  (wf) =>
                    wf.is_default &&
                    wf.workflow_id?.entity_type ===
                      (col?.key === "journal_workflows.article"
                        ? WORKFLOW_ENTITY_TYPE.ARTICLE
                        : WORKFLOW_ENTITY_TYPE.ISSUE)
                );
                return defaultArticle?.workflow_alias || "";
              } else if (col?.type === "boolean") {
                const value = col?.dataIndex
                  ?.split(".")
                  .reduce(
                    (acc, part) =>
                      acc !== undefined && acc !== null ? acc[part] : undefined,
                    record
                  );

                return value === true ? "Yes" : value === false ? "No" : null;
              } else {
                return value || "";
              }
            },
          }));

          setColumns(updatedColumns);

          const initialFilters = {};
          safeFilters.forEach(({ path, value }) => {
            initialFilters[path] = {
              value: value ?? "",
              filterType: filters[path]?.filterType || "like",
            };

            setSearchInputs((prev) => ({
              ...prev,
              [path]: value ?? "",
            }));
          });

          setFilters((prev) => ({
            ...prev,
            ...initialFilters,
          }));
          const initialDebouncedFilters = {};
          safeFilters.forEach(({ path, value }) => {
            initialDebouncedFilters[path] = {
              value: value ?? "",
            };
          });

          setDebouncedFilters(initialDebouncedFilters);
          setReportState({
            columns: updatedColumns,
            filters: safeFilters,
            sort: {
              field: sortField,
              order: sortOrder,
            },
            pagination: {
              pageIndex,
              limit,
            },
            entitySelected: entitySelected,
          });
        } catch (error) {
          console.error("Error parsing report_json:", error);
        }
      }
    };

    if (id && !isStandardReport) {
      fetchReport();
    }
  }, [id, dispatch, refreshKey, isStandardReport]);

  // When updating any standard report, just comment this useEffect in the meantime... once updated uncomment it!

  useEffect(() => {
    if (isStandardReport) {
      const reportConfig = STANDARD_REPORTS[currentReport] || null;
      try {
        const parsedReport = JSON.parse(reportConfig?.report_json || "{}");
        const {
          columns = [],
          filters = {},
          sort = {},
          entitySelected = "",
          pagination = {},
        } = parsedReport;

        const safeFilters = Object.keys(filters).map((key) => ({
          path: key,
          ...filters[key],
        }));

        const { field: sortField = null, order: sortOrder = null } = sort;
        const { pageIndex = 0, limit = 10 } = pagination;

        setSortField(sortField);
        setSortOrder(sortOrder);
        setPageIndex(pageIndex);
        setEntitySelected(entitySelected);
        setLimit(limit);

        const updatedColumns = columns.map((col) => ({
          ...col,
          render: (_, record) => {
            const value = col?.dataIndex
              ?.split(".")
              .reduce(
                (acc, part) => (acc && acc[part] ? acc[part] : undefined),
                record
              );

            if (col.rawTitle === "Current Task") {
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
            } else if (col.rawTitle === "Author") {
              return (
                <AuthorList
                  authors={record?.entity_map?.authors || []}
                  searchInput={
                    debouncedFilters?.[String(col.dataIndex).trim()]?.value ||
                    ""
                  }
                />
              );
            } else if (col.rawTitle === "Assigned User") {
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
              ]?.includes(col.key)
            ) {
              return toCamelCase(value);
            } else if (["created_on", "updated_on"]?.includes(col.key)) {
              return formatDateWithTime(value);
            } else if (["Article Categories"]?.includes(col?.rawTitle)) {
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
                "updated_by",
                "created_by",
                "supplier_contact_id",
                "partner_contact_id",
              ]?.includes(col?.key)
            ) {
              const user = record?.[col?.key];
              const fullName = [user?.fname, user?.lname]
                .filter(Boolean)
                .join(" ");
              return fullName || null;
            } else if (["workflow_alias"]?.includes(col?.key)) {
              return record?.journal_workflow_id?.workflow_alias;
            } else if (
              [
                "journal_workflows.article",
                "journal_workflows.issue",
              ]?.includes(col?.key)
            ) {
              const defaultArticle = record.journal_workflows?.find(
                (wf) =>
                  wf.is_default &&
                  wf.workflow_id?.entity_type ===
                    (col?.key === "journal_workflows.article"
                      ? WORKFLOW_ENTITY_TYPE.ARTICLE
                      : WORKFLOW_ENTITY_TYPE.ISSUE)
              );
              return defaultArticle?.workflow_alias || "";
            } else if (col?.type === "boolean") {
              const value = col?.dataIndex
                ?.split(".")
                .reduce(
                  (acc, part) =>
                    acc !== undefined && acc !== null ? acc[part] : undefined,
                  record
                );

              return value === true ? "Yes" : value === false ? "No" : null;
            } else {
              return value || "";
            }
          },
        }));

        setColumns(updatedColumns);

        const initialFilters = {};
        safeFilters.forEach(({ path, value }) => {
          initialFilters[path] = {
            value: value ?? "",
            filterType: filters[path]?.filterType || "like",
          };

          setSearchInputs((prev) => ({
            ...prev,
            [path]: value ?? "",
          }));
        });

        setFilters((prev) => ({
          ...prev,
          ...initialFilters,
        }));

        const initialDebouncedFilters = {};
        safeFilters.forEach(({ path, value }) => {
          initialDebouncedFilters[path] = {
            value: value ?? "",
          };
        });

        setDebouncedFilters(initialDebouncedFilters);
        setReportState({
          columns: updatedColumns,
          filters: safeFilters,
          sort: {
            field: sortField,
            order: sortOrder,
          },
          pagination: {
            pageIndex,
            limit,
          },
          entitySelected: entitySelected,
        });
      } catch (error) {
        console.error("Error parsing report_json:", error);
      }
    }
  }, [isStandardReport, currentReport]);

  useEffect(() => {
    console.log(debouncedFilters, "debouncedFilters");
    const transformedFilters = Object.entries(debouncedFilters)
      .flatMap(([key, val]) => {
        const operator = filters[key]?.filterType || "like";
        const value = operatorsWithoutValue.includes(operator)
          ? null
          : val.value;

        if (
          [
            "entity_map.process_list.process_id.id",
            "entity_map.process_list.entity_process_assignment_id.user_id.id",
          ]?.includes(key)
        ) {
          const specialValue = operatorsWithoutValue.includes(operator)
            ? null
            : val.value;
          if (specialValue !== undefined && specialValue !== "") {
            return [
              {
                path: key,
                operator: operator,
                value: specialValue,
              },
              {
                path: "entity_map.process_list.entity_process_assignment_id.is_active",
                operator: "is-true",
                value: null,
              },
              // {
              //   path: "entity_map.process_list.entity_process_assignment_id.user_id.id",
              //   operator: "equals",
              //   value: "74",
              // },
            ];
          }
          return [];
        } else if (authorDataIndex === key) {
          const specialValue = operatorsWithoutValue.includes(operator)
            ? null
            : val.value;
          console.log(specialValue, "specialValue");
          if (
            specialValue &&
            specialValue !== undefined &&
            specialValue?.trim() !== ""
          ) {
            const words = specialValue.trim().split(/\s+/);
            return words.flatMap((word) => [
              {
                path: "entity_map.authors.contributor_id.first_name",
                operator: operator,
                value: word,
                logicalOperator: "OR",
              },
              {
                path: "entity_map.authors.contributor_id.last_name",
                operator: operator,
                value: word,
                logicalOperator: "OR",
              },
            ]);
          }
          return [
            {
              path: key,
              operator,
              value,
            },
          ];
        } else if (["journal_workflows.article.id"]?.includes(key)) {
          const specialValue = operatorsWithoutValue.includes(operator)
            ? null
            : val.value;
          if (specialValue !== undefined && specialValue !== "") {
            return [
              {
                path: "journal_workflows.id",
                operator: operator,
                value: specialValue,
              },
              {
                path: "journal_workflows.is_default",
                operator: "is-true",
                value: null,
              },
              {
                path: "journal_workflows.workflow_id.entity_type",
                operator: "equals",
                value: WORKFLOW_ENTITY_TYPE.ARTICLE,
              },
            ];
          }
          return [];
        } else if (["journal_workflows.issue.id"]?.includes(key)) {
          const specialValue = operatorsWithoutValue.includes(operator)
            ? null
            : val.value;
          if (specialValue !== undefined && specialValue !== "") {
            return [
              {
                path: "journal_workflows.id",
                operator: operator,
                value: specialValue,
              },
              {
                path: "journal_workflows.is_default",
                operator: "is-true",
                value: null,
              },
              {
                path: "journal_workflows.workflow_id.entity_type",
                operator: "equals",
                value: WORKFLOW_ENTITY_TYPE.ISSUE,
              },
            ];
          }
          return [];
        }
        return [
          {
            path: key,
            operator,
            value,
          },
        ];
      })
      .filter((filter) => {
        const operator = filter.operator;
        if (operatorsWithoutValue.includes(operator)) return true;
        return filter.value !== undefined && filter.value !== "";
      });

    console.log(transformedFilters, "transformedFilters");

    fetchReportData({
      entity:
        entitySelected === "Article"
          ? EntityNames.ARTICLE_DETAIL
          : entitySelected === "Journal"
          ? EntityNames.JOURNAL
          : EntityNames.ISSUE,
      page: pageIndex,
      size: limit,
      sort: sortField ? `${sortField},${sortOrder}` : "id,desc",
      body:
        transformedFilters?.length > 0
          ? {
              fields:
                entitySelected === "Article"
                  ? ARTICLE_FIELDS
                  : entitySelected === "Journal"
                  ? JOURNAL_FIELDS
                  : issueFields,
              logicalOperator: "AND",
              filters: transformedFilters,
            }
          : {
              fields:
                entitySelected === "Article"
                  ? ARTICLE_FIELDS
                  : entitySelected === "Journal"
                  ? JOURNAL_FIELDS
                  : issueFields,
            },
    });
  }, [
    sortField,
    sortOrder,
    pageIndex,
    limit,
    debouncedFilters,
    entitySelected,
  ]);

  const fetchAllRecordsInChunks = async (chunkSize = 10) => {
    let allRecords = [];
    let currentPage = 0;

    while (true) {
      const transformedFilters = Object.entries(debouncedFilters)
        .flatMap(([key, val]) => {
          const operator = filters[key]?.filterType || "like";
          const value = operatorsWithoutValue.includes(operator)
            ? null
            : val.value;

          if (
            [
              "entity_map.process_list.process_id.id",
              "entity_map.process_list.entity_process_assignment_id.user_id.id",
            ].includes(key)
          ) {
            const specialValue = operatorsWithoutValue.includes(operator)
              ? null
              : val.value;
            if (specialValue !== undefined && specialValue !== "") {
              return [
                {
                  path: key,
                  operator: operator,
                  value: specialValue,
                },
                {
                  path: "entity_map.process_list.entity_process_assignment_id.is_active",
                  operator: "is-true",
                  value: null,
                },
              ];
            }
            return [];
          } else if (authorDataIndex === key) {
            const specialValue = operatorsWithoutValue.includes(operator)
              ? null
              : val.value;
            if (
              specialValue &&
              specialValue !== undefined &&
              specialValue.trim() !== ""
            ) {
              const words = specialValue.trim().split(/\s+/);
              return words.flatMap((word) => [
                {
                  path: "entity_map.authors.contributor_id.first_name",
                  operator: operator,
                  value: word,
                  logicalOperator: "OR",
                },
                {
                  path: "entity_map.authors.contributor_id.last_name",
                  operator: operator,
                  value: word,
                  logicalOperator: "OR",
                },
              ]);
            }
            return [
              {
                path: key,
                operator,
                value,
              },
            ];
          }

          return [
            {
              path: key,
              operator,
              value,
            },
          ];
        })
        .filter((filter) => {
          const operator = filter.operator;
          if (operatorsWithoutValue.includes(operator)) return true;
          return filter.value !== undefined && filter.value !== "";
        });

      const response = await dispatch(
        fetchEntityData({
          entity:
            entitySelected === "Article"
              ? EntityNames.ARTICLE_DETAIL
              : entitySelected === "Journal"
              ? EntityNames.JOURNAL
              : EntityNames.ISSUE,
          page: currentPage,
          size: Math.ceil(totalRecords / chunkSize),
          sort: sortField ? `${sortField},${sortOrder}` : "id,desc",
          body: {
            fields:
              entitySelected === "Article"
                ? ARTICLE_FIELDS
                : entitySelected === "Journal"
                ? JOURNAL_FIELDS
                : issueFields,
            logicalOperator: "AND",
            filters: transformedFilters,
          },
        })
      );

      const records = response?.payload?.data?.data?.content || [];

      if (records.length === 0) {
        break; // No more records to fetch
      }

      allRecords = [...allRecords, ...records];
      currentPage += 1; // Move to the next page
    }

    return allRecords;
  };

  const getValueByPath = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

 const exportToExcel = async () => {
  try {
    setExporting(true);

    const allRecords = await fetchAllRecordsInChunks();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const reportTitle =
      savedReport?.report_name ||
      (isStandardReport ? currentReport : "Untitled Report");

    const headers = columns.map((col) => col.displayTitle || col.rawTitle);

    // Add report title and date
    const titleRow = worksheet.addRow([`Report: ${reportTitle}`]);
    titleRow.getCell(1).font = { bold: true, size: 16 };
    titleRow.getCell(1).alignment = { horizontal: "start" };
    worksheet.mergeCells(1, 1, 1, headers.length);

    const dateRow = worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    dateRow.getCell(1).font = { italic: true, size: 12 };
    dateRow.getCell(1).alignment = { horizontal: "start" };
    worksheet.mergeCells(2, 1, 2, headers.length);

    worksheet.addRow([]); // Spacer

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 13, color: { argb: "1F4E78" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9E1F2" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: false,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "999999" } },
        left: { style: "thin", color: { argb: "999999" } },
        bottom: { style: "thin", color: { argb: "999999" } },
        right: { style: "thin", color: { argb: "999999" } },
      };
    });

    // Add data rows
     // Add data rows
     // Add data rows
    allRecords.forEach((row, rowIndex) => {
      const rowData = columns.map((col) => {
        const value = col?.dataIndex
          ?.split(".")
          .reduce(
            (acc, part) => (acc && acc[part] ? acc[part] : undefined),
            row
          );

        if (col.rawTitle === "Current Task") {
          const currentTask = getCurrentTaskFromProcessList(
            row?.entity_map?.process_list
          );
          return (
            currentTask?.process_id?.process_name ??
            (row?.issue_status === ISSUE_STATUS.PUBLISHED ||
            row?.article_status === ARTICLE_STATUS.PUBLISHED
              ? "Published"
              : "")
          );
        } else if (col.rawTitle === "Author") {
          const authors = row?.entity_map?.authors || [];
          return authors.map(author => `${author?.contributor_id?.first_name || ''} ${author?.contributor_id?.last_name || ''}`.trim()).join(', ');
        } else if (col.rawTitle === "Assigned User") {
          const currentTask = getCurrentTaskFromProcessList(
            row?.entity_map?.process_list
          );
          const latestAssignment = currentTask?.entity_process_assignment_id?.at(-1);
          const user = latestAssignment?.user_id;
          const fullName = [user?.fname, user?.lname].filter(Boolean).join(" ");
          return fullName || "";
        } else if (
          [
            "article_status",
            "journal_status",
            "issue_type",
            "cover_month",
            "issue_status",
            "journal_article_info.oa_type",
          ].includes(col.key)
        ) {
          return toCamelCase(value) || "";
        } else if (["created_on", "updated_on"].includes(col.key)) {
          return formatDateWithTime(value) || "";
        } else if (["Article Categories"].includes(col?.rawTitle)) {
          const categories = Array.from(
            new Set(
              (row?.journal_article_info?.journal_article_type || [])
                .map(
                  (item) =>
                    item?.article_type_id?.article_category_id
                      ?.category_name
                )
                .filter(Boolean)
            )
          );
          return categories.length ? categories.join(", ") : "";
        } else if (
          [
            "updated_by",
            "created_by",
            "supplier_contact_id",
            "partner_contact_id",
          ].includes(col?.key)
        ) {
          const user = row?.[col?.key];
          const fullName = [user?.fname, user?.lname].filter(Boolean).join(" ");
          return fullName || "";
        } else if (["workflow_alias"].includes(col?.key)) {
          return row?.journal_workflow_id?.workflow_alias || "";
        } else if (
          [
            "journal_workflows.article",
            "journal_workflows.issue",
          ].includes(col?.key)
        ) {
          const defaultArticle = row.journal_workflows?.find(
            (wf) =>
              wf.is_default &&
              wf.workflow_id?.entity_type ===
                (col?.key === "journal_workflows.article"
                  ? WORKFLOW_ENTITY_TYPE.ARTICLE
                  : WORKFLOW_ENTITY_TYPE.ISSUE)
          );
          return defaultArticle?.workflow_alias || "";
        } else if (col?.type === "boolean") {
          const booleanValue = col?.dataIndex
            ?.split(".")
            .reduce(
              (acc, part) =>
                acc !== undefined && acc !== null ? acc[part] : undefined,
              row
            );
          return booleanValue === true ? "Yes" : booleanValue === false ? "No" : "";
        } else {
          return value || "";
        }
      });

      const dataRow = worksheet.addRow(rowData);
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { size: 12 };
        // Apply alternating row color
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F2F2F2" }, // Alternate row color
          };
        }
        // Apply white background only if the cell is empty
        // if (!cell.value || cell.value === "") {
        //   cell.fill = {
        //     type: "pattern",
        //     pattern: "solid",
        //     fgColor: { argb: "FFFFFF" }, // White color for empty cells
        //   };
        // }
      });
    });

    // Auto width for columns
    worksheet.columns = columns.map((col, colIndex) => {
      const headerText = headers[colIndex].toString();
      const maxLength = Math.max(
        headerText.length,
        ...allRecords.map((row) => {
          const val = col?.dataIndex
            ?.split(".")
            .reduce(
              (acc, part) => (acc && acc[part] ? acc[part] : undefined),
              row
            );
          return val ? val.toString().length : 0;
        })
      );
      return { width: maxLength + 6 };
    });


    // Auto width for columns
    worksheet.columns = columns.map((col, colIndex) => {
      const headerText = headers[colIndex].toString();
      const maxLength = Math.max(
        headerText.length,
        ...allRecords.map((row) => {
          const val = col?.dataIndex
            ?.split(".")
            .reduce(
              (acc, part) => (acc && acc[part] ? acc[part] : undefined),
              row
            );
          return val ? val.toString().length : 0;
        })
      );
      return { width: maxLength + 6 };
    });

    // Auto width for columns
    worksheet.columns = columns.map((col, colIndex) => {
      const headerText = headers[colIndex].toString();
      const maxLength = Math.max(
        headerText.length,
        ...allRecords.map((row) => {
          const val = getValueByPath(row, col.dataIndex);
          return val ? val.toString().length : 0;
        })
      );
      return { width: maxLength + 6 };
    });

    // Freeze header and apply filter
    worksheet.views = [{ state: "frozen", ySplit: 4 }];
    worksheet.autoFilter = {
      from: { row: headerRow.number, column: 1 },
      to: { row: headerRow.number, column: headers.length },
    };

    // Save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${reportTitle}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  } catch (err) {
    console.error("Excel export failed:", err);
  } finally {
    setExporting(false);
  }
};

  const handleFavReport = (isFav) => {
    const cleanColumns = reportState?.columns.map((col) => {
      const { title, ...rest } = col;
      return rest;
    });

    const cleanReportState = {
      ...reportState,
      columns: cleanColumns,
    };

    const jsonPayload = JSON.stringify(cleanReportState);

    const body = {
      id: savedReport?.id ?? null,
      report_name: savedReport?.report_name || "Untitled Report",
      visibility: savedReport?.visibility || VISIBILITY_OPTS_VALS.PUBLIC,
      is_favourite: isFav ?? false,
      report_roles: null,
      report_json: jsonPayload,
    };
    mutate(
      {
        url: ENDPOINTS.createOrUpdateCustomReport,
        data: body,
      },
      {
        onSuccess: (res) => {
          message.success(
            body.is_favourite
              ? "Report added to your favourites."
              : "Report removed from your favourites."
          );
          setRefreshKey((prev) => prev + 1);
        },
        onError: (err) => {
          message.error(err?.message);
        },
      }
    );
  };

  const handleReset = () => {
    setColumns([]);
    setDebouncedFilters([]);
    setPageIndex(0);
    setLimit(10);
    setSortField(null);
    setSortOrder(null);
  };

  return (
    <div>
      {!isStandardReport && <CustomBreadcrumb items={breadcrumbItems} />}
      <Card className="h-auto">
        <DndProvider backend={HTML5Backend}>
          <div className="flex justify-between items-center mb-4">
            {" "}
            <PageTitle
              title={
                savedReport
                  ? savedReport?.report_name
                  : isStandardReport
                  ? currentReport
                  : "Untitled Report"
              }
            />
            <div className="flex justify-between gap-7">
              {columns?.length > 0 && (
                <div className="flex items-center gap-4 mb-3">
                  {savedReport && !isStandardReport && (
                    <>
                      {savedReport?.is_favourite ? (
                        <HeartFilled
                          className="text-2xl text-red-600 cursor-pointer"
                          title="Favourite"
                          onClick={() => handleFavReport(false)}
                        />
                      ) : (
                        <HeartOutlined
                          className="text-2xl text-gray-600 cursor-pointer"
                          title="Favourite"
                          onClick={() => handleFavReport(true)}
                        />
                      )}
                    </>
                  )}

                  {exporting ? (
                    <LoadingOutlined
                      className="text-2xl text-blue-600"
                      title="Exporting..."
                    />
                  ) : (
                    <UploadOutlined
                      className="text-2xl text-gray-600 cursor-pointer"
                      title="Export"
                      onClick={exportToExcel}
                    />
                  )}
                  {!isStandardReport && (
                    <SaveOutlined
                      className="text-2xl text-gray-600 cursor-pointer"
                      onClick={() => setIsSaved(true)}
                      title="Save"
                    />
                  )}
                </div>
              )}
              <Button
                color="default"
                variant="solid"
                shape="round"
                className="btn-primary"
                style={{ marginBottom: 16 }}
                icon={<PlusOutlined />}
                onClick={() => setIsConfigOpen((prev) => !prev)}
              >
                {columns?.length > 0 ? "Add/Remove Columns" : "Add Field"}
              </Button>
            </div>
          </div>
          <ColumnConfigurator
            isStandardReport={isStandardReport}
            currentReport={currentReport}
            visible={isConfigOpen}
            columns={columns}
            setColumns={setColumns}
            onClose={() => setIsConfigOpen(false)}
            getSortIcon={getSortIcon}
            handleSort={handleSort}
            debouncedFilters={debouncedFilters}
            entitySelected={entitySelected}
            setEntitySelected={setEntitySelected}
            onReset={handleReset}
          />
          {columns?.length > 0 ? (
            <>
              {" "}
              {loading ? (
                <div className="loading-container">
                  <Loader size="large" />
                </div>
              ) : (
                <>
                  <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                    <Table
                      columns={mergedColumns.map((col) => ({
                        ...col,
                        sorter: false,
                        sortOrder:
                          sortField === col.key
                            ? sortOrder?.toLowerCase()
                            : null,
                        columnKey: col.key,
                      }))}
                      dataSource={data}
                      pagination={false}
                      bordered
                      rowKey="id"
                      scroll={{ x: columns?.length * 200 }}
                      rowClassName="h-[40px]"
                      components={{
                        header: {
                          cell: DraggableHeaderCell,
                        },
                      }}
                      className="custom-table"
                      locale={{ emptyText: <CustomEmptyState /> }}
                    />
                  </div>
                  <div
                    className="pagination-wrapper"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                    }}
                  >
                    <span className="text-[#939395]">
                      Showing{" "}
                      {Math.min((currentPage - 1) * limit + 1, totalRecords)}-
                      {Math.min(currentPage * limit, totalRecords)} of{" "}
                      {totalRecords} records
                    </span>
                    <Pagination
                      current={pageIndex + 1}
                      pageSize={limit}
                      total={totalRecords}
                      showSizeChanger
                      onChange={handlePaginationChange}
                      onShowSizeChange={(current, size) => {
                        handlePaginationChange(1, size);
                      }}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col justify-center items-center h-[400px] text-gray-500 text-center space-y-2">
                <p>
                  1. <b>'Add Fields'</b> to create your report.
                </p>
                <p>
                  2. Apply <b>filters</b> to refine report.
                </p>
              </div>
            </>
          )}
        </DndProvider>
      </Card>

      <style>
        {`.custom-select-bg .ant-select-selector {
            background-color: #f5f5f5 !important;
            border: 1px solid #d9d9d9 !important;
            height: 32px;
            display: flex;
            align-items: center;
            background: "transparent",
            fontSize: "14px",
            color: "#333 !important",
            width: 400px !important
            }
        `}
      </style>

      {isSaved && (
        <SaveModal
          savedReport={savedReport}
          open={isSaved}
          onClose={() => setIsSaved(false)}
          reportState={reportState}
          isFav={false}
          onSuccess={() => navigate("/report/custom-reports")}
        />
      )}
    </div>
  );
};

export default CustomReport;

const CustomEmptyState = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="flex justify-center items-center">
        <svg
          width="64"
          height="41"
          viewBox="0 0 64 41"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>No data</title>
          <g transform="translate(0 1)" fill="none" fillRule="evenodd">
            <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
            <g fillRule="nonzero" stroke="#d9d9d9">
              <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
              <path
                d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                fill="#fafafa"
              ></path>
            </g>
          </g>
        </svg>
      </div>
      <p
        style={{
          marginTop: "5px",
          fontSize: "14px",
          color: "rgba(0,0,0,0.45)",
        }}
      >
        No records found!
      </p>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import CustomBreadcrumb from "../components/shared/CustomBreadcrumb";
import { useNavigate } from "react-router-dom";
import { Button, Card, Dropdown, message } from "antd";
import PageTitle from "../components/shared/PageTitle";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import CustomTable from "../components/shared/CustomTable";
import { useRole } from "../../context/RoleContext";
import { useDispatch } from "react-redux";
import {
  fetchEntityData,
  setEntityDataPageIndex,
  setEntityDataPageSize,
} from "../../store/slices/fetchEntitySlice";
import { formatDate } from "../../utils/formatDateTime";
import { VISIBILITY_OPTS_VALS } from "../../enums/JournalEnums";
import {
  EllipsisOutlined,
  HeartFilled,
  HeartOutlined,
} from "@ant-design/icons";
import { ENDPOINTS } from "../../services/endpoints";
import { usePostData } from "../../hooks/useData";
import { EntityNames } from "../../services/entities";
import { CombinedSortIcon } from "../../utils/TableSort";
import { handleDeleteAction } from "../components/shared/deleteAndDeactivate";

const FavoriteReports = () => {
  const navigate = useNavigate();
  const { data, totalItems, loading } = useSelector(
    (state) => state.entityData
  );
  const { activeRole } = useRole();
  const dispatch = useDispatch();
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOrder, setSortOrder] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [limit, setLimit] = useState(10);
  const { mutate } = usePostData();
  const breadcrumbItems = [
    {
      label: "Reports",
      onClick: () => navigate("/reports"),
    },
    { label: "Favorite Reports" },
  ];

  const handlePagination = (page, size) => {
    setPageIndex(page - 1);
    setLimit(size);
    dispatch(setEntityDataPageIndex(page - 1));
    dispatch(setEntityDataPageSize(size));
  };

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

  const getSortIcon = (field) => (
    <CombinedSortIcon sortOrder={sortField === field ? sortOrder : null} />
  );

  const handleDelete = (record) => {
    handleDeleteAction(dispatch, record, EntityNames.CUSTOM_REPORT, "report")
      .then(() => {
        setRefreshKey((prevKey) => prevKey + 1);
      })
      .catch((err) => {
        console.error("Error during deletion:", err);
      });
  };

  const columns = [
    {
      title: (
        <span
          className="flex gap-5"
          onClick={() => handleSort("report_name")}
          style={{ cursor: "pointer" }}
        >
          Report Name {getSortIcon("report_name")}
        </span>
      ),
      dataIndex: "report_name",
      key: "report_name",
    },
    {
      title: (
        <span
          className="flex gap-5"
          onClick={() => handleSort("created_on")}
          style={{ cursor: "pointer" }}
        >
          Created On {getSortIcon("created_on")}
        </span>
      ),
      dataIndex: "created_on",
      key: "created_on",
      render: (value) => (value ? formatDate(value) : ""),
    },
    {
      title: (
        <span
          className="flex gap-5"
          onClick={() => handleSort("updated_on")}
          style={{ cursor: "pointer" }}
        >
          Modified On {getSortIcon("updated_on")}
        </span>
      ),
      dataIndex: "updated_on",
      key: "updated_on",
      render: (value) => (value ? formatDate(value) : ""),
    },
    {
      title: "Modified By",
      key: "updated_by",
      render: (_, record) => {
        const modifiedBy = record?.updated_by;
        if (modifiedBy?.id) {
          const firstName = modifiedBy?.fname || "";
          const lastName = modifiedBy?.lname || "";
          return `${firstName} ${lastName}`.trim();
        }
        return "";
      },
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      render: (value) => {
        if (value === VISIBILITY_OPTS_VALS.PUBLIC) {
          return (
            <img src="/global-icon.svg" alt="public" className="h-6 w-6" />
          );
        } else if (value === VISIBILITY_OPTS_VALS.PRIVATE) {
          return <img src="/Lock_Icon.svg" alt="private" className="h-6 w-6" />;
        } else {
          return <img src="/group-icon.svg" alt="group" className="h-6 w-6" />;
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const handleMenuClick = ({ key }) => {
          switch (key) {
            case "view":
              navigate("/report/view-report/" + record?.id);
              break;
            case "favourite":
              handleFavReport(record);
              break;
            case "excel":
              console.log("Export Excel for", record?.id);
              break;
            case "pdf":
              console.log("Export PDF for", record?.id);
              break;
            default:
              break;
          }
        };

        const menuItems = [
          {
            key: "view",
            label: <Button type="text">Modify</Button>,
          },
          {
            key: "favourite",
            label: (
              <Button
                type="text"
                icon={
                  record?.is_favourite ? (
                    <HeartFilled className="w-5 h-6 text-red-600" />
                  ) : (
                    <HeartOutlined className="w-5 h-6" />
                  )
                }
              >
                {record?.is_favourite
                  ? "Remove Favourite"
                  : "Mark as Favourite"}
              </Button>
            ),
          },
          {
            key: "excel",
            label: (
              <Button type="text">
                <img src="/FileXls.svg" alt="xls" className="h-6 w-6" />
                Export as Excel
              </Button>
            ),
          },
          {
            key: "pdf",
            label: (
              <Button type="text">
                <img src="/FilePdf.svg" alt="pdf" className="h-6 w-6" />
                Export as PDF
              </Button>
            ),
          },
          {
            key: "delete",
            label: <Button type="text text-red-700">Delete</Button>,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
          >
            <Button icon={<EllipsisOutlined />} type="text" />
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    dispatch(
      fetchEntityData({
        entity: EntityNames.CUSTOM_REPORT,
        page: pageIndex,
        size: limit,
        sort: sortField ? `${sortField},${sortOrder}` : undefined,
        body: {
          fields:
            "id,report_name,visibility,report_roles.role_id.id,report_roles.role_id.role_name,is_favourite,report_json,created_on,updated_on,updated_by.id,updated_by.fname,updated_by.lname",
          filters: [
            {
              path: "is_favourite",
              operator: "is-true",
              value: null,
            },
          ],
        },
      })
    );
  }, [
    dispatch,
    pageIndex,
    limit,
    activeRole,
    refreshKey,
    sortField,
    sortOrder,
  ]);

  const handleFavReport = (record) => {
    const body = {
      id: record?.id,
      report_name: record?.report_name,
      visibility: record?.visibility,
      is_favourite: false,
      report_roles: record?.report_roles,
      report_json: record?.report_json,
    };
    mutate(
      {
        url: ENDPOINTS.createOrUpdateCustomReport,
        data: body,
      },
      {
        onSuccess: (res) => {
          message.success("Report Removed as Favorite");
          setRefreshKey((prev) => prev + 1);
        },
        onError: (err) => {
          message.error(err?.message);
        },
      }
    );
  };

  return (
    <>
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card className="h-auto">
        <div className="flex justify-between mb-4">
          <PageTitle title="Favorite Reports" />
        </div>
        {loading ? (
          <div className="loading-container">
            <Loader size="large" />
          </div>
        ) : (
          <CustomTable
            columns={columns}
            data={data}
            totalRecords={totalItems}
            pageSize={limit}
            currentPage={pageIndex + 1}
            onPageChange={handlePagination}
          />
        )}
      </Card>
    </>
  );
};

export default FavoriteReports;

import React, { useEffect, useMemo, useState } from "react";
import CustomBreadcrumb from "../components/shared/CustomBreadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row } from "antd";
import PageTitle from "../components/shared/PageTitle";
import {
  ArrowRightOutlined,
  HeartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { fetchEntityData } from "../../store/slices/fetchEntitySlice";
import { EntityNames } from "../../services/entities";
import Loader from "../components/Loader";
import { VISIBILITY_OPTS_VALS } from "../../enums/JournalEnums";
import { STANDARD_REPORTS_NAMES } from "./ReportEnum";

const Report = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [customReportCounts, setCustomReportCounts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customReport, setCustomReport] = useState([]);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    { label: "Reports" },
  ];

  const rows = useMemo(
    () => [
      {
        title: "Dashboard Reports",
        description: [
          {
            title: STANDARD_REPORTS_NAMES.PUBLISHED_ARTICLE,
            link: "/report/standard-report/1",
          },
          // { title: "Article Vendor Report" },
          {
            title: "Journal Metadata Report",
            link: "/report/standard-report/2",
          },
          // { title: "Issue Metadata Report" },
          // { title: "Article Ingestion Report" },
        ],
        count: 2,
        path: "/report/dashboard-reports",
      },
      {
        title: "Custom Reports",
        description: customReport,
        count: customReportCounts,
        path: "/report/custom-reports",
      },
    ],
    [customReport, customReportCounts]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dispatch(
          fetchEntityData({
            entity: EntityNames.CUSTOM_REPORT,
            page: 0,
            size: 5,
            body: {
              fields: "id,report_name",
              logicalOperator: "AND",
              filters: [
                {
                  path: "visibility",
                  operator: "equals",
                  value: VISIBILITY_OPTS_VALS.PUBLIC,
                },
                {
                  path: "created_by.id",
                  operator: "equals",
                  value: localStorage.getItem("userId")?.toString(),
                  logicalOperator: "OR",
                },
                {
                  path: "report_roles.role_id.id",
                  operator: "equals",
                  value: JSON.parse(
                    localStorage.getItem("active_role")
                  )?.id?.toString(),
                  logicalOperator: "OR",
                },
              ],
            },
          })
        );
        const content = response?.payload?.data?.data?.content || [];
        const totalRecords = response?.payload?.data?.data?.totalElements || 0;
        setCustomReport(
          content?.map((item) => ({
            title: item?.report_name,
            id: item?.id,
          }))
        );
        setCustomReportCounts(totalRecords);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card className="h-auto">
        <div className="flex justify-between mb-4">
          <PageTitle title="Reports" />
          <div>
            <HeartOutlined
              className="text-2xl text-gray-600 cursor-pointer me-8"
              title="Favorite"
              onClick={() => navigate("/report/favorites")}
            />
            <Button
              color="default"
              variant="solid"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => navigate("/report/create-report")}
            >
              Create Custom Report
            </Button>
          </div>
        </div>

        <Row gutter={[16, 24]} className="mt-4">
          {rows.map((item, index) => (
            <Col span={8} key={index}>
              <Card
                hoverable
                bordered
                className="border border-gray-300 min-h-[222px]"
                // onClick={() => navigate(item.path)}
              >
                <h3 className="text-md font-semibold mb-3">
                  {item.title}
                  {item.count !== undefined && (
                    <span className="ml-2 px-2 py-1 text-[12px] rounded-full bg-slate-100 text-slate-500">
                      {item.count}
                    </span>
                  )}
                </h3>
                {loading ? (
                  <>
                    <Loader size="small" />
                  </>
                ) : (
                  <ul className="list-disc pl-5 text-gray-500 text-sm space-y-1">
                    {item.description.map((desc, i) => (
                      <li key={i}>
                        {desc.id ? (
                          <Link
                            to={`/report/view-report/${desc.id}`}
                            className="text-gray-500 hover:underline"
                          >
                            {desc.title}
                          </Link>
                        ) : (
                          <Link
                            to={`${desc?.link}`}
                            className="text-gray-500 hover:underline"
                          >
                            {desc.title}
                          </Link>
                        )}
                      </li>
                    ))}
                    {item.title === "Custom Reports" ? (
                      <div className="float-right">
                        <Link
                          to="/report/custom-reports"
                          className="text-blue-500 hover:underline"
                        >
                          View all{" "}
                          <ArrowRightOutlined className="text-gray-500" />
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="text-blue-500 hover:underline my-6"></div>
                      </div>
                    )}
                  </ul>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
};

export default Report;

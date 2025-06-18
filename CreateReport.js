import React from "react";
import CustomBreadcrumb from "../components/shared/CustomBreadcrumb";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "antd";
import PageTitle from "../components/shared/PageTitle";
import { PlusOutlined } from "@ant-design/icons";

const CreateReport = () => {
  const navigate = useNavigate();
  const breadcrumbItems = [
    {
      label: "Reports",
      onClick: () => navigate("/reports"),
    },
    { label: "Custom Reports" },
    { label: "Create New Report" },
  ];

  return (
    <>
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card className="h-[calc(100vh-150px)]">
        <div className="flex justify-between mb-4">
          <PageTitle title="Untitled Report" />
          <Button
            color="default"
            variant="solid"
            shape="round"
            icon={<PlusOutlined />}
            // onClick={handleCreateJournal}
          >
            Add Field
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center h-[400px] text-gray-500 text-center space-y-2">
          <p>
            1. <b>'Add Fields'</b> to create your report.
          </p>
          <p>
            2. Apply <b>filters</b> to refine report.
          </p>
        </div>
      </Card>
    </>
  );
};

export default CreateReport;

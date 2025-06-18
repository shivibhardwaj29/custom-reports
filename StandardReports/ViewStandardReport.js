import { useNavigate, useParams } from "react-router-dom";
import { getStandardReport } from "../ReportEnum";
import CustomBreadcrumb from "../../components/shared/CustomBreadcrumb";
import CustomReport from "../CustomReports/CustomReport";

const ViewStandardReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentReport = getStandardReport(id);
  const breadcrumbItems = [
    {
      label: "Reports",
      onClick: () => navigate("/reports"),
    },
    { label: currentReport },
  ];

  return (
    <div>
      <CustomBreadcrumb items={breadcrumbItems} />
      <CustomReport isStandardReport={true} currentReport={currentReport} />
    </div>
  );
};

export default ViewStandardReport;

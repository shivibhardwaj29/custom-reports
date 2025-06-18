import { EntityNames } from "../../../services/entities";
import { ISSUE_TYPE_OPTS, months } from "../../Issues/IssueEnums";
import { ISSUE_STATUS_VALS } from "./ArticleConfig";

export const ISSUE_CONFIG = [
  { title: "Issue ID", key: "id", dataIndex: "id" },
  { title: "Issue Title", key: "title", dataIndex: "title" },
  { title: "Issue Number", key: "issue_number", dataIndex: "issue_number" },
  {
    title: "Issue Type",
    key: "issue_type",
    dataIndex: "issue_type",
    type: "dropdown",
    options: ISSUE_TYPE_OPTS,
  },
  {
    title: "Issue Status",
    key: "issue_status",
    dataIndex: "issue_status",
    type: "dropdown",
    options: ISSUE_STATUS_VALS,
  },
  {
    title: "Cover Month",
    key: "cover_month",
    dataIndex: "cover_month",
    type: "dropdown",
    options: months,
  },
  {
    title: "Cover Date",
    key: "cover_date",
    dataIndex: "cover_date",
    type: "date",
  },
  {
    title: "Issue Close Date",
    key: "issue_close_date",
    dataIndex: "issue_close_date",
    type: "date",
  },
  {
    title: "Publication Date",
    key: "publication_date",
    dataIndex: "publication_date",
    type: "date",
  },
  {
    title: "Created On",
    key: "created_on",
    dataIndex: "created_on",
    type: "dateTime",
  },
  {
    title: "Modified On",
    key: "updated_on",
    dataIndex: "updated_on",
    type: "dateTime",
  },
  {
    title: "Created By",
    key: "created_by",
    dataIndex: "created_by.id",
    type: "dropdown",
    entity: EntityNames.USER,
    labelKey: "fname",
  },
  {
    title: "Modified By",
    key: "updated_by",
    dataIndex: "updated_by.id",
    type: "dropdown",
    entity: EntityNames.USER,
    labelKey: "fname",
  },
];

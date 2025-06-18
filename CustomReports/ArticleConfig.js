import DOMAIN_CATEGORIES from "../../../enums/DomainCategoryEnums";
import {
  IMPORTANCE_OPTS,
  JOURNAL_FORMAT,
  JOURNAL_STATUS_OPTS,
} from "../../../enums/JournalEnums";
import { EntityNames } from "../../../services/entities";
import { ISSUE_TYPE_OPTS, months } from "../../Issues/IssueEnums";

export const ARTICLE_STATUS_VALS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "PUBLISHED", label: "Published" },
];

export const ISSUE_STATUS_VALS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

export const ARTICLE_CONFIG = [
  { title: "Article ID", key: "id", dataIndex: "id" },
  { title: "Article Title", key: "title", dataIndex: "title" },
  { title: "Sub Title", key: "sub_title", dataIndex: "sub_title" },
  {
    title: "Article Status",
    key: "article_status",
    dataIndex: "article_status",
    type: "dropdown",
    options: ARTICLE_STATUS_VALS,
  },
  {
    title: "Peer Review ID",
    key: "peer_review_id",
    dataIndex: "peer_review_id",
  },
  {
    title: "Article Type",
    key: "article_type_id",
    children: [
      {
        title: "Article Type",
        key: "article_type",
        dataIndex: "article_type_id.article_type",
        type: "dropdown",
        entity: EntityNames.ARTICLE_TYPE,
      },
      {
        title: "Article Category",
        key: "article_category_id",
        children: [
          {
            title: "Category Name",
            key: "category_name",
            dataIndex: "article_type_id.article_category_id.category_name",
            type: "dropdown",
            entity: EntityNames.ARTICLE_CATEGORY,
          },
        ],
      },
    ],
  },
  {
    title: "Journal",
    key: "journal_id",
    children: [
      {
        title: "Journal ID",
        key: "journal_id.id",
        dataIndex: "journal_id.id",
      },
      {
        title: "Journal Title",
        key: "journal_id.title",
        dataIndex: "journal_id.title",
        type: "dropdown",
        entity: EntityNames.JOURNAL,
        labelKey: "title",
      },
      {
        title: "Journal Acronym",
        key: "acronym",
        dataIndex: "journal_id.acronym",
        type: "dropdown",
        entity: EntityNames.JOURNAL,
      },
      {
        title: "Journal Status",
        key: "journal_status",
        dataIndex: "journal_id.journal_status",
        type: "dropdown",
        options: JOURNAL_STATUS_OPTS,
      },
      {
        title: "Journal Short Title",
        key: "short_title",
        dataIndex: "journal_id.short_title",
        type: "dropdown",
        entity: EntityNames.JOURNAL,
      },
      {
        title: "Journal Importance",
        key: "importance",
        dataIndex: "journal_id.importance",
        type: "dropdown",
        options: IMPORTANCE_OPTS,
      },
      {
        title: "Journal Language",
        key: "lang_id",
        children: [
          {
            title: "Language",
            key: "lang_name",
            dataIndex: "journal_id.lang_id.lang_name",
            type: "dropdown",
            entity: EntityNames.LANGUAGE,
          },
        ],
      },
      {
        title: "Journal Email",
        key: "journal_id.email",
        dataIndex: "journal_id.email",
      },
      {
        title: "Journal Signature",
        key: "journal_id.signature",
        dataIndex: "journal_id.signature",
      },
      {
        title: "House Style",
        key: "house_style_id",
        children: [
          {
            title: "House Style",
            key: "house_style_name",
            dataIndex: "journal_id.house_style_id.house_style_name",
            type: "dropdown",
            entity: EntityNames.HOUSE_STYLE,
          },
        ],
      },
      {
        title: "Journal CODEN",
        key: "journal_id.coden",
        dataIndex: "journal_id.coden",
      },
      {
        title: "Journal Format",
        key: "journal_id.journal_format",
        dataIndex: "journal_id.journal_format",
        type: "dropdown",
        options: JOURNAL_FORMAT,
      },
      {
        title: "Partner",
        key: "partner_id",
        children: [
          {
            title: "Partner",
            key: "partner_name",
            dataIndex: "journal_id.partner_id.partner_name",
            type: "dropdown",
            entity: EntityNames.PARTNER,
          },
        ],
      },
      {
        title: "Online Code",
        key: "journal_id.online_code",
        dataIndex: "journal_id.online_code",
      },
      {
        title: "Online ISSN",
        key: "online_issn",
        dataIndex: "journal_id.online_issn",
      },
      {
        title: "Print ISSN",
        key: "journal_id.print_issn",
        dataIndex: "journal_id.print_issn",
      },
      {
        title: "Primary ISSN",
        key: "journal_id.primary_issn",
        dataIndex: "journal_id.primary_issn",
      },
    ],
  },
  {
    title: "Process",
    key: "entity_map.process_list.process_id",
    children: [
      {
        title: "Current Task",
        key: "process_name",
        dataIndex: "entity_map.process_list.process_id.id",
        type: "dropdown",
        entity: EntityNames.PROCESS,
      },
      {
        title: "Assigned User",
        key: "fname",
        dataIndex:
          "entity_map.process_list.entity_process_assignment_id.user_id.id",
        type: "dropdown",
        entity: EntityNames.USER,
      },
    ],
  },
  {
    title: "Author",
    key: "entity_map.authors",
    children: [
      {
        title: "Author",
        key: "entity_map.authors.contributor_id",
        dataIndex: "entity_map.authors.contributor_id.first_name",
      },
    ],
  },
  {
    title: "Issue",
    key: "issue_makeup_link.makeup_id.issue_id",
    children: [
      {
        title: "Issue ID",
        key: "issue_id.id",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.id",
      },
      {
        title: "Issue Title",
        key: "issue_id.title",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.title",
      },
      {
        title: "Issue Number",
        key: "issue_number",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.issue_number",
        type: "dropdown",
        entity: EntityNames.ISSUE,
      },
      {
        title: "Issue Type",
        key: "issue_type",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.issue_type",
        type: "dropdown",
        options: ISSUE_TYPE_OPTS,
      },
      {
        title: "Cover Month",
        key: "cover_month",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.cover_month",
        type: "dropdown",
        options: months,
      },
      {
        title: "Cover Date",
        key: "cover_date",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.cover_date",
        type: "date",
      },
      {
        title: "Issue Close Date",
        key: "issue_close_date",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.issue_close_date",
        type: "date",
      },
      {
        title: "Issue Publication Date",
        key: "publication_date",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.publication_date",
        type: "date",
      },
      {
        title: "Issue Status",
        key: "issue_status",
        dataIndex: "issue_makeup_link.makeup_id.issue_id.issue_status",
        type: "dropdown",
        options: ISSUE_STATUS_VALS,
      },
      {
        title: "Volume",
        key: "volume_issue_id",
        children: [
          {
            title: "Volume Number",
            key: "volume_number",
            dataIndex:
              "issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_number",
            type: "dropdown",
            entity: EntityNames.VOLUME_ISSUE,
          },
          {
            title: "Volume Year",
            key: "volume_year",
            dataIndex:
              "issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_year",
            type: "dropdown",
            entity: EntityNames.VOLUME_ISSUE,
          },
        ],
      },
    ],
  },
  {
    title: "Article Workflow",
    key: "journal_workflow_id",
    children: [
      {
        title: "Workflow Alias",
        key: "workflow_alias",
        dataIndex: "journal_workflow_id.workflow_id.id",
        type: "dropdown",
        entity: EntityNames.JOURNAL_WORKFLOW,
        labelKey: "workflow_alias",
      },
      {
        title: "Workflow",
        key: "workflow_id",
        children: [
          {
            title: "Workflow Name",
            key: "workflow_name",
            dataIndex: "journal_workflow_id.workflow_id.workflow_name",
            type: "dropdown",
            entity: EntityNames.WORKFLOW,
          },
        ],
      },
    ],
  },
  {
    title: "Open Access",
    key: "article_access_info.oa",
    dataIndex: "article_access_info.oa",
    type: "boolean",
  },
  {
    title: "DOI",
    key: "article_publication_info.doi",
    dataIndex: "article_publication_info.doi",
  },
  {
    title: "Publication Date",
    key: "article_key_dates.pub_on",
    dataIndex: "article_key_dates.pub_on",
    type: "date",
  },
  {
    title: "Article Comments",
    key: "comments",
    dataIndex: "comments",
  },
  {
    title: "Process Track",
    key: "article_prod_info.process_track.domain_value",
    dataIndex: "article_prod_info.process_track.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.PROCESS_TRACK,
  },
  {
    title: "Article Publication Mode",
    key: "article_prod_info.pub_mode.domain_value",
    dataIndex: "article_prod_info.pub_mode.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.PUB_MODE,
  },
  {
    title: "Article Production Mode",
    key: "article_prod_info.prod_mode.domain_value",
    dataIndex: "article_prod_info.prod_mode.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.PROD_MODE,
  },
  {
    title: "Special Issue Title",
    key: "article_prod_info.special_issue_title",
    dataIndex: "article_prod_info.special_issue_title",
  },
  {
    title: "Special Issue ID",
    key: "article_prod_info.special_issue_id",
    dataIndex: "article_prod_info.special_issue_id",
  },
  {
    title: "Special Subject",
    key: "article_prod_info.issue_subject",
    dataIndex: "article_prod_info.issue_subject",
  },
  {
    title: "Free Access",
    key: "article_access_info.fa",
    dataIndex: "article_access_info.fa",
    type: "boolean",
  },
  {
    title: "Free Access Type",
    key: "article_access_info.fa_type.domain_value",
    dataIndex: "article_access_info.fa_type.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.FA_TYPE,
  },
  {
    title: "Free Access Start Date",
    key: "article_access_info.fa_start_date.domain_value",
    dataIndex: "article_access_info.fa_start_date.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.FA_START_DATE,
  },
  {
    title: "Free Access End Date",
    key: "article_access_info.fa_end_date.domain_value",
    dataIndex: "article_access_info.fa_end_date.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.FA_END_DATE,
  },
  {
    title: "Open Access License Type",
    key: "article_access_info.oa_license_type.domain_value",
    dataIndex: "article_access_info.oa_license_type.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.OA_LICENSE_TYPE,
  },
  {
    title: "Open Access Order Status",
    key: "article_access_info.oa_order_status.domain_value",
    dataIndex: "article_access_info.oa_order_status.domain_value",
    type: "dropdown",
    entity: EntityNames.DOMAIN,
    labelKey: "domain_value",
    domainCategory: DOMAIN_CATEGORIES.OA_ORDER_STATUS,
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

export const PUBLISHED_ARTICLE_FIELDS = [
  {
    title: "Article Status",
    key: "article_status",
    dataIndex: "article_status",
    type: "dropdown",
    options: ARTICLE_STATUS_VALS,
  },
  {
    title: "Created On",
    key: "created_on",
    dataIndex: "created_on",
    type: "dateTime",
  },
  {
    title: "Journal Code",
    key: "journal_id.acronym",
    dataIndex: "journal_id.acronym",
  },
  // {
  //   title: "Bussiness Segment",
  //   key: "bussinessSegment",
  //   dataIndex: "bussinessSegment",
  // },
  {
    title: "Article Category",
    key: "category_name",
    dataIndex: "article_type_id.article_category_id.category_name",
    type: "dropdown",
    entity: EntityNames.ARTICLE_CATEGORY,
  },
  {
    title: "Open Access",
    key: "article_access_info.oa",
    dataIndex: "article_access_info.oa",
    type: "boolean",
  },
  {
    title: "DOI",
    key: "article_publication_info.doi",
    dataIndex: "article_publication_info.doi",
  },
  { title: "Article Title", key: "title", dataIndex: "title" },
  {
    title: "Author",
    key: "entity_map.authors.contributor_id",
    dataIndex: "entity_map.authors.contributor_id.first_name",
  },
  {
    title: "Publication Date",
    key: "article_key_dates.pub_on",
    dataIndex: "article_key_dates.pub_on",
    type: "date",
  },
  {
    title: "Volume Number",
    key: "volume_number",
    dataIndex:
      "issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_number",
    type: "dropdown",
    entity: EntityNames.VOLUME_ISSUE,
  },
  {
    title: "Issue Number",
    key: "issue_number",
    dataIndex: "issue_makeup_link.makeup_id.issue_id.issue_number",
    type: "dropdown",
    entity: EntityNames.ISSUE,
  },
  {
    title: "Issue Publication Date",
    key: "publication_date",
    dataIndex: "issue_makeup_link.makeup_id.issue_id.publication_date",
    type: "date",
  },
  {
    title: "Article ID",
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Online ISSN",
    key: "online_issn",
    dataIndex: "journal_id.online_issn",
  },
  {
    title: "Print ISSN",
    key: "journal_id.print_issn",
    dataIndex: "journal_id.print_issn",
  },
];

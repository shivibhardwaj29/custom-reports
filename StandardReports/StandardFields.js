export const STANDARD_REPORTS = {
  "Published Article Report": {
    id: null,
    report_name: "Published Article Report",
    visibility: "PUBLIC",
    report_roles: [],
    is_favourite: false,
    report_json: `{
      "columns": [
        {
          "rawTitle": "Article Status",
          "dataIndex": "article_status",
          "key": "article_status",
          "type": "dropdown",
          "options": [
            { "value": "ACTIVE", "label": "Active" },
            { "value": "DRAFT", "label": "Draft" },
            { "value": "WITHDRAWN", "label": "Withdrawn" },
            { "value": "ON_HOLD", "label": "On Hold" },
            { "value": "PUBLISHED", "label": "Published" }
          ]
        },
        {
          "rawTitle": "Created On",
          "dataIndex": "created_on",
          "key": "created_on",
          "type": "dateTime"
        },
        {
          "rawTitle": "Journal Code",
          "dataIndex": "journal_id.acronym",
          "key": "journal_id.acronym"
        },
        {
          "rawTitle": "Article Category",
          "dataIndex": "article_type_id.article_category_id.category_name",
          "key": "category_name",
          "type": "dropdown",
          "entity": "ArticleCategory"
        },
        {
          "rawTitle": "Open Access",
          "dataIndex": "article_access_info.oa",
          "key": "article_access_info.oa",
          "type": "boolean"
        },
        {
          "rawTitle": "DOI",
          "dataIndex": "article_publication_info.doi",
          "key": "article_publication_info.doi"
        },
        {
          "rawTitle": "Article Title",
          "dataIndex": "title",
          "key": "title"
        },
        {
          "rawTitle": "Author",
          "dataIndex": "entity_map.authors.contributor_id.first_name",
          "key": "entity_map.authors.contributor_id"
        },
        {
          "rawTitle": "Publication Date",
          "dataIndex": "article_key_dates.pub_on",
          "key": "article_key_dates.pub_on",
          "type": "date"
        },
        {
          "rawTitle": "Volume Number",
          "dataIndex": "issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_number",
          "key": "volume_number",
          "type": "dropdown",
          "entity": "VolumeAndIssue"
        },
        {
          "rawTitle": "Issue Number",
          "dataIndex": "issue_makeup_link.makeup_id.issue_id.issue_number",
          "key": "issue_number",
          "type": "dropdown",
          "entity": "IssueDetail"
        },
        {
          "rawTitle": "Issue Publication Date",
          "dataIndex": "issue_makeup_link.makeup_id.issue_id.publication_date",
          "key": "publication_date",
          "type": "date"
        },
        {
          "rawTitle": "Article ID",
          "dataIndex": "id",
          "key": "id"
        },
        {
          "rawTitle": "Online ISSN",
          "dataIndex": "journal_id.online_issn",
          "key": "online_issn"
        },
        {
          "rawTitle": "Print ISSN",
          "dataIndex": "journal_id.print_issn",
          "key": "journal_id.print_issn"
        }
      ],
      "filters": {
        "article_status": {
          "value": "PUBLISHED",
          "filterType": "in"
        },
        "created_on": {
          "filterType": "between",
          "value": ""
        }
      },
      "sort": {
        "field": null,
        "order": null
      },
      "pagination": {
        "pageIndex": 0,
        "limit": 10
      },
      "entitySelected": "Article"
    }`,
  },
  "Journal Metadata Report": {
    id: null,
    report_name: "Journal Metadata Report",
    visibility: "PUBLIC",
    report_roles: [],
    is_favourite: false,
    report_json: `{
      "columns": [
        { "rawTitle": "Status", "dataIndex": "journal_status", "key": "journal_status", "type": "dropdown", "options": [ { "value": "ACTIVE", "label": "Active" }, { "value": "INACTIVE", "label": "Inactive" }, { "value": "DRAFT", "label": "Draft" } ] },
        { "rawTitle": "Journal Type", "dataIndex": "journal_article_info.submission.domain_value", "key": "journal_article_info.submission.domain_value", "domainCategory": "SUBMISSION", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "Journal Code", "dataIndex": "acronym", "key": "acronym", "type": "dropdown", "entity": "JournalDetail"},
        { "rawTitle": "Journal Title", "dataIndex": "title", "key": "title" },
        { "rawTitle": "Journal Subtitle", "dataIndex": "short_title", "key": "short_title" },
        { "rawTitle": "Online ISSN", "dataIndex": "online_issn", "key": "online_issn" },
        { "rawTitle": "Print ISSN", "dataIndex": "print_issn", "key": "print_issn" },
        { "rawTitle": "Publisher", "dataIndex": "partner_id.partner_name", "key": "partner_name", "type": "dropdown", "entity": "Partner"  },
        { "rawTitle": "Owner", "dataIndex": "journal_owner", "key": "journal_owner" },
        { "rawTitle": "Publication Mode", "dataIndex": "journal_issue_info.pub_mode.domain_value", "key": "journal_issue_info.pub_mode", "domainCategory": "PUB_MODE", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "OA Status/Open Access Type", "dataIndex": "journal_article_info.oa_type", "key": "journal_article_info.oa_type", "type": "dropdown", "options": [ { "value": "FULL", "label": "Full" }, { "value": "HYBRID", "label": "Hybrid" }, { "value": "NONE", "label": "None" } ] },
        { "rawTitle": "Free Access Type", "dataIndex": "journal_article_info.fa_type.domain_value", "key": "journal_article_info.fa_type", "domainCategory": "FA_TYPE", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "Free Access End Date", "dataIndex": "journal_article_info.fa_end.domain_value", "key": "journal_article_info.fa_end", "domainCategory": "FA_END_DATE", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "Journal Online Code", "dataIndex": "online_code", "key": "online_code" },
        { "rawTitle": "Production Mode", "dataIndex": "prod_mode.domain_value", "key": "prod_mode.domain_value", "domainCategory": "PROD_MODE", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "Issue Workflow", "dataIndex": "journal_workflows.issue.id", "key": "journal_workflows.issue", "type": "dropdown", "labelKey": "workflow_alias", "entity": "JournalWorkflow" },
        { "rawTitle": "Article Workflow", "dataIndex": "journal_workflows.article.id", "key": "journal_workflows.article", "type": "dropdown", "labelKey": "workflow_alias", "entity": "JournalWorkflow" },
        { "rawTitle": "Trim Size", "dataIndex": "journal_article_info.trim_size.domain_value", "key": "journal_article_info.trim_size.domain_value", "domainCategory": "TRIM_SIZE", "type": "dropdown", "labelKey": "domain_value", "entity": "DomainData" },
        { "rawTitle": "Article Categories", "dataIndex": "journal_article_info.journal_article_type.article_type_id.article_category_id.id", "key": "journal_article_info.journal_article_type.article_type_id.article_category_id.id", "type": "dropdown", "labelKey": "category_name", "entity": "ArticleCategory" },
        { "rawTitle": "Company (Conversion Vendor)", "dataIndex": "supplier_id.cvs_name", "key": "cvs_name", "type": "dropdown", "entity": "CVSDetails" },
        { "rawTitle": "Supplier Contact", "dataIndex": "supplier_contact_id.id", "key": "supplier_contact_id", "type": "dropdown", "labelKey": "fname", "entity": "UserDetails" }
      ],
      "filters": {},
      "sort": { "field": null, "order": null },
      "pagination": { "pageIndex": 0, "limit": 10 },
      "entitySelected": "Journal"
    }`,
  },
};

export const filterOptions = [
  { value: "equals", label: "Equals" },
  { value: "not-equals", label: "Not Equals" },
  { value: "in", label: "In" },
  { value: "not-in", label: "Not In" },
  { value: "like", label: "Like" },
  { value: "not-like", label: "Not Like" },
  { value: "is-null", label: "Is Null" },
  { value: "is-not-null", label: "Is Not Null" },
];

export const dateTypeFilterOptions = [
  { value: "equals", label: "Equals" },
  { value: "not-equals", label: "Not Equals" },
  { value: "in", label: "In" },
  { value: "not-in", label: "Not In" },
  { value: "like", label: "Like" },
  { value: "not-like", label: "Not Like" },
  { value: "is-null", label: "Is Null" },
  { value: "is-not-null", label: "Is Not Null" },
  { value: "greater", label: "Greater" },
  { value: "greater-equals", label: "Greater Equals" },
  { value: "less", label: "Smaller" },
  { value: "less-equals", label: "Smaller Equals" },
  { value: "between", label: "Between" },
];

export const dropdownTypeFilterOptions = [
  { value: "equals", label: "Equals" },
  { value: "not-equals", label: "Not Equals" },
  { value: "in", label: "In" },
  { value: "not-in", label: "Not In" },
  { value: "is-null", label: "Is Null" },
  { value: "is-not-null", label: "Is Not Null" },
];
export const operatorsWithoutValue = [
  "is-null",
  "is-not-null",
  "is-true",
  "is-not-true",
];

export const getValueFromPath = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj);

export const ARTICLE_FIELDS =
  "id,created_on,created_by.lname,created_by.fname,updated_by.fname,updated_by.lname,updated_on,title,sub_title,peer_review_id,comments,journal_workflow_id.workflow_alias,journal_workflow_id.workflow_id.workflow_name,article_status,journal_id.id,journal_id.title,journal_id.short_title,journal_id.acronym,journal_id.journal_status,article_type_id.id,article_type_id.article_type,article_type_id.article_category_id.category_name,issue_makeup_link.makeup_id.issue_id.id,issue_makeup_link.makeup_id.issue_id.issue_number,issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_number,issue_makeup_link.makeup_id.issue_id.volume_issue_id.volume_year,journal_id.importance,journal_id.lang_id.lang_name,journal_id.email,journal_id.signature,journal_id.house_style_id.house_style_name,journal_id.coden,journal_id.journal_format,journal_id.partner_id.partner_name,journal_id.online_code,journal_id.online_issn,journal_id.print_issn,journal_id.primary_issn,entity_map.process_list.process_id.process_name,entity_map.process_list.entity_schedule_id.schedule_date,entity_map.process_list.entity_schedule_id.estimated_date,entity_map.process_list.entity_schedule_id.actual_date,entity_map.process_list.entity_process_assignment_id.user_id.id,entity_map.authors.contributor_id.first_name,entity_map.authors.contributor_id.last_name,entity_map.authors.is_corr,issue_makeup_link.makeup_id.issue_id.title,issue_makeup_link.makeup_id.issue_id.issue_type,issue_makeup_link.makeup_id.issue_id.cover_month,issue_makeup_link.makeup_id.issue_id.cover_date,issue_makeup_link.makeup_id.issue_id.issue_close_date,issue_makeup_link.makeup_id.issue_id.publication_date,issue_makeup_link.makeup_id.issue_id.issue_status,entity_map.process_list.entity_process_assignment_id.user_id.fname,entity_map.process_list.entity_process_assignment_id.user_id.lname,article_access_info.oa,article_publication_info.doi,article_key_dates.pub_on,article_prod_info.process_track.domain_value,article_prod_info.pub_mode.domain_value,article_prod_info.prod_mode.domain_value,article_prod_info.special_issue_title,article_prod_info.special_issue_id,article_prod_info.issue_subject,article_access_info.fa,article_access_info.fa_type.domain_value,article_access_info.fa_start_date.domain_value,article_access_info.fa_end_date.domain_value,article_access_info.oa,article_access_info.oa_license_type.domain_value,article_access_info.oa_order_status.domain_value";

export const JOURNAL_FIELDS =
  "id,title,created_on,created_by.lname,created_by.fname,updated_by.fname,updated_by.lname,updated_on,short_title,acronym,journal_status,email,signature,house_style_id.house_style_name,supplier_id.cvs_name,journal_workflows.workflow_alias,journal_workflows.workflow_id.workflow_name,journal_workflows.is_default,journal_workflows.workflow_id.entity_type,partner_id.partner_name,online_issn,importance,lang_id.lang_name,coden,journal_format,prod_mode.domain_value,journal_owner,online_code,print_issn,primary_issn,doi_issn,doi_prefix,doi_creation_rule,comments,journal_issue_info.pub_mode.domain_value,journal_article_info.oa_type,journal_article_info.fa_type.domain_value,journal_article_info.fa_end.domain_value,journal_article_info.fa_start.domain_value,journal_article_info.trim_size.domain_value,journal_article_info.journal_article_type.article_type_id.article_category_id.category_name,supplier_contact_id.fname,supplier_contact_id.lname,journal_article_info.submission.domain_value,partner_contact_id.fname,partner_contact_id.lname";

export const standardReports = {
  1: "Published Article Report",
  2: "Journal Metadata Report",
};

export const STANDARD_REPORTS_NAMES = Object.freeze({
  PUBLISHED_ARTICLE: "Published Article Report",
  JOURNAL_METADATA: "Journal Metadata Report",
});

export const getStandardReport = (id) =>
  standardReports[id] || "Unknown Report";

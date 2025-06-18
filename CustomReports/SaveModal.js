import { Button, Col, Form, message, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import CustomInput from "../../components/shared/CustomInput";
import {
  VISIBILITY_OPTS,
  VISIBILITY_OPTS_VALS,
} from "../../../enums/JournalEnums";
import CustomDropdown from "../../components/shared/CustomDropdown";
import { useDispatch } from "react-redux";
import { fetchRoles } from "../../../store/slices/fetchRolesSlice";
import { EntityNames } from "../../../services/entities";
import Loader from "../../components/Loader";
import { usePostData } from "../../../hooks/useData";
import { ENDPOINTS } from "../../../services/endpoints";

const SaveModal = ({ savedReport, open, onClose, reportState, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [rolesOpts, setRolesOpts] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedVisibility = Form.useWatch("visibility", form);
  const { mutate } = usePostData();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values) => {
    const savedReportRoles = Array.isArray(savedReport?.report_roles)
      ? savedReport.report_roles
      : [];

    const reportRolesMapping = savedReportRoles.reduce((acc, role) => {
      acc[role.role_id.id] = role.id;
      return acc;
    }, {});

    const reportRoles = (values?.selectedRoles || []).map((item) => {
      const savedRoleId = reportRolesMapping[item] ?? null;
      return {
        id: savedRoleId,
        role_id: {
          id: item,
        },
      };
    });

    if (reportState?.columns?.length > 0) {
      const cleanColumns = reportState.columns.map((col) => {
        const { title, ...rest } = col;
        return rest;
      });

      const cleanReportState = {
        ...reportState,
        columns: cleanColumns,
      };

      const jsonPayload = JSON.stringify(cleanReportState);

      console.log(jsonPayload);

      const body = {
        id: savedReport?.id ?? null,
        report_name: values?.reportName?.trim(),
        visibility: values?.visibility,
        report_roles: reportRoles,
        is_favourite: savedReport?.is_favourite ?? false,
        report_json: jsonPayload,
      };

      console.log(body);
      mutate(
        {
          url: ENDPOINTS.createOrUpdateCustomReport,
          data: body,
        },
        {
          onSuccess: (response) => {
            message.success(
              `Report ${savedReport ? "Updated" : "Saved"} Successfully`
            );
            onClose();
            onSuccess();
          },
          onError: (err) => {
            if (err?.message === "Conflict") {
              message.error("Report Name already exists.");
            }
          },
        }
      );
    }
  };

  const handleValueChange = (fieldName, value) => {
    form.setFieldsValue({
      [fieldName]: value,
    });
  };

  useEffect(() => {
    const fetchOptions = async (
      fetchFunction,
      entity,
      labelKey,
      page,
      setOptions,
      body = {}
    ) => {
      setLoading(true);
      try {
        const response = await dispatch(
          fetchFunction({
            entity,
            page,
            size: 500,
            body,
          })
        );

        const content = response?.payload?.data?.data?.content || [];

        setOptions((prevOptions) => {
          const existingIds = new Set(prevOptions.map((opt) => opt.value));
          const newOptions = content
            .map((item) => ({
              ...item,
              value: item.id,
              label: item[labelKey],
            }))
            .filter((option) => !existingIds.has(option.value));

          return [...prevOptions, ...newOptions];
        });
      } catch (error) {
        console.error(`Error fetching ${entity} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    const fetchData = async () => {
      await fetchOptions(
        fetchRoles,
        EntityNames.ROLES,
        "role_name",
        0,
        setRolesOpts,
        { fields: "id,role_name" }
      );
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (savedReport) {
      form.setFieldsValue({
        reportName: savedReport?.report_name,
        visibility: savedReport?.visibility,
        selectedRoles:
          savedReport?.report_roles?.length > 0
            ? savedReport?.report_roles?.map((item) => item?.role_id?.id)
            : [],
      });
    }
  }, [savedReport, form]);

  return (
    <Modal
      title="Save report as"
      open={open}
      onCancel={handleCancel}
      centered
      width={600}
      keyboard={false}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          color="default"
          className="btn-secondary"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          color="default"
          variant="solid"
          className="btn-primary"
          onClick={() => form.submit()}
        >
          Save
        </Button>,
      ]}
    >
      {loading ? (
        <>
          <Loader size="large" />
        </>
      ) : (
        <Form
          form={form}
          layout="vertical"
          className="mt-3"
          onFinish={handleSubmit}
          initialValues={{
            visibility: "SPECIFIC_ROLE",
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <CustomInput
                label="Report Name"
                name="reportName"
                required
                min={1}
                max={250}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomDropdown
                label="Visibility"
                name="visibility"
                options={VISIBILITY_OPTS}
                required
                onChange={handleValueChange}
              />
            </Col>
            {selectedVisibility === VISIBILITY_OPTS_VALS.SPECIFIC_ROLE && (
              <Col span={12}>
                <CustomDropdown
                  label="Select Role"
                  name="selectedRoles"
                  options={rolesOpts}
                  required={
                    selectedVisibility === VISIBILITY_OPTS_VALS.SPECIFIC_ROLE
                  }
                  placeholder="Select Role"
                  onChange={handleValueChange}
                  errorLabel="Select Role"
                  multiple={true}
                />
              </Col>
            )}
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default SaveModal;

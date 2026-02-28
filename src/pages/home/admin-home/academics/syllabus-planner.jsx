import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Col,
  Empty,
  Layout,
  Modal,
  Progress,
  Result,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  FilterOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  clearSyllabusDetail,
  fetchSyllabusClasses,
  fetchSyllabusDetail,
  selectSyllabusClasses,
  selectSyllabusDetailChapters,
  selectSyllabusDetailError,
  selectSyllabusDetailLoading,
  selectSyllabusListError,
  selectSyllabusListLoading,
} from "../../../../redux/syllabus-planner-slice";

import "./syllabus-planner.scss";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const VIEW_MODES = {
  CLASSES: "classes",
  SUBJECTS: "subjects",
  DETAIL: "detail",
};

const SyllabusPlanner = () => {
  const dispatch = useDispatch();

  const classes = useSelector(selectSyllabusClasses);
  const listLoading = useSelector(selectSyllabusListLoading);
  const listError = useSelector(selectSyllabusListError);

  const detailChapters = useSelector(selectSyllabusDetailChapters);
  const detailLoading = useSelector(selectSyllabusDetailLoading);
  const detailError = useSelector(selectSyllabusDetailError);

  const [currentRole, setCurrentRole] = useState("Admin");
  const [viewMode, setViewMode] = useState(VIEW_MODES.CLASSES);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planStep, setPlanStep] = useState(0);
  const [planForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchSyllabusClasses());
  }, [dispatch]);

  const handleToggleRole = () => {
    setCurrentRole((prev) => (prev === "Admin" ? "Teacher" : "Admin"));
  };

  const handleOpenSubjects = (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    dispatch(clearSyllabusDetail());
    setViewMode(VIEW_MODES.SUBJECTS);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    dispatch(clearSyllabusDetail());
    setViewMode(VIEW_MODES.CLASSES);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    dispatch(clearSyllabusDetail());
    setViewMode(VIEW_MODES.SUBJECTS);
  };

  const handleViewSubjectDetail = (subject) => {
    setSelectedSubject(subject);
    dispatch(fetchSyllabusDetail(subject.id));
    setViewMode(VIEW_MODES.DETAIL);
  };

  const handleOpenPlanModal = () => {
    planForm.resetFields();
    planForm.setFieldsValue({
      session: undefined,
      className: undefined,
      subjectName: undefined,
      chapters: [
        {
          name: "",
          duration: 0,
          topics: [],
        },
      ],
    });
    setPlanStep(0);
    setIsPlanModalOpen(true);
  };

  const handleClosePlanModal = () => {
    setIsPlanModalOpen(false);
  };

  const handlePlanNext = async () => {
    if (planStep === 0) {
      try {
        await planForm.validateFields(["session", "className", "subjectName"]);
        setPlanStep(1);
      } catch {
        // ignore – antd will show validation errors
      }
      return;
    }

    try {
      const values = await planForm.validateFields();

      const errors = [];
      (values.chapters || []).forEach((chapter, index) => {
        const chapterDuration = Number(chapter?.duration || 0);
        const topicsDuration = (chapter?.topics || []).reduce(
          (sum, topic) => sum + Number(topic?.duration || 0),
          0,
        );

        if (chapterDuration !== topicsDuration) {
          errors.push(
            `Chapter ${index + 1}: Planned days (${chapterDuration}) must equal sum of topics (${topicsDuration}).`,
          );
        }
      });

      if (errors.length) {
        Modal.error({
          title: "Duration mismatch",
          content: (
            <div>
              {errors.map((msg) => (
                <div key={msg}>{msg}</div>
              ))}
            </div>
          ),
        });
        return;
      }

      Modal.success({
        title: "Syllabus plan saved (mock)",
        content:
          "Backend APIs are not ready yet, but the structure and validation follow the project rules.",
      });
      setIsPlanModalOpen(false);
    } catch {
      // antd validation error – already visible in form
    }
  };

  const selectedClassSubjects = useMemo(
    () => selectedClass?.subjects || [],
    [selectedClass],
  );

  const renderListState = () => {
    if (listLoading) {
      return (
        <div className="syllabus-planner__centered">
          <Spin />
        </div>
      );
    }

    if (listError) {
      return (
        <Result
          status="error"
          title="Failed to load syllabus classes"
          subTitle={listError}
        />
      );
    }

    if (!classes.length) {
      return (
        <Empty description="No syllabus plans found. Create one to get started." />
      );
    }

    return (
      <Card>
        <Table
          rowKey="id"
          dataSource={classes}
          columns={classColumns}
          pagination={false}
          size="middle"
        />
      </Card>
    );
  };

  const classColumns = [
    {
      title: "Class",
      dataIndex: "className",
      key: "class",
      render: (value) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary" className="syllabus-planner__small-text">
            Syllabus Listing
          </Text>
        </Space>
      ),
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      align: "center",
      render: (value) => (
        <Tag color="purple">{value}</Tag>
      ),
    },
    {
      title: "Teacher",
      dataIndex: "classTeacher",
      key: "teacher",
      align: "center",
      render: (value) => (
        <Tag color="gold">{value}</Tag>
      ),
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      align: "center",
      render: (_, record) => (
        <Tag color="volcano">{record.subjects.length}</Tag>
      ),
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      align: "center",
      render: (value) => (
        <Tag color="green">{value}</Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "overallProgress",
      key: "progress",
      render: (value) => (
        <Space>
          <Progress
            percent={value}
            size="small"
            showInfo={false}
            status={value === 100 ? "success" : "active"}
            style={{ minWidth: 120 }}
          />
          <Text strong>{value}%</Text>
        </Space>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updated",
      render: (value) => <Text type="secondary">{value}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleOpenSubjects(record)}
        >
          Progress
        </Button>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: "Subject",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary" className="syllabus-planner__small-text">
            {record.chapters} Chapters
          </Text>
        </Space>
      ),
    },
    {
      title: "Teacher",
      dataIndex: "teacher",
      key: "teacher",
      align: "center",
      render: (value) => <Text>{value}</Text>,
    },
    {
      title: "Status",
      dataIndex: "completed",
      key: "completed",
      align: "center",
      render: (value) => (
        <Tag color="green" className="syllabus-planner__status-tag">
          {value} Completed
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (value) => (
        <Space>
          <Progress
            percent={value}
            size="small"
            showInfo={false}
            status={value === 100 ? "success" : "active"}
            style={{ minWidth: 160 }}
          />
          <Text strong>{value}%</Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="View curriculum progress">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleViewSubjectDetail(record)}
            />
          </Tooltip>
          {currentRole === "Admin" && (
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
            >
              Edit Plan
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderSubjectsState = () => {
    if (!selectedClass) {
      return (
        <Empty description="Select a class from the previous screen to view subjects." />
      );
    }

    return (
      <>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToClasses}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {selectedClass.className} - Subjects Overview
            </Title>
            <Text type="secondary">
              Curriculum progress &amp; teacher allocation
            </Text>
          </div>
        </Space>

        <Card>
          <Table
            rowKey="id"
            dataSource={selectedClassSubjects}
            columns={subjectColumns}
            pagination={false}
          />
        </Card>
      </>
    );
  };

  const renderDetailState = () => {
    if (!selectedSubject) {
      return (
        <Empty description="Select a subject from the previous screen to view curriculum detail." />
      );
    }

    if (detailLoading) {
      return (
        <div className="syllabus-planner__centered">
          <Spin />
        </div>
      );
    }

    if (detailError) {
      return (
        <Result
          status="error"
          title="Failed to load curriculum detail"
          subTitle={detailError}
          extra={
            <Button onClick={() => handleViewSubjectDetail(selectedSubject)}>
              Retry
            </Button>
          }
        />
      );
    }

    return (
      <>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToSubjects}
          />
          <div>
            <Space align="baseline">
              <Title level={4} style={{ margin: 0 }}>
                {selectedSubject.name} Master Curriculum
              </Title>
              {selectedClass && (
                <Tag color="blue">
                  {selectedClass.className}-{selectedClass.section}
                </Tag>
              )}
            </Space>
            <Space size={8}>
              <Text type="secondary">
                Teacher: {selectedSubject.teacher}
              </Text>
              <Text type="secondary">Session 2024-25</Text>
            </Space>
          </div>
        </Space>

        <Card style={{ marginBottom: 16 }}>
          <Space
            align="center"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space direction="vertical" size={2}>
              <Text type="secondary">Coverage</Text>
              <Title level={3} style={{ margin: 0 }}>
                {selectedSubject.progress}%
              </Title>
            </Space>
            <div style={{ flex: 1, marginLeft: 24 }}>
              <Progress
                percent={selectedSubject.progress}
                status={
                  selectedSubject.progress === 100 ? "success" : "active"
                }
              />
              <Space
                style={{ marginTop: 8, justifyContent: "space-between", width: "100%" }}
              >
                <Text type="secondary">
                  {selectedSubject.chapters} Chapters Recorded
                </Text>
                <Space size={4}>
                  <Tag color="green">On Schedule</Tag>
                  <Tag color="orange">Revised: May 24</Tag>
                </Space>
              </Space>
            </div>
          </Space>
        </Card>

        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {detailChapters.map((chapter) => {
            const completedTopics = chapter.topics.filter(
              (topic) => topic.status === "Completed",
            ).length;
            const totalTopics = chapter.topics.length;

            return (
              <Card key={chapter.id} className="syllabus-planner__chapter-card">
                <Space
                  align="flex-start"
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space direction="vertical" size={4}>
                    <Title level={5} style={{ margin: 0 }}>
                      {chapter.name}
                    </Title>
                    <Space size={6}>
                      <Text type="secondary">{chapter.days} Days</Text>
                      <Tag
                        color={
                          chapter.status === "Completed" ? "green" : "blue"
                        }
                      >
                        {chapter.status}
                      </Tag>
                    </Space>
                    {chapter.reason && (
                      <Text type="secondary" className="syllabus-planner__reason">
                        <strong>Reason from Teacher:</strong> {chapter.reason}
                      </Text>
                    )}
                  </Space>

                  <Space size={16}>
                    <Space direction="vertical" size={4}>
                      <Progress
                        percent={chapter.progress}
                        size="small"
                        status={
                          chapter.progress === 100 ? "success" : "active"
                        }
                        style={{ minWidth: 160 }}
                      />
                      <Text strong>{chapter.progress}%</Text>
                    </Space>
                    <Space direction="vertical" size={4}>
                      <Text type="secondary">
                        {completedTopics}/{totalTopics} Units
                      </Text>
                    </Space>
                  </Space>
                </Space>

                <div className="syllabus-planner__topics">
                  {chapter.topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="syllabus-planner__topic-row"
                    >
                      <Space>
                        <Text type="secondary" className="syllabus-planner__topic-index">
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                        <div className="syllabus-planner__topic-dot" />
                        <Text>{topic.name}</Text>
                      </Space>
                      <Space>
                        <Tag
                          color={
                            topic.status === "Completed"
                              ? topic.isOnTime
                                ? "green"
                                : "red"
                              : "default"
                          }
                        >
                          {topic.status}
                        </Tag>
                        {topic.status === "Completed" && (
                          <Tag color={topic.isOnTime ? "green" : "red"}>
                            {topic.isOnTime ? "On Time" : "Delayed / Early"}
                          </Tag>
                        )}
                        {topic.status === "Completed" && topic.reason && (
                          <Text type="secondary" className="syllabus-planner__reason">
                            {topic.reason}
                          </Text>
                        )}
                      </Space>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </Space>
      </>
    );
  };

  const renderMainContent = () => {
    if (viewMode === VIEW_MODES.SUBJECTS) {
      return renderSubjectsState();
    }

    if (viewMode === VIEW_MODES.DETAIL) {
      return renderDetailState();
    }

    return (
      <>
        <Space
          align="center"
          style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Syllabus Planner
            </Title>
            <Text type="secondary">
              Create and manage syllabus plans (Chapters &amp; Topics)
            </Text>
          </div>
          {currentRole === "Admin" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenPlanModal}
            >
              Create Syllabus Plan
            </Button>
          )}
        </Space>

        {/* Filters */}
        <Card className="syllabus-planner__filters" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 8]} align="bottom">
            <Col>
              <div className="syllabus-planner__filter-label">Class</div>
              <Select placeholder="All" style={{ width: 120 }} allowClear options={[
                { value: "Class 9", label: "Class 9" },
                { value: "Class 10", label: "Class 10" },
                { value: "Class 12", label: "Class 12" },
              ]} />
            </Col>
            <Col>
              <div className="syllabus-planner__filter-label">Section</div>
              <Select placeholder="All" style={{ width: 120 }} allowClear options={[
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "C", label: "C" },
              ]} />
            </Col>
            <Col>
              <div className="syllabus-planner__filter-label">Subject</div>
              <Select placeholder="All" style={{ width: 140 }} allowClear options={[
                { value: "Mathematics", label: "Mathematics" },
                { value: "Science", label: "Science" },
                { value: "English", label: "English" },
              ]} />
            </Col>
            <Col>
              <div className="syllabus-planner__filter-label">Teacher</div>
              <Select placeholder="All" style={{ width: 180 }} allowClear options={[
                { value: "Mr. Rajesh Kumar", label: "Mr. Rajesh Kumar" },
                { value: "Ms. Anjali Singh", label: "Ms. Anjali Singh" },
                { value: "Mr. Vikram Roy", label: "Mr. Vikram Roy" },
              ]} />
            </Col>
            <Col>
              <Button type="default" icon={<FilterOutlined />}>
                Apply
              </Button>
            </Col>
          </Row>
        </Card>

        {renderListState()}
      </>
    );
  };

  return (
    <Layout className="syllabus-planner">
      <Sider
        width={84}
        className="syllabus-planner__sider"
        theme="light"
        collapsedWidth={84}
      >
        <div className="syllabus-planner__logo">H</div>
      </Sider>
      <Layout>
        <Content className="syllabus-planner__content">
          <div className="syllabus-planner__header">
            <div />
            <Space>
              <Button
                size="small"
                onClick={handleToggleRole}
              >
                Switch Role (Testing){" "}
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {currentRole}
                </Tag>
              </Button>
            </Space>
          </div>
          <div className="syllabus-planner__body">{renderMainContent()}</div>
        </Content>
      </Layout>

      <Modal
        title={null}
        open={isPlanModalOpen}
        onCancel={handleClosePlanModal}
        footer={null}
        width={900}
        className="syllabus-planner__create-modal"
        closeIcon={<span style={{ fontSize: 18 }}>×</span>}
      >
        {/* Modal Header */}
        <div className="syllabus-planner__modal-header">
          <div className="syllabus-planner__modal-header-left">
            <div className="syllabus-planner__modal-icon">
              <EditOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Syllabus Planner</Title>
              <div className="syllabus-planner__modal-steps">
                <span className={planStep >= 0 ? "active" : ""}>
                  <span className="syllabus-planner__step-num">1</span> Basic Info
                </span>
                <span className="syllabus-planner__step-divider" />
                <span className={planStep >= 1 ? "active" : ""}>
                  <span className="syllabus-planner__step-num">2</span> Curriculum
                </span>
              </div>
            </div>
          </div>
        </div>

        <Form
          form={planForm}
          layout="vertical"
          className="syllabus-planner__plan-form"
        >
          {planStep === 0 && (
            <div className="syllabus-planner__basic-info">
              <Row gutter={24}>
                {/* Timeline Settings */}
                <Col span={12}>
                  <Card className="syllabus-planner__info-card">
                    <Space align="center" size={12} style={{ marginBottom: 20 }}>
                      <div className="syllabus-planner__card-icon blue">
                        <CalendarOutlined />
                      </div>
                      <Title level={5} style={{ margin: 0 }}>Timeline Settings</Title>
                    </Space>
                    <Form.Item
                      name="session"
                      label="ACADEMIC SESSION"
                      rules={[{ required: true, message: "Please select session" }]}
                      className="syllabus-planner__form-label-upper"
                    >
                      <Select placeholder="Select Session" size="large">
                        <Option value="2024-2025">2024-2025</Option>
                        <Option value="2025-2026">2025-2026</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>

                {/* Academic Scope */}
                <Col span={12}>
                  <Card className="syllabus-planner__info-card">
                    <Space align="center" size={12} style={{ marginBottom: 20 }}>
                      <div className="syllabus-planner__card-icon purple">
                        <ApartmentOutlined />
                      </div>
                      <Title level={5} style={{ margin: 0 }}>Academic Scope</Title>
                    </Space>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="className"
                          label="CLASS"
                          rules={[{ required: true, message: "Please select class" }]}
                          className="syllabus-planner__form-label-upper"
                        >
                          <Select placeholder="Choose Class" size="large">
                            <Option value="Class 9">Class 9</Option>
                            <Option value="Class 10">Class 10</Option>
                            <Option value="Class 11">Class 11</Option>
                            <Option value="Class 12">Class 12</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="section" label="SECTION" className="syllabus-planner__form-label-upper">
                          <Select placeholder="All Sections" size="large">
                            <Option value="A">Section A</Option>
                            <Option value="B">Section B</Option>
                            <Option value="C">Section C</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="subjectName"
                      label="SUBJECT"
                      rules={[{ required: true, message: "Please select subject" }]}
                      className="syllabus-planner__form-label-upper"
                    >
                      <Select placeholder="Select Subject" size="large">
                        <Option value="Mathematics">Mathematics</Option>
                        <Option value="Science">Science</Option>
                        <Option value="English">English</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <div className="syllabus-planner__info-message">
                <InfoCircleOutlined style={{ fontSize: 20 }} />
                <Text>
                  Ensure you select the correct session and class mapping. The chapters and topics defined in the next step will be locked to this combination.
                </Text>
              </div>

              <div className="syllabus-planner__modal-footer">
                <Text type="secondary">All fields are mandatory to proceed</Text>
                <Space>
                  <Button onClick={handleClosePlanModal}>Cancel</Button>
                  <Button type="primary" icon={<ArrowRightOutlined />} onClick={handlePlanNext}>
                    Continue to Curriculum
                  </Button>
                </Space>
              </div>
            </div>
          )}

          {planStep === 1 && (
            <div className="syllabus-planner__curriculum-step">
            <div className="syllabus-planner__curriculum-content">
            <Form.List name="chapters">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field) => (
                        <Card key={field.key} className="syllabus-planner__plan-chapter-card">
                          <div className="syllabus-planner__chapter-header">
                            <div className="syllabus-planner__chapter-fields">
                              <Form.Item
                                {...field}
                                name={[field.name, "name"]}
                                label="CHAPTER NAME"
                                rules={[{ required: true, message: "Please enter chapter name" }]}
                                className="syllabus-planner__form-label-upper"
                              >
                                <Input placeholder="E.g. Real Numbers" size="large" />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "duration"]}
                                label="DURATION (DAYS)"
                                rules={[{ required: true, message: "Required" }]}
                                className="syllabus-planner__form-label-upper syllabus-planner__duration-field"
                              >
                                <InputNumber min={0} style={{ width: "100%" }} size="large" />
                              </Form.Item>
                            </div>
                            <Button
                              type="text"
                              danger
                              className="syllabus-planner__chapter-delete"
                              onClick={() => remove(field.name)}
                              icon={<DeleteOutlined />}
                            />
                          </div>

                          <Form.List name={[field.name, "topics"]}>
                        {(topicFields, { add: addTopic, remove: removeTopic }) => (
                          <>
                            {topicFields.map((topicField) => (
                              <div
                                key={topicField.key}
                                className="syllabus-planner__plan-topic-row"
                              >
                                  <Form.Item
                                    {...topicField}
                                    name={[topicField.name, "name"]}
                                    label="Topic Name"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter topic name",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Topic name (e.g. Euclid’s Division Lemma)" />
                                  </Form.Item>
                                  <Form.Item
                                    {...topicField}
                                    name={[topicField.name, "duration"]}
                                    label="Planned Days"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter days",
                                      },
                                    ]}
                                  >
                                    <InputNumber
                                      min={1}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeTopic(topicField.name)}
                                />
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() =>
                                addTopic({
                                  name: "",
                                  duration: 1,
                                })
                              }
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Sub-topic
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({
                        name: "",
                        duration: 0,
                        topics: [],
                      })
                    }
                  >
                    Add New Chapter to Syllabus
                  </Button>
                </>
              )}
            </Form.List>
              </div>

              <div className="syllabus-planner__modal-footer">
                <Button icon={<ArrowLeftOutlined />} onClick={() => setPlanStep(0)}>
                  Go Back
                </Button>
                <Space>
                  <Button onClick={handleClosePlanModal}>Cancel</Button>
                  <Button type="primary" icon={<CloudUploadOutlined />} onClick={handlePlanNext}>
                    Publish Syllabus Plan
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default SyllabusPlanner;


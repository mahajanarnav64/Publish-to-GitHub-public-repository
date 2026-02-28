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
  ClockCircleOutlined,
  ArrowRightOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  FolderOutlined,
  FileTextOutlined,
  WarningOutlined,
  TagOutlined,
  UpOutlined,
  DownOutlined,
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
  const [expandedChapterId, setExpandedChapterId] = useState(null);

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
    dispatch(fetchSyllabusDetail(subject.id)).then((res) => {
      // Do not open any chapter by default
      setExpandedChapterId(null);
    });
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
      <div className="syllabus-planner__informative-table">
        <Table
          rowKey="id"
          dataSource={classes}
          columns={classColumns}
          pagination={false}
        />
      </div>
    );
  };

  const classColumns = [
    {
      title: "Class Detail",
      dataIndex: "className",
      key: "class",
      width: "25%",
      render: (value) => (
        <div className="subject-info">
          <div className="icon-box" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: 24 }}>
            <ApartmentOutlined />
          </div>
          <div className="text-content">
            <div className="title">{value}</div>
            <div className="instructor">
              Syllabus Listing
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      width: "10%",
      render: (value) => (
        <div className="curriculum-stats">
          <div className="stat-main" style={{ fontSize: 16 }}>{value}</div>
        </div>
      ),
    },
    {
      title: "Teacher",
      dataIndex: "classTeacher",
      key: "teacher",
      width: "15%",
      render: (value) => (
        <div className="timeline-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
            <UserOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
            {value}
          </div>
        </div>
      ),
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <div className="curriculum-stats">
          <div className="stat-main" style={{ fontSize: 16 }}>{record.subjects.length}</div>
        </div>
      ),
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      width: "10%",
      align: "center",
      render: (value) => (
        <div className="curriculum-stats">
          <div className="stat-main" style={{ fontSize: 16 }}>{value}</div>
        </div>
      ),
    },
    {
      title: "Progress",
      dataIndex: "overallProgress",
      key: "progress",
      width: "15%",
      render: (value) => {
        let strokeColor = '#3b82f6';
        if (value === 100) strokeColor = '#10b981';
        if (value === 0) strokeColor = '#e2e8f0';

        return (
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: strokeColor }}>{value}%</span>
            </div>
            <Progress
              percent={value}
              showInfo={false}
              strokeColor={strokeColor}
              trailColor="#f1f5f9"
              strokeWidth={8}
            />
          </div>
        );
      }
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updated",
      width: "10%",
      render: (value) => (
        <div className="timeline-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#1e293b', fontSize: 13, whiteSpace: 'nowrap' }}>
            <CalendarOutlined style={{ color: '#94a3b8', fontSize: 14 }} />
            {value}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "actions",
      align: "right",
      width: "10%",
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            style={{
              background: '#3b82f6',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: 'none'
            }}
            icon={<ArrowRightOutlined style={{ fontSize: 16 }} />}
            onClick={() => handleOpenSubjects(record)}
          />
        </div>
      ),
    },
  ];

  const informativeColumns = [
    {
      title: "Subject Detail",
      key: "info",
      width: "25%",
      render: (_, record) => (
        <div className="subject-info">
          <div className="icon-box">
            <BookOutlined />
          </div>
          <div className="text-content">
            <div className="title">{record.name}</div>
            <div className="instructor">
              <UserOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
              Instructor: {record.teacher}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Chapters",
      key: "structure",
      width: "15%",
      render: (_, record) => (
        <div className="curriculum-stats">
          <div className="stat-main" style={{ fontSize: 16 }}>{record.completed}/{record.chapters}</div>
        </div>
      ),
    },
    {
      title: "Start Date",
      key: "startDate",
      width: "15%",
      render: (_, record) => (
        <div className="timeline-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#1e293b', fontSize: 13, whiteSpace: 'nowrap' }}>
            <CalendarOutlined style={{ color: '#94a3b8' }} />
            {record.startDate || 'Not Set'}
          </div>
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: "20%",
      render: (_, record) => {
        let strokeColor = '#3b82f6';
        if (record.progress === 100) strokeColor = '#10b981';
        if (record.progress === 0) strokeColor = '#e2e8f0';

        return (
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: strokeColor }}>{record.progress}%</span>
            </div>
            <Progress
              percent={record.progress}
              showInfo={false}
              strokeColor={strokeColor}
              trailColor="#f1f5f9"
              strokeWidth={8}
            />
          </div>
        );
      }
    },
    {
      title: "Status",
      key: "status",
      width: "15%",
      render: (_, record) => {
        const isCompleted = record.progress === 100;
        const isNotStarted = record.progress === 0;

        let statusText = 'In Progress';
        let statusClass = 'in-progress';

        if (isCompleted) {
          statusText = 'Completed';
          statusClass = 'completed';
        } else if (isNotStarted) {
          statusText = 'Not Started';
          statusClass = 'not-started';
        }

        return (
          <div className="timeline-info">
            <div className={`modern-status-badge ${statusClass}`}>
              {statusText}
            </div>
          </div>
        );
      }
    },
    {
      title: "Action",
      key: "actions",
      align: "right",
      width: "10%",
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            style={{
              background: '#3b82f6',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: 'none'
            }}
            icon={<ArrowRightOutlined style={{ fontSize: 16 }} />}
            onClick={() => handleViewSubjectDetail(record)}
          />
        </div>
      ),
    },
  ];

  const renderSubjectsState = () => {
    if (!selectedClass) {
      return (
        <Empty description="Select a class from the previous screen to view subjects." />
      );
    }

    const dummySubjects = [
      { id: 1, name: "Mathematics", teacher: "Mr. Sharma", completed: 2, chapters: 6, progress: 33, startDate: "Mar 1, 2026" },
      { id: 2, name: "Science", teacher: "Ms. Gupta", completed: 8, chapters: 8, progress: 100, startDate: "Jan 15, 2026" },
      { id: 3, name: "Biology", teacher: "Dr. Singh", completed: 0, chapters: 5, progress: 0, startDate: null },
      { id: 4, name: "Computer Science", teacher: "Mr. Lee", completed: 4, chapters: 5, progress: 80, startDate: "Feb 10, 2026" },
    ];

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

        <div className="syllabus-planner__informative-table">
          <Table
            rowKey="id"
            dataSource={dummySubjects}
            columns={informativeColumns}
            pagination={false}
            showHeader={true}
          />
        </div>
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
        <Space align="center" style={{ marginBottom: 20 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToSubjects}
            className="syllabus-planner__back-btn"
          />
          <div>
            <Space align="center" style={{ marginBottom: 4 }}>
              <Title level={4} style={{ margin: 0 }}>
                {selectedSubject.name} Master Curriculum
              </Title>
              <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 600 }}>
                {selectedClass.className}-{selectedClass.section}
              </Tag>
            </Space>
            <Space split={<div style={{ width: 1, height: 12, background: '#d9d9d9' }} />}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <UserOutlined style={{ marginRight: 6 }} />
                {selectedSubject.teacher}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Session 2024-25
              </Text>
            </Space>
          </div>
        </Space>

        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          {detailChapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="syllabus-planner__chapter-card"
              style={{
                borderRadius: 12,
                border: "1px solid #c7d2fe",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                overflow: "hidden"
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Chapter Header */}
              <div
                onClick={() => setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", flex: 1 }}>
                  {/* Chapter Title Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 12px", background: "#fff", width: 340, flexShrink: 0 }}>
                    <div style={{ color: "#4f46e5", background: "#f5f3ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      <FolderOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{chapter.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>MASTER CHAPTER</div>
                    </div>
                  </div>

                  {/* Planned Days Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                    <div style={{ color: "#3b82f6", background: "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      <ClockCircleOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{chapter.days} Days</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>ESTIMATED</div>
                    </div>
                  </div>

                  {/* Actual Days Badge (Always render for alignment) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: chapter.actualDays ? "1px solid #fed7aa" : "1px solid #cbd5e1", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap", minWidth: 120 }}>
                    <div style={{ color: chapter.actualDays ? "#f97316" : "#94a3b8", background: chapter.actualDays ? "#ffedd5" : "#f1f5f9", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      <ClockCircleOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: chapter.actualDays ? "#1e293b" : "#64748b", lineHeight: 1.2 }}>
                        {chapter.actualDays ? `${chapter.actualDays} Days` : "In Progress"}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>
                        {chapter.actualDays ? "TAKEN" : "STATUS"}
                      </div>
                    </div>
                  </div>

                  {/* Start Date Badge */}
                  {chapter.startDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#4f46e5", background: "#e0e7ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        <CalendarOutlined />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{chapter.startDate}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>START</div>
                      </div>
                    </div>
                  )}

                  {/* End/Completed Date Badge */}
                  {chapter.endDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: chapter.status === 'Completed' ? "1px solid #dcfce7" : "1px solid #f1f5f9", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                      <div style={{ color: chapter.status === 'Completed' ? "#22c55e" : "#64748b", background: chapter.status === 'Completed' ? "#f0fdf4" : "#f1f5f9", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        <ClockCircleOutlined />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{chapter.endDate}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>
                          {chapter.status === 'Completed' ? 'COMPLETED' : 'EST. END'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #f1f5f9", borderRadius: 8, padding: "6px 12px", background: "#fff" }}>
                    <div style={{ color: "#64748b", background: "#f8fafc", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      <UserOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{chapter.teacher || selectedSubject.teacher}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>TEACHER</div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid", borderColor: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#bbf7d0" : "#fca5a5") : "#bfdbfe", borderRadius: 8, padding: "6px 12px", background: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#f0fdf4" : "#fef2f2") : "#fff", width: 150 }}>
                    <div style={{ color: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#3b82f6", background: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#dcfce7" : "#fee2e2") : "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? <CheckCircleOutlined /> : <WarningOutlined />) : <ClockCircleOutlined />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#1d4ed8", lineHeight: 1.2 }}>{chapter.status}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: chapter.status === 'Completed' ? (chapter.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#1d4ed8", textTransform: "uppercase", marginTop: 2 }}>STATUS</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "0 8px", color: "#94a3b8" }}>
                  {expandedChapterId === chapter.id ? <UpOutlined /> : <DownOutlined />}
                </div>
              </div>

              {/* Collapsed Expanded Section */}
              {expandedChapterId === chapter.id && (
                <div style={{ background: "#fefeff", padding: "0 20px 20px 20px" }}>

                  {/* Delayed Reason Alert block */}
                  {chapter.isOnTime === false && chapter.reason && (
                    <div style={{
                      padding: "12px 16px",
                      background: "#fef2f2",
                      borderLeft: "4px solid #ef4444",
                      color: "#b91c1c",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 16,
                      borderRadius: "0 6px 6px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <WarningOutlined style={{ fontSize: 15 }} />
                      <span>Reason: {chapter.reason}</span>
                    </div>
                  )}

                  {/* Topics Grid */}
                  {chapter.topics && chapter.topics.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {chapter.topics.map((topic, index) => (
                        <div key={topic.id} style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #f1f5f9", borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", background: "#fff", padding: "12px" }}>
                            {/* Topic Title Badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 12px", background: "#fff", width: 340, flexShrink: 0 }}>
                              <div style={{ color: "#3b82f6", background: "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                <FileTextOutlined />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{topic.name}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>CURRICULUM TOPIC</div>
                              </div>
                            </div>

                            {/* Start Date */}
                            {topic.startDate && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #f8fafc", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                                <div style={{ color: "#3b82f6", background: "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                  <CalendarOutlined />
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{topic.startDate}</div>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>START</div>
                                </div>
                              </div>
                            )}

                            {/* Completed/End Date */}
                            {topic.endDate && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, border: topic.status === 'Completed' ? "1px solid #f0fdf4" : "1px solid #f1f5f9", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                                <div style={{ color: topic.status === 'Completed' ? "#10b981" : "#64748b", background: topic.status === 'Completed' ? "#d1fae5" : "#f1f5f9", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                  <ClockCircleOutlined />
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{topic.endDate}</div>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>
                                    {topic.status === 'Completed' ? 'COMPLETED' : 'EST. END'}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Estimated Days */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap" }}>
                              <div style={{ color: "#3b82f6", background: "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                <ClockCircleOutlined />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{topic.estimatedDays || chapter.days} Days</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>ESTIMATED</div>
                              </div>
                            </div>

                            {/* Actual Days Taken (Always show for alignment) */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: topic.actualDays ? "1px solid #ffedd5" : "1px solid #cbd5e1", borderRadius: 8, padding: "6px 12px", background: "#fff", whiteSpace: "nowrap", minWidth: 120 }}>
                              <div style={{ color: topic.actualDays ? "#f59e0b" : "#94a3b8", background: topic.actualDays ? "#fef3c7" : "#f1f5f9", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                <ClockCircleOutlined />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: topic.actualDays ? "#1e293b" : "#64748b", lineHeight: 1.2 }}>
                                  {topic.actualDays ? `${topic.actualDays} Days` : "In Progress"}
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>
                                  {topic.actualDays ? "TAKEN" : "STATUS"}
                                </div>
                              </div>
                            </div>

                            {/* Status Tag */}
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid", borderColor: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#bbf7d0" : "#fca5a5") : "#bfdbfe", borderRadius: 8, padding: "6px 12px", background: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#f0fdf4" : "#fef2f2") : "#fff", width: 150 }}>
                              <div style={{ color: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#3b82f6", background: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#dcfce7" : "#fee2e2") : "#eff6ff", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                {topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? <CheckCircleOutlined /> : <WarningOutlined />) : <ClockCircleOutlined />}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#1d4ed8", lineHeight: 1.2 }}>{topic.status}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: topic.status === 'Completed' ? (topic.onTimeStatus === 'ON TIME' ? "#166534" : "#b91c1c") : "#1d4ed8", textTransform: "uppercase", marginTop: 2 }}>STATUS</div>
                              </div>
                            </div>
                          </div>

                          {/* Reason Banner if present */}
                          {(topic.onTimeStatus === 'DELAYED' || topic.onTimeStatus === 'EARLY') && topic.reason && (
                            <div style={{ background: topic.onTimeStatus === 'DELAYED' ? '#fef2f2' : '#f0fdf4', color: topic.onTimeStatus === 'DELAYED' ? '#b91c1c' : '#166534', padding: "8px 16px", fontSize: "12px", borderTop: topic.onTimeStatus === 'DELAYED' ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
                              <InfoCircleOutlined style={{ marginRight: 6 }} />
                              <strong>Remark: </strong>{topic.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
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
        width={1100}
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
              <Row gutter={0} style={{ flex: 1, minHeight: 0 }}>
                {/* Left Side: Entry Form */}
                <Col span={14} className="syllabus-planner__curriculum-entry-side">
                  <div className="syllabus-planner__side-header">
                    <Title level={5} style={{ margin: 0 }}>Add Chapter Details</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Enter chapter name, duration, and its sub-topics</Text>
                  </div>

                  <div className="syllabus-planner__entry-content">
                    <Form.List name="chapters">
                      {(fields, { add, remove }) => {
                        // We only show the LAST added chapter in the entry form
                        const currentFieldIndex = fields.length - 1;
                        const field = fields[currentFieldIndex];

                        if (!field) return null;

                        return (
                          <div key={field.key} className="syllabus-planner__active-chapter-form">
                            <Card className="syllabus-planner__entry-card">
                              <Row gutter={16}>
                                <Col span={16}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "name"]}
                                    label="CHAPTER NAME"
                                    rules={[{ required: true, message: "Please enter chapter name" }]}
                                    className="syllabus-planner__form-label-upper"
                                  >
                                    <Input placeholder="E.g. Real Numbers" size="large" />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "duration"]}
                                    label="DURATION (DAYS)"
                                    rules={[{ required: true, message: "Required" }]}
                                    className="syllabus-planner__form-label-upper"
                                  >
                                    <InputNumber min={1} style={{ width: "100%" }} size="large" />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <div className="syllabus-planner__topics-section">
                                <Form.List name={[field.name, "topics"]}>
                                  {(topicFields, { add: addTopic, remove: removeTopic }) => (
                                    <>
                                      {topicFields.map((topicField, index) => (
                                        <div key={topicField.key} className="syllabus-planner__topic-entry-row">
                                          <div className="syllabus-planner__topic-index-badge">{index + 1}</div>
                                          <Form.Item
                                            {...topicField}
                                            name={[topicField.name, "name"]}
                                            className="syllabus-planner__topic-name-item"
                                            rules={[{ required: true, message: "Enter topic name" }]}
                                          >
                                            <Input placeholder="Topic Name (e.g. Euclid’s Lemma)" />
                                          </Form.Item>
                                          <Form.Item
                                            {...topicField}
                                            name={[topicField.name, "duration"]}
                                            className="syllabus-planner__topic-duration-item"
                                            rules={[{ required: true, message: "Days" }]}
                                          >
                                            <InputNumber min={1} placeholder="Days" style={{ width: 80 }} />
                                          </Form.Item>
                                          <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeTopic(topicField.name)}
                                          />
                                        </div>
                                      ))}
                                      <Button
                                        type="dashed"
                                        onClick={() => addTopic({ name: "", duration: 1 })}
                                        block
                                        icon={<PlusOutlined />}
                                        className="syllabus-planner__add-topic-btn"
                                      >
                                        Add Sub-topic
                                      </Button>
                                    </>
                                  )}
                                </Form.List>
                              </div>
                            </Card>
                          </div>
                        );
                      }}
                    </Form.List>
                  </div>

                  {/* Sticky Footer for Entry Side */}
                  <div className="syllabus-planner__entry-sub-footer">
                    <Form.List name="chapters">
                      {(fields, { add }) => (
                        <Button
                          type="primary"
                          ghost
                          onClick={async () => {
                            const currentFieldIndex = fields.length - 1;
                            try {
                              await planForm.validateFields([
                                ['chapters', currentFieldIndex, 'name'],
                                ['chapters', currentFieldIndex, 'duration']
                              ]);
                              add({ name: "", duration: 1, topics: [] });
                            } catch (e) {
                              // Validation errors handled by antd
                            }
                          }}
                          block
                          className="syllabus-planner__add-chapter-to-summary-btn"
                          icon={<PlusOutlined />}
                        >
                          Add Chapter to Syllabus
                        </Button>
                      )}
                    </Form.List>
                  </div>
                </Col>

                {/* Right Side: Syllabus Summary */}
                <Col span={10} className="syllabus-planner__curriculum-summary-side">
                  <div className="syllabus-planner__side-header">
                    <Title level={5} style={{ margin: 0 }}>Syllabus Summary</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Overview of chapters added so far</Text>
                  </div>

                  <div className="syllabus-planner__summary-content">
                    <Form.List name="chapters">
                      {(fields, { remove }) => {
                        // Show all chapters EXCEPT the last one in the summary
                        const summaryFields = fields.slice(0, -1);

                        if (summaryFields.length === 0) {
                          return (
                            <div className="syllabus-planner__empty-summary">
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No chapters added to summary yet."
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="syllabus-planner__summary-list">
                            {summaryFields.map((field, index) => {
                              const chapterData = planForm.getFieldValue(['chapters', field.name]);
                              return (
                                <Card key={field.key} size="small" className="syllabus-planner__summary-item-card">
                                  <div className="syllabus-planner__summary-item-header">
                                    <div className="syllabus-planner__summary-item-title">
                                      <Text strong>{index + 1}. {chapterData?.name || "Untitled Chapter"}</Text>
                                      <Tag color="blue" size="small">{chapterData?.duration || 0} Days</Tag>
                                    </div>
                                    <Button
                                      type="text"
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() => remove(field.name)}
                                    />
                                  </div>
                                  <div className="syllabus-planner__summary-item-topics">
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {(chapterData?.topics || []).length} topics included
                                    </Text>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        );
                      }}
                    </Form.List>
                  </div>
                </Col>
              </Row>

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



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import LotusNavbar from "../components/LotusNavbar";

function AdminDashboard() {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [applicationsError, setApplicationsError] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [customersError, setCustomersError] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [formFields, setFormFields] = useState(() => {
        const savedFields = localStorage.getItem("lotusLoanFormFields");
        return savedFields ? JSON.parse(savedFields) : [
            { id: "income", label: "Monthly income", type: "text" },
            { id: "employmentStatus", label: "Employment status", type: "text" },
            { id: "loanAmount", label: "Loan amount requested", type: "text" },
            { id: "loanPurpose", label: "Loan purpose", type: "text" },
            { id: "creditScore", label: "Credit score", type: "text" },
            { id: "existingDebts", label: "Existing debts", type: "text" },
        ];
    });
    const [footerContent, setFooterContent] = useState(() => {
        const savedContent = localStorage.getItem("lotusFooterContent");
        return savedContent ? JSON.parse(savedContent) : {
            branches: ["Colombo", "Kandy", "Galle", "Kurunegala"],
            hours: ["Monday - Friday: 8:30 AM - 4:30 PM", "Saturday: 9:00 AM - 1:00 PM", "Sunday: Closed", "Public Holidays: Closed"],
            support: ["Email: lotusfinance@gmail.com", "Customer Service: 011 234 5678"],
        };
    });
    const [editingFooterItem, setEditingFooterItem] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const showingCustomers = queryParams.get("view") === "customers";
    const selectedCustomerId = queryParams.get("customerId");

    useEffect(() => {
        localStorage.setItem("lotusLoanFormFields", JSON.stringify(formFields));
    }, [formFields]);

    useEffect(() => {
        localStorage.setItem("lotusFooterContent", JSON.stringify(footerContent));
        window.dispatchEvent(new Event("lotusFooterUpdated"));
    }, [footerContent]);

    const token = localStorage.getItem("lotusToken");

    useEffect(() => {
        const loadSummary = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(`${API_BASE_URL}/api/users/admin/dashboard-summary`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSummary(response.data.summary);
            } catch (summaryError) {
                setError(summaryError.response?.data?.message || "Unable to load admin dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE_URL]);


    const loadApplications = async () => {
        try {
            setLoadingApplications(true);
            setApplicationsError("");

            const response = await axios.get(`${API_BASE_URL}/api/loans/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setApplications(response.data.applications || []);
        } catch (applicationsFetchError) {
            setApplicationsError(
                applicationsFetchError.response?.data?.message ||
                "Unable to load loan applications."
            );
        } finally {
            setLoadingApplications(false);
        }
    };

    useEffect(() => {
        loadApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE_URL]);

    useEffect(() => {
        if (!showingCustomers) return;

        const loadCustomers = async () => {
            try {
                setLoadingCustomers(true);
                setCustomersError("");

                const response = await axios.get(`${API_BASE_URL}/api/users/admin/customers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setCustomers(response.data.customers || []);
            } catch (customersFetchError) {
                setCustomersError(
                    customersFetchError.response?.data?.message ||
                    "Unable to load customers."
                );
            } finally {
                setLoadingCustomers(false);
            }
        };

        loadCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE_URL, showingCustomers]);


    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            setUpdatingId(applicationId);

            await axios.put(
                `${API_BASE_URL}/api/loans/${applicationId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplications((current) =>
                current.map((app) =>
                    app._id === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (updateError) {
            alert(
                updateError.response?.data?.message ||
                "Unable to update the application status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const startEditing = (app) => {
        setEditingId(app._id);
        setEditForm({
            income: app.income,
            employmentStatus: app.employmentStatus,
            loanAmount: app.loanAmount,
            loanPurpose: app.loanPurpose,
            creditScore: app.creditScore,
            existingDebts: app.existingDebts,
        });
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    };

    const saveEdit = async (applicationId) => {
        try {
            setUpdatingId(applicationId);
            const response = await axios.put(`${API_BASE_URL}/api/loans/${applicationId}`, editForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setApplications((current) => current.map((app) => app._id === applicationId ? response.data.application : app));
            setEditingId(null);
        } catch (editError) {
            alert(editError.response?.data?.message || "Unable to update the application.");
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteApplication = async (applicationId) => {
        if (!window.confirm("Delete this loan application?")) return;

        try {
            setUpdatingId(applicationId);
            await axios.delete(`${API_BASE_URL}/api/loans/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setApplications((current) => current.filter((app) => app._id !== applicationId));
        } catch (deleteError) {
            alert(deleteError.response?.data?.message || "Unable to delete the application.");
        } finally {
            setUpdatingId(null);
        }
    };

    const updateFormField = (fieldId, key, value) => {
        setFormFields((current) => current.map((field) => (
            field.id === fieldId ? { ...field, [key]: value } : field
        )));
    };

    const addFormField = () => {
        const id = `custom_${Date.now()}`;
        setFormFields((current) => [...current, { id, label: "New field", type: "text" }]);
    };

    const deleteFormField = (fieldId) => {
        setFormFields((current) => current.filter((field) => field.id !== fieldId));
    };

    const updateFooterItem = (section, index, value) => {
        setFooterContent((current) => ({
            ...current,
            [section]: current[section].map((item, itemIndex) => itemIndex === index ? value : item),
        }));
    };

    const addFooterItem = (section) => {
        setFooterContent((current) => ({
            ...current,
            [section]: [...current[section], "New footer detail"],
        }));
        setEditingFooterItem(`${section}-${footerContent[section].length}`);
    };

    const deleteFooterItem = (section, index) => {
        setFooterContent((current) => ({
            ...current,
            [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
        }));
        setEditingFooterItem(null);
    };


    const riskChipStyle = (riskLevel) => {
        if (riskLevel === "Low") {
            return { background: "rgba(15, 118, 110, 0.12)", color: "#0f766e" };
        }
        if (riskLevel === "Medium") {
            return { background: "rgba(212, 160, 23, 0.14)", color: "#9a6700" };
        }
        if (riskLevel === "High") {
            return { background: "rgba(236, 72, 153, 0.14)", color: "#be185d" };
        }
        return { background: "rgba(100, 116, 139, 0.12)", color: "#475569" };
    };

    const statusChipStyle = (status) => {
        if (status === "Approved") {
            return { background: "rgba(15, 118, 110, 0.12)", color: "#0f766e" };
        }
        if (status === "Rejected") {
            return { background: "rgba(236, 72, 153, 0.14)", color: "#be185d" };
        }
        return { background: "rgba(212, 160, 23, 0.14)", color: "#9a6700" }; // Pending
    };


    const filteredApplications =
        statusFilter === "All"
            ? applications
            : applications.filter((app) => app.status === statusFilter);

    const filteredCustomers = customers.filter((customer) => {
        const searchText = customerSearch.trim().toLowerCase();
        if (!searchText) return true;

        return [
            customer.name,
            customer.email,
            customer.phoneNumber,
            customer.nationalId,
            customer.province,
            customer.district,
        ].some((value) => String(value || "").toLowerCase().includes(searchText));
    });

    const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);


    return (
        <div className="lotus-shell">
            <style>{`
                .risk-chip, .status-chip {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 0.82rem;
                    font-weight: 700;
                }

                .application-card {
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(15, 118, 110, 0.12);
                    border-radius: 24px;
                    padding: 20px 24px;
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                }

                .application-card + .application-card {
                    margin-top: 16px;
                }

                .application-card__top {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    align-items: center;
                }

                .application-card__chips {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .application-card__meta {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-top: 4px;
                }

                .application-card__explanation {
                    margin-top: 12px;
                    color: #334155;
                    line-height: 1.6;
                    font-size: 0.94rem;
                }

                .application-card__actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 16px;
                    flex-wrap: wrap;
                }

                .filter-bar {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 18px;
                }

                .filter-chip {
                    padding: 8px 16px;
                    border-radius: 999px;
                    border: 1px solid rgba(15, 118, 110, 0.14);
                    background: rgba(255, 255, 255, 0.8);
                    color: #334155;
                    font-weight: 600;
                    cursor: pointer;
                }

                .filter-chip--active {
                    background: linear-gradient(135deg, #0f766e, #115e59);
                    color: white;
                    border-color: transparent;
                }

                .form-fields-editor {
                    display: grid;
                    gap: 10px;
                    max-width: 900px;
                    padding: 18px;
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(15, 118, 110, 0.14);
                    border-radius: 18px;
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                }

                .form-field-editor-row {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 120px auto;
                    align-items: center;
                    gap: 12px;
                }

                .form-field-editor-row input {
                    min-width: 0;
                    padding: 10px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 0.92rem;
                }

                .form-field-type {
                    color: #64748b;
                    font-size: 0.82rem;
                    font-weight: 700;
                }

                @media (max-width: 640px) {
                    .form-field-editor-row {
                        grid-template-columns: 1fr;
                    }
                }

                .admin-edit-form {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #fdf2f8;
                    border: 1px solid rgba(236, 72, 153, 0.18);
                    border-radius: 14px;
                }

                .admin-edit-form label {
                    display: grid;
                    gap: 6px;
                    color: #475569;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                .admin-edit-form input,
                .admin-edit-form select {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 9px 10px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    background: white;
                    color: #1e293b;
                }

                .admin-edit-form .application-card__actions {
                    grid-column: 1 / -1;
                    margin-top: 0;
                }

                .customer-table-wrap {
                    overflow-x: auto;
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(15, 118, 110, 0.14);
                    border-radius: 18px;
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                }

                .customer-table {
                    width: 100%;
                    min-width: 1400px;
                    border-collapse: collapse;
                    color: #334155;
                    font-size: 0.86rem;
                }

                .customer-table th,
                .customer-table td {
                    padding: 13px 14px;
                    border-bottom: 1px solid #e2e8f0;
                    text-align: left;
                    vertical-align: top;
                    white-space: nowrap;
                }

                .customer-table th {
                    background: #f8fafc;
                    color: #475569;
                    font-size: 0.76rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .customer-table tbody tr:last-child td {
                    border-bottom: 0;
                }

                .customer-search {
                    width: 100%;
                    max-width: 520px;
                    box-sizing: border-box;
                    padding: 12px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    background: white;
                    color: #1e293b;
                    font-size: 0.94rem;
                    margin-bottom: 18px;
                }

                .customer-details {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 14px;
                    margin-bottom: 20px;
                    padding: 18px;
                    background: #f0fdfa;
                    border: 1px solid rgba(15, 118, 110, 0.18);
                    border-radius: 16px;
                }

                .customer-details h2 {
                    grid-column: 1 / -1;
                    margin: 0;
                    color: #115e59;
                    font-size: 1.15rem;
                }

                .customer-details div {
                    display: grid;
                    gap: 4px;
                }

                .customer-details span {
                    color: #64748b;
                    font-size: 0.76rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .customer-details strong {
                    color: #1e293b;
                    overflow-wrap: anywhere;
                }

                .customer-link {
                    color: #0f766e;
                    font-weight: 700;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }

                @media (max-width: 760px) {
                    .customer-details {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 640px) {
                    .customer-details {
                        grid-template-columns: 1fr;
                    }

                    .admin-edit-form {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <LotusNavbar />

            {showingCustomers ? (
                <section className="page-section">
                    <div className="page-header">
                        <div className="ai-chip">Customer register</div>
                        <h1>All customers</h1>
                        <p>Review the registration details submitted by customer accounts.</p>
                    </div>

                    <input
                        className="customer-search"
                        type="search"
                        value={customerSearch}
                        onChange={(event) => setCustomerSearch(event.target.value)}
                        placeholder="Search by name, email, phone, ID, province, or district"
                        aria-label="Search customers"
                    />

                    {selectedCustomer && (
                        <div className="customer-details">
                            <h2>{selectedCustomer.name || "Customer details"}</h2>
                            <div><span>Email</span><strong>{selectedCustomer.email || "Not provided"}</strong></div>
                            <div><span>Phone</span><strong>{selectedCustomer.phoneNumber || "Not provided"}</strong></div>
                            <div><span>National ID</span><strong>{selectedCustomer.nationalId || "Not provided"}</strong></div>
                            <div><span>Date of birth</span><strong>{selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString() : "Not provided"}</strong></div>
                            <div><span>Gender</span><strong>{selectedCustomer.gender || "Not provided"}</strong></div>
                            <div><span>Province</span><strong>{selectedCustomer.province || "Not provided"}</strong></div>
                            <div><span>District</span><strong>{selectedCustomer.district || "Not provided"}</strong></div>
                            <div><span>Address</span><strong>{selectedCustomer.address || "Not provided"}</strong></div>
                            <div><span>Employment</span><strong>{selectedCustomer.employmentStatus || "Not provided"}</strong></div>
                            <div><span>Monthly income</span><strong>{selectedCustomer.monthlyIncome ? `LKR ${Number(selectedCustomer.monthlyIncome).toLocaleString()}` : "Not provided"}</strong></div>
                            <div><span>Account status</span><strong>{selectedCustomer.accountStatus || "Verified"}</strong></div>
                        </div>
                    )}

                    {loadingCustomers && <p>Loading customers...</p>}
                    {!loadingCustomers && customersError && <div className="form-error">{customersError}</div>}
                    {!loadingCustomers && !customersError && customers.length === 0 && <p>No customers registered yet.</p>}
                    {!loadingCustomers && !customersError && filteredCustomers.length === 0 && customers.length > 0 && <p>No customers match your search.</p>}
                    {!loadingCustomers && !customersError && filteredCustomers.length > 0 && (
                        <div className="customer-table-wrap">
                            <table className="customer-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>National ID</th>
                                        <th>Date of birth</th>
                                        <th>Gender</th>
                                        <th>Province</th>
                                        <th>District</th>
                                        <th>Address</th>
                                        <th>Employment</th>
                                        <th>Monthly income</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer._id}>
                                            <td>
                                                <Link className="customer-link" to={`/admin-dashboard?view=customers&customerId=${customer._id}`}>
                                                    {customer.name || "Not provided"}
                                                </Link>
                                            </td>
                                            <td>{customer.email || "Not provided"}</td>
                                            <td>{customer.phoneNumber || "Not provided"}</td>
                                            <td>{customer.nationalId || "Not provided"}</td>
                                            <td>{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : "Not provided"}</td>
                                            <td>{customer.gender || "Not provided"}</td>
                                            <td>{customer.province || "Not provided"}</td>
                                            <td>{customer.district || "Not provided"}</td>
                                            <td>{customer.address || "Not provided"}</td>
                                            <td>{customer.employmentStatus || "Not provided"}</td>
                                            <td>{customer.monthlyIncome ? `LKR ${Number(customer.monthlyIncome).toLocaleString()}` : "Not provided"}</td>
                                            <td><span className="status-chip" style={statusChipStyle(customer.accountStatus)}>{customer.accountStatus || "Verified"}</span></td>
                                            <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Not provided"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ) : (
                <>

            <section className="page-section">
                <div className="page-header">
                    <h1>Lotus Finance Admin Panel</h1>
                    <p>Manage customer loan applications and platform settings.</p>
                </div>

                <div className="page-header">
                    <div className="ai-chip">Form builder</div>
                    <h1>Loan application fields</h1>
                    <p>Edit field labels, add new text fields, or remove fields from the admin configuration.</p>
                </div>

                <div className="form-fields-editor">
                    {formFields.map((field) => (
                        <div className="form-field-editor-row" key={field.id}>
                            <input
                                value={field.label}
                                onChange={(event) => updateFormField(field.id, "label", event.target.value)}
                                aria-label={`Edit ${field.label} field label`}
                            />
                            <span className="form-field-type">Text field</span>
                            <button type="button" className="pink-pill" onClick={() => deleteFormField(field.id)}>
                                Delete field
                            </button>
                        </div>
                    ))}
                    <button type="button" className="emerald-pill" onClick={addFormField}>
                        Add text field
                    </button>
                </div>

                <div className="page-header">
                    <div className="ai-chip">Footer builder</div>
                    <h1>Footer details</h1>
                    <p>Edit the branch, opening-hours, and support details shown in the footer.</p>
                </div>

                <div className="form-fields-editor">
                    {Object.entries(footerContent).map(([section, items]) => (
                        <div key={section}>
                            <strong className="form-field-type">{section}</strong>
                            {items.map((item, index) => {
                                const itemKey = `${section}-${index}`;
                                const isEditing = editingFooterItem === itemKey;

                                return (
                                    <div className="form-field-editor-row" key={itemKey}>
                                        <input
                                            value={item}
                                            disabled={!isEditing}
                                            onChange={(event) => updateFooterItem(section, index, event.target.value)}
                                            aria-label={`Edit ${section} footer item ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className="secondary-pill"
                                            onClick={() => setEditingFooterItem(isEditing ? null : itemKey)}
                                        >
                                            {isEditing ? "Save" : "Edit"}
                                        </button>
                                        <button
                                            type="button"
                                            className="pink-pill"
                                            onClick={() => deleteFooterItem(section, index)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                            <button type="button" className="emerald-pill" onClick={() => addFooterItem(section)}>
                                Add {section} detail
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="page-section">

                {loading && <p>Loading dashboard summary...</p>}

                {!loading && error && <div className="form-error">{error}</div>}

                {!loading && !error && summary ? (
                    <div className="admin-summary-grid">
                        <div className="strip-card">
                            <div className="ai-chip">Total Users</div>
                            <h3>{summary.totalUsers}</h3>
                            <p>All registered accounts across the platform.</p>
                        </div>

                        <div className="strip-card">
                            <div className="ai-chip">Customers</div>
                            <h3>{summary.totalCustomers}</h3>
                            <p>Customer accounts currently in the system.</p>
                        </div>

                        <div className="strip-card">
                            <div className="ai-chip">Loan Officers</div>
                            <h3>{summary.totalLoanOfficers}</h3>
                            <p>Loan officer accounts available for review tasks.</p>
                        </div>

                        <div className="strip-card">
                            <div className="ai-chip">Admin Email</div>
                            <h3>{summary.adminEmail}</h3>
                            <p>Default finance admin account configured at startup.</p>
                        </div>
                    </div>
                ) : null}
            </section>


            <section className="page-section">
                <div className="page-header">
                    <h1>Loan Applications</h1>
                    <p>
                        Review each application's AI eligibility prediction, risk level, and
                        recommendation, then approve, reject, or leave it pending. The AI
                        result is a recommendation only — the final decision is yours.
                    </p>
                </div>

                <div className="filter-bar">
                    {["All", "Pending", "Approved", "Rejected"].map((status) => (
                        <button
                            key={status}
                            type="button"
                            className={
                                "filter-chip" +
                                (statusFilter === status ? " filter-chip--active" : "")
                            }
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loadingApplications && <p>Loading applications...</p>}

                {!loadingApplications && applicationsError && (
                    <div className="form-error">{applicationsError}</div>
                )}

                {!loadingApplications && !applicationsError && filteredApplications.length === 0 && (
                    <p>No applications match this filter.</p>
                )}

                {!loadingApplications && !applicationsError && filteredApplications.length > 0 && (
                    <div>
                        {filteredApplications.map((app) => (
                            <div className="application-card" key={app._id}>
                                {editingId === app._id ? (
                                    <form className="admin-edit-form" onSubmit={(event) => { event.preventDefault(); saveEdit(app._id); }}>
                                        {[
                                            ["income", "Income"],
                                            ["loanAmount", "Loan amount"],
                                            ["creditScore", "Credit score"],
                                            ["existingDebts", "Existing debts"],
                                        ].map(([name, label]) => (
                                            <label key={name}>
                                                {label}
                                                <input name={name} type="number" value={editForm[name] ?? ""} onChange={handleEditChange} required />
                                            </label>
                                        ))}
                                        <label>
                                            Employment status
                                            <select name="employmentStatus" value={editForm.employmentStatus || ""} onChange={handleEditChange} required>
                                                <option value="Employed">Employed</option>
                                                <option value="Self-Employed">Self-Employed</option>
                                                <option value="Unemployed">Unemployed</option>
                                            </select>
                                        </label>
                                        <label>
                                            Loan purpose
                                            <input name="loanPurpose" value={editForm.loanPurpose || ""} onChange={handleEditChange} required />
                                        </label>
                                        <div className="application-card__actions">
                                            <button type="submit" className="emerald-pill" disabled={updatingId === app._id}>Save changes</button>
                                            <button type="button" className="secondary-pill" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </form>
                                ) : null}

                                <div className="application-card__top">
                                    <div>
                                        <strong>
                                            {app.userId?._id ? (
                                                <Link className="customer-link" to={`/admin-dashboard?view=customers&customerId=${app.userId._id}`}>
                                                    {app.userId.name || "Unknown customer"}
                                                </Link>
                                            ) : "Unknown customer"}
                                            {" "}
                                            ({app.userId?.email || "no email"})
                                        </strong>
                                        <div className="application-card__meta">
                                            {app.loanPurpose} — LKR {Number(app.loanAmount).toLocaleString()}
                                            {" · "}
                                            Submitted {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="application-card__meta">
                                            Income: LKR {Number(app.income).toLocaleString()}
                                            {" · "}
                                            Credit score: {app.creditScore}
                                            {" · "}
                                            Existing debts: LKR {Number(app.existingDebts).toLocaleString()}
                                            {" · "}
                                            Employment: {app.employmentStatus}
                                        </div>
                                    </div>

                                    <div className="application-card__chips">
                                        <span className="status-chip" style={statusChipStyle(app.status)}>
                                            {app.status}
                                        </span>

                                        {app.aiRiskLevel && (
                                            <span className="risk-chip" style={riskChipStyle(app.aiRiskLevel)}>
                                                {app.aiRiskLevel} Risk
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {app.aiEligibility ? (
                                    <>
                                        <div className="application-card__meta">
                                            AI Eligibility: <strong>{app.aiEligibility}</strong>
                                            {" "}({app.aiConfidence}% confidence) — Recommendation:{" "}
                                            <strong>{app.aiRecommendation}</strong>
                                        </div>
                                        <p className="application-card__explanation">
                                            {app.aiExplanation}
                                        </p>
                                    </>
                                ) : (
                                    <div className="application-card__meta">
                                        AI evaluation not available for this application.
                                    </div>
                                )}

                                <div className="application-card__actions">
                                    <button
                                        type="button"
                                        className="emerald-pill"
                                        disabled={updatingId === app._id || app.status === "Approved"}
                                        onClick={() => handleStatusUpdate(app._id, "Approved")}
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        className="pink-pill"
                                        disabled={updatingId === app._id || app.status === "Rejected"}
                                        onClick={() => handleStatusUpdate(app._id, "Rejected")}
                                    >
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-pill"
                                        disabled={updatingId === app._id || app.status === "Pending"}
                                        onClick={() => handleStatusUpdate(app._id, "Pending")}
                                    >
                                        Mark Pending
                                    </button>

                                    <button type="button" className="secondary-pill" onClick={() => startEditing(app)} disabled={updatingId === app._id}>
                                        Edit fields
                                    </button>

                                    <button type="button" className="pink-pill" onClick={() => deleteApplication(app._id)} disabled={updatingId === app._id}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
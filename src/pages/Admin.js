import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllFeedback, updateFeedbackStatus, deleteFeedback } from '../services/firebase';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Admin email - change this to your email
  const ADMIN_EMAIL = 'omsanjay975@gmail.com';

  useEffect(() => {
    // Check if user is admin
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/', { replace: true });
      return;
    }

    loadFeedback();
  }, [user, navigate]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { feedback: feedbackData, error } = await getAllFeedback();
      if (error) {
        console.error('Error loading feedback:', error);
      } else {
        setFeedback(feedbackData);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const { error } = await updateFeedbackStatus(feedbackId, newStatus);
      if (!error) {
        setFeedback(prev => 
          prev.map(item => 
            item.id === feedbackId 
              ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const { error } = await deleteFeedback(feedbackId);
        if (!error) {
          setFeedback(prev => prev.filter(item => item.id !== feedbackId));
          setSelectedFeedback(null);
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const getFilteredFeedback = () => {
    let filtered = feedback;

    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }

    // Sort feedback
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, normal: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getTypeIcon = (type) => {
    const icons = {
      general: '💬',
      bug: '🐛',
      feature: '💡',
      feedback: '⭐',
      support: '🛠️'
    };
    return icons[type] || '💬';
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#e50914',
      read: '#ff9800',
      resolved: '#4caf50'
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#e53935',
      medium: '#ff9800',
      normal: '#4caf50'
    };
    return colors[priority] || '#666';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredFeedback = getFilteredFeedback();

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage user feedback and support requests</p>
          
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-number">{feedback.length}</span>
              <span className="stat-label">Total Feedback</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{feedback.filter(f => f.status === 'new').length}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{feedback.filter(f => f.status === 'read').length}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{feedback.filter(f => f.status === 'resolved').length}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>

        <div className="admin-controls">
          <div className="filter-controls">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-select"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="type">Sort by Type</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          <button 
            onClick={loadFeedback}
            className="refresh-btn"
          >
            <svg viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>

        <div className="admin-content">
          <div className="feedback-list">
            <h2>Feedback ({filteredFeedback.length})</h2>
            
            {filteredFeedback.length === 0 ? (
              <div className="empty-state">
                <p>No feedback found for the selected filter.</p>
              </div>
            ) : (
              <div className="feedback-items">
                {filteredFeedback.map(item => (
                  <div 
                    key={item.id} 
                    className={`feedback-item ${selectedFeedback?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className="feedback-header">
                      <div className="feedback-info">
                        <span className="feedback-type-icon">{getTypeIcon(item.type)}</span>
                        <div className="feedback-meta">
                          <h3>{item.subject}</h3>
                          <p>{item.name} • {item.email}</p>
                        </div>
                      </div>
                      
                      <div className="feedback-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {item.status}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(item.priority) }}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="feedback-preview">
                      <p>{item.message.substring(0, 100)}...</p>
                      <span className="feedback-date">{formatDate(item.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFeedback && (
            <div className="feedback-detail">
              <div className="detail-header">
                <h2>Feedback Details</h2>
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="close-detail-btn"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-meta">
                  <div className="meta-row">
                    <span className="meta-label">Type:</span>
                    <span className="meta-value">
                      {getTypeIcon(selectedFeedback.type)} {selectedFeedback.type}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Priority:</span>
                    <span 
                      className="meta-value priority"
                      style={{ color: getPriorityColor(selectedFeedback.priority) }}
                    >
                      {selectedFeedback.priority}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Status:</span>
                    <span 
                      className="meta-value status"
                      style={{ color: getStatusColor(selectedFeedback.status) }}
                    >
                      {selectedFeedback.status}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Submitted:</span>
                    <span className="meta-value">{formatDate(selectedFeedback.submittedAt)}</span>
                  </div>
                </div>

                <div className="detail-info">
                  <h3>Contact Information</h3>
                  <p><strong>Name:</strong> {selectedFeedback.name}</p>
                  <p><strong>Email:</strong> {selectedFeedback.email}</p>
                </div>

                <div className="detail-subject">
                  <h3>Subject</h3>
                  <p>{selectedFeedback.subject}</p>
                </div>

                <div className="detail-message">
                  <h3>Message</h3>
                  <p>{selectedFeedback.message}</p>
                </div>

                <div className="detail-actions">
                  <div className="status-actions">
                    <label>Update Status:</label>
                    <div className="status-buttons">
                      <button 
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'new')}
                        className={`status-btn ${selectedFeedback.status === 'new' ? 'active' : ''}`}
                      >
                        New
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'read')}
                        className={`status-btn ${selectedFeedback.status === 'read' ? 'active' : ''}`}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                        className={`status-btn ${selectedFeedback.status === 'resolved' ? 'active' : ''}`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>

                  <div className="management-actions">
                    <a 
                      href={`mailto:${selectedFeedback.email}?subject=Re: ${selectedFeedback.subject}`}
                      className="reply-btn"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      Reply via Email
                    </a>
                    
                    <button 
                      onClick={() => handleDelete(selectedFeedback.id)}
                      className="delete-btn"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

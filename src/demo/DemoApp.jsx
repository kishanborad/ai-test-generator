import { createRoot } from 'react-dom/client';
import { useState, useMemo } from 'react';
import './demo.css';

const tableData = [
  { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active', joined: '2024-01-15' },
  { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active', joined: '2024-03-22' },
  { id: 3, name: 'Carol Davis', role: 'Manager', status: 'On Leave', joined: '2023-07-10' },
  { id: 4, name: 'Dan Wilson', role: 'Engineer', status: 'Active', joined: '2024-06-01' },
  { id: 5, name: 'Eve Brown', role: 'QA Lead', status: 'Inactive', joined: '2023-11-28' },
];

function DemoApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.message.trim()) errors.message = 'Message is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormSubmitted(false);
      return;
    }
    setFormErrors({});
    setFormSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const filteredData = useMemo(() => {
    const lower = search.toLowerCase();
    const filtered = tableData.filter(
      (row) => row.name.toLowerCase().includes(lower) || row.role.toLowerCase().includes(lower)
    );
    return filtered.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortAsc ? cmp : -cmp;
    });
  }, [search, sortCol, sortAsc]);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  return (
    <div>
      {/* Nav */}
      <nav className="demo-nav" data-testid="nav">
        <span className="demo-nav-logo" data-testid="logo">TestApp</span>
        <button className="demo-hamburger" data-testid="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <ul className={`demo-nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#features" data-testid="nav-features">Features</a></li>
          <li><a href="#contact" data-testid="nav-contact">Contact</a></li>
          <li><a href="#team" data-testid="nav-team">Team</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="demo-hero" data-testid="hero">
        <h1 data-testid="hero-title">Build Better Software</h1>
        <p data-testid="hero-subtitle">A demo application for testing AI-generated test cases against real interactive elements.</p>
        <button className="demo-btn" data-testid="cta-button" onClick={() => setModalOpen(true)}>Get Started</button>
      </section>

      {/* Feature Cards */}
      <section id="features" data-testid="features">
        <div className="demo-cards">
          <div className="demo-card" data-testid="card-speed" onClick={() => setModalOpen(true)}>
            <div className="demo-card-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Execute tests in milliseconds with browser-native automation.</p>
          </div>
          <div className="demo-card" data-testid="card-ai">
            <div className="demo-card-icon">🤖</div>
            <h3>AI Powered</h3>
            <p>Generate comprehensive test suites from plain English descriptions.</p>
          </div>
          <div className="demo-card" data-testid="card-export">
            <div className="demo-card-icon">📦</div>
            <h3>Export Anywhere</h3>
            <p>Download tests as Playwright or Cypress code for your CI pipeline.</p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="demo-form-section" data-testid="contact-section">
        <h2>Contact Us</h2>
        <form onSubmit={handleFormSubmit} data-testid="contact-form" noValidate>
          <div className="demo-field">
            <label htmlFor="name">Name</label>
            <input id="name" data-testid="input-name" value={formData.name}
              onChange={(e) => handleField('name', e.target.value)} placeholder="Your name" />
            {formErrors.name && <div className="demo-error" data-testid="error-name">{formErrors.name}</div>}
          </div>
          <div className="demo-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" data-testid="input-email" value={formData.email}
              onChange={(e) => handleField('email', e.target.value)} placeholder="you@example.com" />
            {formErrors.email && <div className="demo-error" data-testid="error-email">{formErrors.email}</div>}
          </div>
          <div className="demo-field">
            <label htmlFor="message">Message</label>
            <textarea id="message" data-testid="input-message" value={formData.message}
              onChange={(e) => handleField('message', e.target.value)} placeholder="How can we help?" />
            {formErrors.message && <div className="demo-error" data-testid="error-message">{formErrors.message}</div>}
          </div>
          <button type="submit" className="demo-btn" data-testid="submit-button">Send Message</button>
          {formSubmitted && <div className="demo-success" data-testid="success-message">Message sent successfully!</div>}
        </form>
      </section>

      {/* Data Table */}
      <section id="team" className="demo-table-section" data-testid="table-section">
        <h2>Team Members</h2>
        <input className="demo-search" data-testid="table-search" placeholder="Search by name or role..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <table className="demo-table" data-testid="team-table">
          <thead>
            <tr>
              <th data-testid="th-name" onClick={() => handleSort('name')}>Name {sortCol === 'name' ? (sortAsc ? '↑' : '↓') : ''}</th>
              <th data-testid="th-role" onClick={() => handleSort('role')}>Role {sortCol === 'role' ? (sortAsc ? '↑' : '↓') : ''}</th>
              <th data-testid="th-status" onClick={() => handleSort('status')}>Status {sortCol === 'status' ? (sortAsc ? '↑' : '↓') : ''}</th>
              <th data-testid="th-joined" onClick={() => handleSort('joined')}>Joined {sortCol === 'joined' ? (sortAsc ? '↑' : '↓') : ''}</th>
            </tr>
          </thead>
          <tbody data-testid="table-body">
            {filteredData.map((row) => (
              <tr key={row.id} data-testid={`row-${row.id}`}>
                <td>{row.name}</td>
                <td>{row.role}</td>
                <td>{row.status}</td>
                <td>{row.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <p data-testid="no-results">No matching team members found.</p>}
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="demo-modal-overlay" data-testid="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="demo-modal" data-testid="modal">
            <button className="demo-modal-close" data-testid="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <h2>Welcome!</h2>
            <p>This is a demo modal triggered by the CTA button. It can be dismissed by clicking the close button or the overlay.</p>
            <button className="demo-btn" data-testid="modal-action" onClick={() => setModalOpen(false)}>Got It</button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('demo-root')).render(<DemoApp />);

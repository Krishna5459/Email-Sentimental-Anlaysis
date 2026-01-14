import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/inbox.css";
import logo from "../assets/logo.png";

/* ===== Decode email from JWT ===== */
const getEmailFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return "";
  try {
    return JSON.parse(atob(token.split(".")[1])).email;
  } catch {
    return "";
  }
};

export default function Inbox() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userEmail = getEmailFromToken();

  const [emails, setEmails] = useState([]);
  const [view, setView] = useState("inbox"); // inbox | sent | compose | email
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  /* ===== Fetch emails ===== */
  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/emails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEmails(data);
    } catch {
      alert("Failed to load emails");
    }
  }, [token]);

  /* ===== Protect route ===== */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEmails();
  }, [token, navigate, fetchEmails]);

  /* ===== Send email ===== */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !body) return alert("Recipient and message required");

    const res = await fetch("http://localhost:5000/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!res.ok) return alert("Failed to send email");

    setTo("");
    setSubject("");
    setBody("");
    setView("sent");
    fetchEmails();
  };

  /* ===== Analyze email ===== */
  const analyzeEmail = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/emails/analyze/${id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (res.ok) {
      setSelectedEmail((prev) => ({ ...prev, ...data }));
      fetchEmails();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const inboxEmails = emails.filter((e) => e.to === userEmail);
  const sentEmails = emails.filter((e) => e.from === userEmail);

  const sentimentIcon = (s) =>
    s === "positive" ? "🟢" : s === "neutral" ? "🟡" : "🔴";

  return (
    <div className="inbox-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="nav-left">
          <img src={logo} alt="ESA" />
          <span>ESA Mail</span>
        </div>

        <div className="nav-center">
          <button onClick={() => setView("inbox")}>Inbox</button>
          <button onClick={() => setView("sent")}>Sent</button>
          <button onClick={() => setView("compose")}>Compose</button>
        </div>

        <div className="nav-right">
          <span>{userEmail}</span>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ===== CONTENT ===== */}
      <div className="content">
        {/* ===== COMPOSE ===== */}
        {view === "compose" && (
          <div className="card compose-card">
            <h2>New Message</h2>

            <form className="compose-form" onSubmit={handleSend}>
              <div className="compose-field">
                <input
                  type="email"
                  placeholder="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <div className="compose-field">
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="compose-field">
                <textarea
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <div className="compose-actions">
                <button type="submit" className="primary">
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== INBOX / SENT ===== */}
        {(view === "inbox" || view === "sent") && (
          <div className="card">
            <h2>{view === "inbox" ? "Inbox" : "Sent"}</h2>

            {(view === "inbox" ? inboxEmails : sentEmails).map((mail) => (
              <div
                key={mail._id}
                className="mail-row"
                onClick={() => {
                  setSelectedEmail(mail);
                  setView("email");
                }}
              >
                <div>
                  <strong>
                    {view === "inbox" ? mail.from : mail.to}
                  </strong>
                  <div className="subject">{mail.subject}</div>
                </div>

                <div className="right-meta">
                  <span className="date">
                    {new Date(mail.createdAt).toLocaleString()}
                  </span>
                  {mail.sentiment && (
                    <span className="sentiment">
                      {sentimentIcon(mail.sentiment)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== EMAIL VIEW ===== */}
        {view === "email" && selectedEmail && (
          <div className="card">
            <button className="back" onClick={() => setView("inbox")}>
              ← Back
            </button>

            <h2>{selectedEmail.subject}</h2>

            <div className="mail-body">
              <p><strong>From:</strong> {selectedEmail.from}</p>
              <p><strong>To:</strong> {selectedEmail.to}</p>
              <p className="date">
                {new Date(selectedEmail.createdAt).toLocaleString()}
              </p>
              <p>{selectedEmail.body}</p>
            </div>

            <div className="actions">
              <button
                className="primary"
                onClick={() => analyzeEmail(selectedEmail._id)}
              >
                Analyze
              </button>

              <button
                className="secondary"
                onClick={() => {
                  setTo(selectedEmail.from);
                  setSubject(`Re: ${selectedEmail.subject}`);
                  setView("compose");
                }}
              >
                Reply
              </button>
            </div>

            {selectedEmail.sentiment && (
              <div className={`analysis ${selectedEmail.sentiment}`}>
                {sentimentIcon(selectedEmail.sentiment)}{" "}
                <strong>{selectedEmail.sentiment.toUpperCase()}</strong>
                <p>{selectedEmail.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

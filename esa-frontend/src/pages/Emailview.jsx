import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/emailView.css";

export default function EmailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [email, setEmail] = useState(null);
  const [reply, setReply] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/emails/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEmail(data));
  }, [id]);

  const analyze = async () => {
    const res = await fetch(
      `http://localhost:5000/api/emails/${id}/analyze`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    setAnalysis(await res.json());
  };

  const sendReply = async () => {
    await fetch("http://localhost:5000/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: email.from,
        subject: `Re: ${email.subject}`,
        body: reply,
      }),
    });
    navigate("/inbox");
  };

  if (!email) return null;

  return (
    <div className="page-bg">
      <div className="thread-card">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <h2>{email.subject}</h2>

        <div className="bubble">
          <strong>From:</strong> {email.from}<br />
          <strong>To:</strong> {email.to}
          <p>{email.body}</p>
        </div>

        <div className="actions">
          <button className="primary" onClick={analyze}>Analyze</button>
          <button className="dark">Reply</button>
        </div>

        {analysis && (
          <div className={`sentiment-box ${analysis.sentiment}`}>
            <strong>
              {analysis.sentiment === "positive" && "🟢 POSITIVE"}
              {analysis.sentiment === "neutral" && "🟡 NEUTRAL"}
              {analysis.sentiment === "negative" && "🔴 NEGATIVE"}
            </strong>
            <p>{analysis.recommendation}</p>
          </div>
        )}

        <textarea
          className="reply-box"
          placeholder="Write your reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button className="primary" onClick={sendReply}>Send Reply</button>
      </div>
    </div>
  );
}

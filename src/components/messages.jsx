import React, { useEffect, useRef, useState } from "react";

const SlackMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:8000/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const palette = ["#6366f1","#10b981","#f43f5e","#f59e0b","#0ea5e9","#a855f7","#14b8a6","#ec4899"];
  const getColor = (name = "") => {
    const i = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
    return palette[i];
  };
  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const isBot = (user = "") => user.toLowerCase().includes("bot");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-root {
          font-family: 'Sora', sans-serif;
          background: #f5f5f0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          background: #ffffff;
          border-bottom: 1px solid #ebebeb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-left { display: flex; align-items: center; gap: 11px; }

        .bot-icon {
          width: 38px; height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 19px;
        }

        .header-name { font-size: 14px; font-weight: 600; color: #111; }

        .header-status {
          font-size: 11px; color: #16a34a;
          display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }

        .sdot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }

        .live-pill {
          display: flex; align-items: center; gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 20px; padding: 5px 12px;
          font-size: 11.5px; color: #16a34a; font-weight: 500;
        }

        .ping {
          width: 6px; height: 6px; border-radius: 50%; background: #16a34a;
          animation: ping 1.8s ease-in-out infinite;
        }
        @keyframes ping {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.3; transform:scale(1.7); }
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 22px 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
        }

        .chat-body::-webkit-scrollbar { width: 4px; }
        .chat-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        .date-sep {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 0 10px;
        }
        .date-line { flex:1; height:1px; background: #e5e5e5; }
        .date-label { font-size: 10.5px; color: #aaa; font-weight: 500; letter-spacing: 0.07em; white-space: nowrap; }

        .bubble-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: fadeUp 0.18s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(5px); }
          to { opacity:1; transform:translateY(0); }
        }

        .bubble-row.is-right { flex-direction: row-reverse; }
        .bubble-row.new-sender { margin-top: 10px; }

        .av {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #111;
          flex-shrink: 0; align-self: flex-end; margin-bottom: 2px;
        }
        .av.bot-av { background: linear-gradient(135deg,#6366f1,#a855f7); font-size: 14px; }
        .av-gap { width: 28px; flex-shrink: 0; }

        .bwrap { display: flex; flex-direction: column; max-width: 66%; }
        .bubble-row.is-right .bwrap { align-items: flex-end; }

        .bsender { font-size: 10.5px; font-weight: 500; color: #aaa; margin-bottom: 3px; padding: 0 3px; }

        .bubble {
          padding: 9px 13px;
          border-radius: 17px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
        }

        .bubble.bot-b {
          background: #fff;
          border: 1px solid #e8e6ff;
          color: #bbb;
          border-bottom-left-radius: 4px;
        }

        .bubble.user-b {
          background: #6366f1;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .bubble.other-b {
          background: #1a1a1a;
          border: 1px solid #e5e5e5;
          color: #c4c4c4;
          border-bottom-left-radius: 4px;
        }

        .btime { font-size: 10px; color: #bbb; margin-top: 3px; padding: 0 3px; }
        .bubble-row.is-right .btime { text-align: right; }

        .center-state {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:10px; color:#333; padding:60px 0;
        }

        .spinner {
          width:24px; height:24px;
          border:2px solid #eee; border-top-color:#6366f1;
          border-radius:50%; animation:spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .error-bar {
          background:#fff5f5;
          border:1px solid #fecaca;
          color:#dc2626; font-size:12.5px;
          padding:9px 14px; border-radius:9px; margin-bottom:10px;
        }

        .chat-footer {
          background: #ffffff;
          border-top: 1px solid #ebebeb;
          padding: 9px 22px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; color: #bbb;
        }
      `}</style>

      <div className="chat-root">
        <header className="chat-header">
          <div className="header-left">
            <div className="bot-icon">🤖</div>
            <div>
              <div className="header-name"># general</div>
              <div className="header-status">
                <span className="sdot" /> Bot active · Slack
              </div>
            </div>
          </div>
          <div className="live-pill">
            <span className="ping" /> Live
          </div>
        </header>

        <div className="chat-body">
          {loading && (
            <div className="center-state">
              <div className="spinner" />
              <span style={{fontSize:13}}>Loading…</span>
            </div>
          )}

          {error && !loading && <div className="error-bar">⚠ {error}</div>}

          {!loading && !error && messages.length === 0 && (
            <div className="center-state">
              <span style={{fontSize:34}}>🤖</span>
              <span style={{fontSize:14,color:"#444"}}>No messages yet</span>
            </div>
          )}

          {!loading && messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const sameSender = prev && prev.user === msg.user;
            const bot = isBot(msg.user);
            const isRight = !bot;

            const msgDate = msg.created_at ? new Date(msg.created_at).toDateString() : null;
            const prevDate = prev?.created_at ? new Date(prev.created_at).toDateString() : null;
            const showDate = msgDate && msgDate !== prevDate;

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="date-sep">
                    <div className="date-line" />
                    <span className="date-label">
                      {new Date(msg.created_at).toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" })}
                    </span>
                    <div className="date-line" />
                  </div>
                )}

                <div className={`bubble-row ${isRight ? "is-right" : ""} ${!sameSender ? "new-sender" : ""}`}>
                  {/* Left avatar */}
                  {!isRight && (
                    !sameSender
                      ? <div className={`av ${bot ? "bot-av" : ""}`} style={!bot ? {background:getColor(msg.user)} : {}}>
                          {bot ? "🤖" : getInitials(msg.user)}
                        </div>
                      : <div className="av-gap" />
                  )}

                  <div className="bwrap">
                    {!sameSender && <span className="bsender">{msg.user}</span>}
                    <div className={`bubble ${bot ? "bot-b" : "user-b"}`}>{msg.text}</div>
                    <span className="btime">{formatTime(msg.created_at)}</span>
                  </div>

                  {/* Right avatar */}
                  {isRight && (
                    !sameSender
                      ? <div className="av" style={{background:getColor(msg.user)}}>{getInitials(msg.user)}</div>
                      : <div className="av-gap" />
                  )}
                </div>
              </React.Fragment>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <footer className="chat-footer">
          <span>⚡ Connected · refreshes every 5s</span>
          <span>{messages.length} msg{messages.length !== 1 ? "s" : ""}</span>
        </footer>
      </div>
    </>
  );
};

export default SlackMessages;
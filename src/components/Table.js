import { useState } from "react";

function MessageCell({ message }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 40;
  const isLong = message.length > maxLength;
    const displayText = expanded || !isLong ? message : message.slice(0, maxLength) + "..."; 
    return (
      <div className={"message-cell" + (expanded ? " expanded" : "")}>
        <p style={{margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',overflowWrap:'anywhere'}}>{displayText}</p>
      {isLong && (
        <span className={expanded ? "see-less" : "see-more"} onClick={() => setExpanded(e => !e)}>
          {expanded ? "  See less" : "  See more"}
        </span>
      )}
    </div>
  );
}

export default function Table({ columns, rows, emptyText = "No data" }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map(c => <th key={c.key || c.accessor}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty">{emptyText}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(c => (
                <td key={c.key || c.accessor}>
                  {c.accessor === "message"
                    ? <MessageCell message={row[c.accessor]} />
                    : c.render ? c.render(row) : row[c.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

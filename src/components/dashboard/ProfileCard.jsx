import { C } from "../../constants/theme";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";

export function ProfileCard({ user, totalStars }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img
          src={user.avatar_url}
          alt=""
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `2px solid ${C.border2}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 15, fontWeight: 700, color: C.text }}>
            {user.name || user.login}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim, marginTop: 3 }}>
            @{user.login}
          </div>
          {user.location && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim, marginTop: 2 }}>
              📍 {user.location}
            </div>
          )}
        </div>
      </Card>

      {[
        { label: "REPOSITORIES", value: user.public_repos, color: C.text },
        { label: "TOTAL STARS",  value: totalStars,         color: C.orange },
        { label: "FOLLOWERS",    value: user.followers,     color: C.accent },
      ].map((s) => (
        <Card key={s.label}>
          <Stat label={s.label} value={s.value} color={s.color} />
        </Card>
      ))}
    </div>
  );
}

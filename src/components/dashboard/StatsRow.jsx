import { C } from "../../constants/theme";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { SectionTitle } from "../ui/index";
import { LangBars, BarChart } from "../charts/index";

export function StatsRow({ langs, originalCount, forkCount, reposByYear }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <Card>
        <SectionTitle>Languages</SectionTitle>
        <LangBars data={langs} />
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ display: "flex", gap: 0 }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <Stat label="ORIGINAL" value={originalCount} color={C.green} />
          </div>
          <div style={{ flex: 1, paddingLeft: 20 }}>
            <Stat label="FORKED" value={forkCount} color={C.dim} />
          </div>
        </Card>

        {reposByYear.length > 1 && (
          <Card style={{ flex: 1 }}>
            <SectionTitle>Repos by year</SectionTitle>
            <BarChart data={reposByYear} />
          </Card>
        )}
      </div>
    </div>
  );
}

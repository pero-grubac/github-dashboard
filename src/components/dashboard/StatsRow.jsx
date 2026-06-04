import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/index";
import { LangBars, BarChart } from "../charts/index";
import { C } from "../../constants/theme";

export function StatsRow({ langs, frameworks, tools, reposByYear }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <Card>
          <SectionTitle>Languages</SectionTitle>
          <LangBars data={langs} unit="%" />
        </Card>

        <Card>
          <SectionTitle>Frameworks</SectionTitle>
          <LangBars data={frameworks ?? []} accentColor={C.accent} />
        </Card>

        <Card>
          <SectionTitle>Tools</SectionTitle>
          <LangBars data={tools ?? []} accentColor={C.accent2} />
        </Card>
      </div>

      {reposByYear.length > 1 && (
        <Card>
          <SectionTitle>Repos by year</SectionTitle>
          <BarChart data={reposByYear} />
        </Card>
      )}
    </div>
  );
}

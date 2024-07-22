import { getProjectDashboard } from "./project-dashboard.server";
import { getProjectsByUserId } from "./project.server";
import { getStudioDashboard } from "./studio-dashboard.server";

export async function getRevenueDashboard(
  userId: string,
  fromDate: string | null,
  toDate: string | null
) {
  const projects = await getProjectsByUserId({ userId });

  const projectDashboards = await Promise.all(
    projects.map(async (p) => {
      const item = await getProjectDashboard({ id: p.id });
      return {
        ...item,
        sorter: item.project.name,
      };
    })
  );

  const studioDashboard = await getStudioDashboard({
    id: process.env.STUDIO_ID ?? "",
  });

  const projectDashboardsSorted = projectDashboards
    .map((p) => p)
    .sort((a, b) => {
      if (a.sorter < b.sorter) return -1;
      if (a.sorter > b.sorter) return 1;
      return 0;
    });

  console.log(JSON.stringify({ fromDate, toDate }), "params");

  return {
    projectDashboards: projectDashboardsSorted,
    studioDashboard,
  };
}

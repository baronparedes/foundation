import type { DetailCategory } from "@prisma/client";

import { prisma } from "../db.server";

export type DetailCategoryWithChildren = DetailCategory & {
  children: DetailCategoryWithChildren[];
};

export async function getDetailCategories() {
  const data = await prisma.detailCategory.findMany();

  const toTreeData = (items: DetailCategory[], id: number | null = null) => {
    const res: DetailCategoryWithChildren[] = items
      .filter((item: DetailCategory) => item["parentId"] === id)
      .map((item) => ({ ...item, children: toTreeData(items, item.id) }));

    return res;
  };

  const result = toTreeData(data);
  return result;
}

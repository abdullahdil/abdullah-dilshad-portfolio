export type ActionResult =
  | { ok: true; message?: string; id?: string; url?: string }
  | { ok: false; error: string };

export type AdminCaseStudyListItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  displayOrder: number;
  updatedAt: string;
  isFeatured: boolean;
};

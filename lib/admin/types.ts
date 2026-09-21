export type ActionResult =
  | {
      ok: true;
      message?: string;
      id?: string;
      url?: string;
      /**
       * What was actually persisted, when the action rewrote its own input —
       * the workflow canvas is stored sanitised, so the editor has to refill
       * from this rather than keep showing the paste.
       */
      source?: string;
    }
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

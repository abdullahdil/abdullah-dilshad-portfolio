"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/admin/actions/profile";
import { arrayToLines } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <FormResult result={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required defaultValue={profile?.full_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="professionalTitle">Professional title</Label>
          <Input
            id="professionalTitle"
            name="professionalTitle"
            required
            defaultValue={profile?.professional_title ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="heroHeadline">Hero headline</Label>
          <Input
            id="heroHeadline"
            name="heroHeadline"
            required
            defaultValue={profile?.hero_headline ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="heroDescription">Hero description</Label>
          <Textarea
            id="heroDescription"
            name="heroDescription"
            rows={3}
            required
            defaultValue={profile?.hero_description ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="shortBio">Short bio</Label>
          <Textarea
            id="shortBio"
            name="shortBio"
            rows={2}
            defaultValue={profile?.short_bio ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="longBio">Long bio (one paragraph per line)</Label>
          <Textarea
            id="longBio"
            name="longBio"
            rows={5}
            required
            defaultValue={arrayToLines(profile?.long_bio ?? [])}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required defaultValue={profile?.location ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={profile?.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availabilityStatus">Availability status</Label>
          <Select
            id="availabilityStatus"
            name="availabilityStatus"
            defaultValue={profile?.availability_status ?? "available"}
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availabilityLabel">Availability label</Label>
          <Input
            id="availabilityLabel"
            name="availabilityLabel"
            required
            defaultValue={profile?.availability_label ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedin_url ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" name="githubUrl" defaultValue={profile?.github_url ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="n8nProfileUrl">n8n profile URL</Label>
          <Input
            id="n8nProfileUrl"
            name="n8nProfileUrl"
            defaultValue={profile?.n8n_profile_url ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="credentialUrl">Credential URL</Label>
          <Input
            id="credentialUrl"
            name="credentialUrl"
            defaultValue={profile?.credential_url ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="cvUrl">CV URL / path</Label>
          <Input id="cvUrl" name="cvUrl" defaultValue={profile?.cv_url ?? ""} />
          <p className="text-xs text-on-surface-variant">
            Or upload a PDF under Media — it auto-links here.
          </p>
        </div>
      </div>

      <ImageUploadField
        name="portraitUrl"
        label="Profile picture"
        initialUrl={profile?.portrait_url}
        hint="Upload your portrait for the homepage hero. JPEG/PNG/WebP/GIF · max 5MB."
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

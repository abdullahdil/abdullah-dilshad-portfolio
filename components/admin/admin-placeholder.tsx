import { Card, CardBody } from "@/components/ui/card";

type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="font-heading text-headline-md text-on-surface">{title}</h2>
        <p className="text-body-md text-on-surface-variant">{description}</p>
      </CardBody>
    </Card>
  );
}

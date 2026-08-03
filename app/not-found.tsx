import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-surface py-16">
      <Container className="max-w-xl space-y-6">
        <p className="font-label uppercase text-primary">404</p>
        <h1 className="font-heading text-headline-lg text-on-surface">Page not found</h1>
        <p className="text-body-md text-on-surface-variant">
          The page you requested does not exist or is not published.
        </p>
        <Button href="/">Return home</Button>
      </Container>
    </main>
  );
}

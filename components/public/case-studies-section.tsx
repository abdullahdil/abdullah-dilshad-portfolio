import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  MessagesSquare,
  Network,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublishedCaseStudyCards } from "@/lib/repositories/case-studies";
import { cn } from "@/lib/utils";

const icons: LucideIcon[] = [Network, GitBranch, MessagesSquare];

export async function CaseStudiesSection() {
  const cards = await getPublishedCaseStudyCards();

  return (
    <Section id="work">
      <Container>
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:mb-16 md:flex-row">
          <div className="space-y-2">
            <h2 className="font-heading text-headline-lg text-on-surface">
              Project Portfolio
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Architected solutions for modern operations.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-outline/30 p-3 text-on-surface-variant">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </span>
            <span className="rounded-full bg-primary p-3 text-on-primary">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {cards.map((study, index) => {
            const Icon = icons[index] ?? Network;
            const isLarge = index === 0 || index === 2;

            return (
              <Link
                key={study.slug}
                href={`/work/${study.slug}`}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-low p-1 transition-colors",
                  isLarge ? "md:col-span-8" : "md:col-span-4",
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-lg",
                    isLarge ? "aspect-[16/9]" : "aspect-square",
                  )}
                >
                  {study.featuredImageUrl ? (
                    <Image
                      src={study.featuredImageUrl}
                      alt={study.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 bg-surface-highest"
                        aria-hidden
                      />
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 2px 2px, rgba(255,140,55,0.45) 1px, transparent 0)",
                          backgroundSize: "20px 20px",
                        }}
                        aria-hidden
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon
                          className="h-12 w-12 text-primary/50 transition-transform duration-700 group-hover:scale-110"
                          aria-hidden
                        />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

                  {isLarge ? (
                    <div className="absolute bottom-0 left-0 space-y-2 p-6 md:p-8">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {study.tools.slice(0, 2).map((tool) => (
                          <Badge key={tool} tone="primary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-heading text-headline-md text-on-surface">
                        {study.title}
                      </h3>
                      <p className="max-w-md text-body-md text-on-surface-variant">
                        {study.summary}
                      </p>
                    </div>
                  ) : null}
                </div>

                {!isLarge ? (
                  <div className="space-y-2 p-4">
                    <p className="font-heading text-sm font-bold uppercase tracking-widest text-primary">
                      {study.tools[0] ?? "Automation"}
                    </p>
                    <h3 className="font-heading text-xl text-on-surface">
                      {study.title}
                    </h3>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

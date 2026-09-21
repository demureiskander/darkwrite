import { ArrowUpRightFromSquare, Code2, Heart, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { selectClientInfo } from "@/features/client/store/client-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";

function AboutLink(props: {
  children: React.ReactNode;
  href: string;
  featured?: boolean;
}) {
  return (
    <a
      href={props.href}
      target="_blank"
      className={cn(
        "group flex items-center justify-between rounded-xl border border-border/50 bg-view-2 px-4 py-3 text-foreground transition-colors hover:bg-secondary/60",
        props.featured && "sm:col-span-2",
      )}
      rel="noopener"
    >
      <span className="flex items-center gap-3">{props.children}</span>
      <ArrowUpRightFromSquare
        className="text-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        size={17}
      />
    </a>
  );
}

export default function About() {
  const data = useAppSelector(selectClientInfo);
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full justify-center overflow-y-auto px-6 py-8">
      <div className="flex w-full max-w-120 flex-col items-center text-center">
        <img
          alt="Darkwrite Logo"
          src="darkwrite_icon.png"
          className="size-20 rounded-[1.35rem] drop-shadow-xl"
        />
        <div className="mt-4 flex items-center gap-2">
          <h1 className="text-3xl font-semibold">Darkwrite</h1>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-sm text-foreground/70">
            {data?.isPackaged
              ? `v${data.version}`
              : t("settings.about.developmentBuild")}
          </span>
        </div>
        <p className="mt-1 text-sm text-foreground/70">
          {t("settings.about.forkDescription")}
        </p>
        <div className="mt-8 grid w-full gap-2 text-left sm:grid-cols-2">
          <AboutLink
            featured
            href="https://github.com/demureiskander/darkwrite"
          >
            <Code2 size={18} />
            {t("settings.about.sourceCode")}
          </AboutLink>
          <AboutLink href="https://github.com/astudentinearth/darkwrite">
            <Code2 size={18} />
            {t("settings.about.upstreamProject")}
          </AboutLink>
          <AboutLink href="https://github.com/demureiskander/darkwrite/blob/dev/LICENSE">
            <Scale size={18} />
            {t("settings.about.license")}
          </AboutLink>
        </div>
        <a
          href="https://web.tribute.tg/d/GLT"
          target="_blank"
          rel="noopener"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
        >
          <Heart size={18} fill="currentColor" />
          {t("settings.about.supportProject")}
          <ArrowUpRightFromSquare size={16} />
        </a>
      </div>
    </div>
  );
}

import { IconHome } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { navigateToFolder } from "../navigation/navigator";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";

export function SidebarNavigation() {
  const { t } = useTranslation(undefined, { keyPrefix: "sidebar.button" });
  const route = useLocation();
  const isHome =
    route.pathname === "/" &&
    new URLSearchParams(route.search).get("folder") === "root";
  return (
    <div className="flex flex-col gap-0.5">
      <SidebarItem
        onClick={() => navigateToFolder(null)}
        className={cn(isHome && "bg-secondary/20")}
      >
        <IconHome size={18} />
        <span>{t("home")}</span>
      </SidebarItem>
    </div>
  );
}

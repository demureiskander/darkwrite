import { IconTrashOff } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { useAppDispatch } from "@/features/store/hooks";
import { ClearTrashDialogPortal } from "../store/notes-ui-actions";

export function ClearTrashButton({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      onClick={() => {
        ClearTrashDialogPortal(dispatch).showClearTrashDialog();
      }}
      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <IconTrashOff className="size-4" />
      {t("sidebar.trash.empty")}
    </Button>
  );
}

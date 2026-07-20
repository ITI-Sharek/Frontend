import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import {
  useAdminContributorFieldsQuery,
  useCreateContributorFieldMutation,
  useUpdateContributorFieldMutation,
} from "../api/queries/use-admin-contributor-fields-query";

const INPUT_CLASS_NAME =
  "min-h-11 w-full rounded-input border border-border bg-input-bg px-3 text-sm text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary";

export function AdminContributorFieldsPanel() {
  const fields = useAdminContributorFieldsQuery();
  const createField = useCreateContributorFieldMutation();
  const updateField = useUpdateContributorFieldMutation();
  const [key, setKey] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [labelEn, setLabelEn] = useState("");

  const error = fields.error ?? createField.error ?? updateField.error;

  return (
    <section
      aria-labelledby="contributor-fields-heading"
      className="mt-6 overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="border-b border-border p-5 md:p-6">
        <h2 id="contributor-fields-heading" className="text-lg font-bold text-foreground">
          مجالات المساهمين
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          تظهر المجالات النشطة كخيارات موحدة في إعدادات المساهم. تعطيل مجال لا
          يحذفه ولا يمحو اختيارات سابقة.
        </p>
      </div>

      <form
        className="grid gap-4 border-b border-border p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!key.trim() || !labelAr.trim() || !labelEn.trim()) return;
          createField.mutate(
            { key: key.trim(), labelAr: labelAr.trim(), labelEn: labelEn.trim() },
            {
              onSuccess: () => {
                setKey("");
                setLabelAr("");
                setLabelEn("");
              },
            },
          );
        }}
      >
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          المفتاح البرمجي
          <input
            dir="ltr"
            name="fieldKey"
            required
            maxLength={50}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="استخدم حروفاً إنجليزية صغيرة وأرقاماً وشرطات فقط"
            placeholder="web-development"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            className={INPUT_CLASS_NAME}
          />
          <span className="text-xs font-normal text-muted-foreground">
            حروف صغيرة وأرقام وشرطات فقط
          </span>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          الاسم العربي
          <input
            name="labelAr"
            required
            maxLength={100}
            placeholder="تطوير الويب"
            value={labelAr}
            onChange={(event) => setLabelAr(event.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          الاسم الإنجليزي
          <input
            dir="ltr"
            name="labelEn"
            required
            maxLength={100}
            placeholder="Web development"
            value={labelEn}
            onChange={(event) => setLabelEn(event.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
        <Button type="submit" disabled={createField.isPending}>
          {createField.isPending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {createField.isPending ? "جارٍ الإضافة…" : "إضافة مجال"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="border-b border-border px-5 py-4 text-sm text-destructive md:px-6">
          {getApiErrorMessage(error, "تعذر تحديث المجالات.")}
        </p>
      )}

      <div className="divide-y divide-border">
        {fields.isPending ? (
          <p role="status" aria-live="polite" className="p-6 text-sm text-muted-foreground">
            جارٍ تحميل المجالات…
          </p>
        ) : fields.data?.length ? (
          fields.data.map((field) => (
            <div
              key={field.id}
              className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center md:px-6"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{field.labelAr}</p>
                <p
                  dir="ltr"
                  className="mt-1 truncate text-left font-mono text-xs text-muted-foreground"
                >
                  {field.labelEn} · {field.key}
                </p>
              </div>
              <label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
                ترتيب الظهور
                <input
                  aria-label={`ترتيب ${field.labelAr}`}
                  type="number"
                  min={0}
                  max={10000}
                  defaultValue={field.sortOrder}
                  disabled={updateField.isPending}
                  className="h-10 w-24 rounded-input border border-border bg-input-bg px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onBlur={(event) => {
                    const sortOrder = Number(event.target.value);
                    if (
                      Number.isInteger(sortOrder) &&
                      sortOrder >= 0 &&
                      sortOrder <= 10000 &&
                      sortOrder !== field.sortOrder
                    ) {
                      updateField.mutate({ fieldId: field.id, payload: { sortOrder } });
                    }
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={field.active}
                disabled={updateField.isPending}
                onClick={() =>
                  updateField.mutate({
                    fieldId: field.id,
                    payload: { active: !field.active },
                  })
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-input border border-border px-3 text-sm font-semibold text-foreground hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {field.active && <Check className="size-4 text-primary" aria-hidden="true" />}
                {field.active ? "نشط" : "غير نشط"}
              </button>
            </div>
          ))
        ) : fields.isError ? null : (
          <div className="p-6">
            <p className="font-semibold text-foreground">لا توجد مجالات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أضف أول مجال من النموذج أعلاه ليصبح متاحاً في إعدادات المساهم.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

# Share-k — Controlled Arabic Glossary (DEC-014)

> Binding for frontend UI, backend messages, notifications, and documentation. One Arabic term per concept, everywhere. UI renders **one language at a time** (DEC-008); bilingual copy only in approved brand moments.

## Approved terms

| English | Arabic | Notes |
|---|---|---|
| Contributor | مساهم | |
| Project Owner | صاحب المشروع | |
| Contribution Request | طلب مساهمة | the task/order entity |
| Application | طلب انضمام | |
| Fit Assessment | تقييم الملاءمة | advisory, never the final selection decision |
| Strong Fit | ملاءمة قوية | |
| Partial Fit | ملاءمة جزئية | |
| Limited Fit | ملاءمة محدودة | |
| Unknown Fit | ملاءمة غير معروفة | insufficient information to assess |
| Unavailable Fit | تقييم الملاءمة غير متاح | service or evidence unavailable |
| Pending Owner Decision | بانتظار قرار صاحب المشروع | owner retains the final selection decision |
| Verified Skill | مهارة موثقة | |
| Skill Profile | الملف المهاري | |
| Skill Evidence | دليل المهارة | |
| Delivery (the action) | تسليم العمل | |
| Submitted Work (the artifact) | العمل المُسلَّم | |
| Pull Request | طلب سحب (Pull Request) | keep the English term in parentheses |
| Assigned | تم إسناده | |
| Not Selected | لم يتم الاختيار | never rendered as رفض |
| Reputation | السمعة المهنية | |
| Success Rate | معدل النجاح | |
| Skill Gap | فجوة مهارية | |
| Dispute | اعتراض | |
| Report | بلاغ | |
| Invitation | دعوة للتقديم | |
| Matching | المطابقة | |
| Contribution Completed | مساهمة مكتملة | |

## Translation rules

1. Technical product names stay untranslated (Share-k, GitHub, Pull Request as noted).
2. Technology names never translate (React, Docker, JWT…) and stay LTR inside RTL text.
3. When an Arabic translation may be unclear, append the English technical term in parentheses.
4. `تسليم العمل` = the act of delivering; `العمل المُسلَّم` = the delivered artifact — never interchange.
5. The same Arabic term is used on every screen, notification, and message for a given concept — no synonyms.
6. New terms are added here **before** they ship; additions go through the decision log if they name a product concept.
7. `مؤهل` / `غير مؤهل` are retired for contributor task fit. Use the five advisory fit terms above and state that the owner decides.

## Extended state labels (drafts consistent with the glossary — from `state-model.md` v2)

Rejected by owner = رفض من صاحب المشروع · Expired = منتهي الصلاحية · Withdrawn = تم السحب · Changes requested = مطلوب تعديلات · Resubmitted = أُعيد التسليم · Approved = معتمد · Draft = مسودة · Published/Open = متاح للتقديم · Completed = مكتمل · Cancelled = ملغى · In review = قيد المراجعة · Suspended = موقوف.
These extended labels follow rule 5 and await the same native-speaker pass as the rest of UI copy.

import type {
  ContributionRequestDraftPayload,
  ContributionRequestDto,
  ContributionRequestFormErrors,
  ContributionRequestFormState,
  ContributionRequestLocale,
} from "../types/contribution-request.types";

const COPY = {
  ar: {
    title: "يجب أن يكون العنوان بين 3 و255 حرفًا.",
    description: "يجب أن يكون الوصف بين 10 و5000 حرف.",
    requiredCount: "أضف متطلبًا مطلوبًا واحدًا على الأقل، وبحد أقصى 20.",
    preferredCount: "يمكن إضافة 20 متطلبًا مفضلًا كحد أقصى.",
    requirementLength: "يجب أن يكون كل متطلب بين حرفين و500 حرف.",
    duplicate: "لا يمكن تكرار المتطلب أو وضعه كمطلوب ومفضل معًا.",
    tags: "يمكن إضافة 20 تقنية كحد أقصى، من 1 إلى 50 حرفًا لكل تقنية.",
    closeRequired: "حدد وقت إغلاق التقديم.",
    closeFuture: "يجب أن يكون وقت إغلاق التقديم في المستقبل.",
    targetOrder: "يجب أن يكون تاريخ الإنجاز المستهدف بعد وقت إغلاق التقديم.",
    reward: "أدخل مكافأة من 0.01 إلى 99,999,999.99 وبحد أقصى منزلتين عشريتين.",
    rewardPair: "أدخل قيمة المكافأة وعملتها معًا، أو اتركهما معًا فارغين.",
    currency: "استخدم رمز عملة من ثلاثة أحرف مثل USD.",
  },
  en: {
    title: "Title must contain 3 to 255 characters.",
    description: "Description must contain 10 to 5000 characters.",
    requiredCount: "Add between 1 and 20 Required Requirements.",
    preferredCount: "Add no more than 20 Preferred Requirements.",
    requirementLength: "Each Requirement must contain 2 to 500 characters.",
    duplicate: "A Requirement cannot be duplicated or be both Required and Preferred.",
    tags: "Add no more than 20 tags, each containing 1 to 50 characters.",
    closeRequired: "Choose an Applications Close Time.",
    closeFuture: "Applications Close Time must be in the future.",
    targetOrder: "Target Completion Date must be after Applications Close Time.",
    reward: "Reward must be 0.01 to 99,999,999.99 with at most two decimal places.",
    rewardPair: "Provide reward amount and currency together, or leave both empty.",
    currency: "Use a three-letter currency code such as USD.",
  },
} as const;

export function createEmptyContributionRequestForm(): ContributionRequestFormState {
  return {
    title: "",
    description: "",
    requiredRequirements: [""],
    preferredRequirements: [],
    technologyTags: [],
    applicationsCloseTime: "",
    targetCompletionDate: "",
    difficulty: "",
    reward: "",
    rewardCurrency: "",
  };
}

export function toContributionRequestForm(
  request: ContributionRequestDto,
): ContributionRequestFormState {
  return {
    title: request.title,
    description: request.description,
    requiredRequirements: [...request.requiredRequirements]
      .sort((left, right) => left.position - right.position)
      .map((requirement) => requirement.text),
    preferredRequirements: [...request.preferredRequirements]
      .sort((left, right) => left.position - right.position)
      .map((requirement) => requirement.text),
    technologyTags: request.technologyTags,
    applicationsCloseTime: request.applicationsCloseTime
      ? toLocalDateTimeInput(request.applicationsCloseTime)
      : "",
    targetCompletionDate: request.targetCompletionDate ?? "",
    difficulty: request.difficulty ?? "",
    reward: request.reward ?? "",
    rewardCurrency: request.rewardCurrency ?? "",
  };
}

export function validateContributionRequestForm(
  form: ContributionRequestFormState,
  locale: ContributionRequestLocale = "ar",
  now: Date = new Date(),
): ContributionRequestFormErrors {
  const copy = COPY[locale];
  const errors: ContributionRequestFormErrors = {};
  const title = form.title.trim();
  const description = form.description.trim();
  const required = form.requiredRequirements.map((value) => value.trim());
  const preferred = form.preferredRequirements.map((value) => value.trim());

  if (title.length < 3 || title.length > 255) errors.title = copy.title;
  if (description.length < 10 || description.length > 5000) {
    errors.description = copy.description;
  }
  if (required.length < 1 || required.length > 20) {
    errors.requiredRequirements = copy.requiredCount;
  } else if (required.some((value) => value.length < 2 || value.length > 500)) {
    errors.requiredRequirements = copy.requirementLength;
  }
  if (preferred.length > 20) {
    errors.preferredRequirements = copy.preferredCount;
  } else if (preferred.some((value) => value.length < 2 || value.length > 500)) {
    errors.preferredRequirements = copy.requirementLength;
  }

  const allRequirementKeys = [...required, ...preferred].map(normalizeKey);
  if (new Set(allRequirementKeys).size !== allRequirementKeys.length) {
    errors.requiredRequirements = copy.duplicate;
    errors.preferredRequirements = copy.duplicate;
  }

  if (
    form.technologyTags.length > 20 ||
    form.technologyTags.some((tag) => {
      const length = tag.trim().length;
      return length < 1 || length > 50;
    })
  ) {
    errors.technologyTags = copy.tags;
  }

  const closeTime = new Date(form.applicationsCloseTime);
  if (form.applicationsCloseTime === "" || Number.isNaN(closeTime.getTime())) {
    errors.applicationsCloseTime = copy.closeRequired;
  } else if (closeTime.getTime() <= now.getTime()) {
    errors.applicationsCloseTime = copy.closeFuture;
  }

  if (form.targetCompletionDate !== "" && !errors.applicationsCloseTime) {
    const target = new Date(`${form.targetCompletionDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(form.targetCompletionDate) ||
      Number.isNaN(target.getTime()) ||
      target.toISOString().slice(0, 10) !== form.targetCompletionDate ||
      target.getTime() <= closeTime.getTime()
    ) {
      errors.targetCompletionDate = copy.targetOrder;
    }
  }

  const reward = form.reward.trim();
  const currency = form.rewardCurrency.trim();
  if ((reward === "") !== (currency === "")) {
    errors.reward = copy.rewardPair;
    errors.rewardCurrency = copy.rewardPair;
  } else if (reward !== "") {
    const amount = Number(reward);
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(reward) ||
      !Number.isFinite(amount) ||
      amount < 0.01 ||
      amount > 99_999_999.99
    ) {
      errors.reward = copy.reward;
    }
    if (!/^[A-Za-z]{3}$/.test(currency)) {
      errors.rewardCurrency = copy.currency;
    }
  }

  return errors;
}

export function toContributionRequestPayload(
  form: ContributionRequestFormState,
): ContributionRequestDraftPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    requiredRequirements: form.requiredRequirements.map((text) => ({
      text: text.trim(),
    })),
    preferredRequirements: form.preferredRequirements.map((text) => ({
      text: text.trim(),
    })),
    technologyTags: uniqueCaseInsensitive(
      form.technologyTags.map((tag) => tag.trim()),
    ),
    applicationsCloseTime: new Date(form.applicationsCloseTime).toISOString(),
    targetCompletionDate: form.targetCompletionDate || null,
    difficulty: form.difficulty || null,
    reward: form.reward.trim() === "" ? null : Number(form.reward),
    rewardCurrency:
      form.rewardCurrency.trim() === ""
        ? null
        : form.rewardCurrency.trim().toUpperCase(),
  };
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeKey(value: string): string {
  return value.toLocaleLowerCase();
}

function uniqueCaseInsensitive(values: string[]): string[] {
  return values.filter(
    (value, index) =>
      values.findIndex((candidate) => normalizeKey(candidate) === normalizeKey(value)) ===
      index,
  );
}

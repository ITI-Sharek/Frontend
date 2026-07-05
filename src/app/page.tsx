import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes.config";

export default function RootPage() {
  redirect(ROUTES.login);
}

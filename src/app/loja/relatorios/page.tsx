import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";

const RelatoriosPage = async () => {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "CASHIER")
  ) {
    redirect("/");
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios Administrativos</h1>
      <ReportFilters />
      <ReportTable />
    </div>
  );
};

export default RelatoriosPage;

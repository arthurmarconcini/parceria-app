import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GestorClient from "./components/GestorClient";

const GestorPage = async () => {
  const session = await auth();

  if (!session || !session.user || session.user.role === "CLIENT") {
    return redirect("/");
  }

  return <GestorClient />;
};

export default GestorPage;

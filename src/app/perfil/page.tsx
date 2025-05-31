import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await auth();

  if (!session || !session.user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl font-bold">Olá, {session.user?.name}</h1>

          <p>Seu papel é: {session.user?.role}</p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

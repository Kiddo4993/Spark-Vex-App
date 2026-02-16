import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/KanbanBoard";

export default async function TasksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/dashboard/tasks");
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="page-title">Task Board</h1>
                <p className="page-subtitle">Manage your team&apos;s build season tasks.</p>
            </div>
            <KanbanBoard />
        </div>
    );
}

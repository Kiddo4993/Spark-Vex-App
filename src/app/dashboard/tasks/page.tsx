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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Task Board</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage your team&apos;s build season tasks
                    </p>
                </div>
            </div>
            <KanbanBoard />
        </div>
    );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { User, useAuthStore, api } from "@/store/authStore";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/lib/types";


export const Route = createFileRoute("/dashboard/users/access")({
  component: AccessControlPage,
});




interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

type ModalState =
  | { type: "create" }
  | { type: "edit"; user: User }
  | { type: "delete"; user: User }
  | null;


const ROLE_HIERARCHY: Record<string, number> = {
  student:0,
  admin: 1,
  super_admin: 2,
};

const ROLE_VARIANT: Record<Role, "secondary" | "outline" | "default"> = {
  student: "secondary",
  admin: "outline",
  super_admin: "default",
};

// Roles each actor can assign when creating/editing
const CREATABLE_ROLES: Record<string, Role[]> = {
  admin: ["student"],
  super_admin: ["student", "admin", "super_admin"],
};

const DEFAULT_FORM: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "student",
};


function formatRole(role: string) {
  return role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function canActOn(currentRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[currentRole] ?? -1) > (ROLE_HIERARCHY[targetRole] ?? -1);
}


function StatsCards({ users }: { users: User[] }) {
  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length },
    { label: "Super Admins", value: users.filter((u) => u.role === "super_admin").length },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTable({
  users,
  currentUser,
  onEdit,
  onDelete,
}: {
  users: User[];
  currentUser: User | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const isMe = user.id === currentUser?.id;
            const editable = currentUser && canActOn(currentUser.role, user.role);
            const deletable = isSuperAdmin && !isMe;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name}
                  {isMe && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role as Role] ?? "secondary"}>
                    {formatRole(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {editable && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                      Edit
                    </Button>
                  )}
                  {deletable && (
                    <Button variant="destructive" size="sm" onClick={() => onDelete(user)}>
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

function UserForm({
  initial,
  isEdit,
  currentUserRole,
  onSubmit,
  onCancel,
}: {
  initial: UserFormData;
  isEdit?: boolean;
  currentUserRole: string;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<UserFormData>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof UserFormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const availableRoles: Role[] = CREATABLE_ROLES[currentUserRole] ?? ["student"];

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setField("name")(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@company.com"
          value={form.email}
          onChange={(e) => setField("email")(e.target.value)}
        />
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => setField("password")(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={form.role} onValueChange={setField("role")}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {formatRole(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AccessControlPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | Role>("all");
  const [modal, setModal] = useState<ModalState>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (form: UserFormData) => {
    await api.post("/users", form);
    await fetchUsers();
    setModal(null);
  };

  const handleEdit = async (form: UserFormData) => {
    if (modal?.type !== "edit") return;
    const { user } = modal;
    const payload: Partial<UserFormData> = {};
    if (form.name !== user.name) payload.name = form.name;
    if (form.email !== user.email) payload.email = form.email;
    if (form.role !== user.role) payload.role = form.role;
    if (form.password) payload.password = form.password;
    await api.patch(`/users/${user.id}`, payload);
    await fetchUsers();
    setModal(null);
  };

  const handleDelete = async () => {
    if (modal?.type !== "delete") return;
    await api.delete(`/users/${modal.user.id}`);
    await fetchUsers();
    setModal(null);
  };

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setModal({ type: "create" })}>New User</Button>
      </div>

      {/* Stats */}
      {!loading && <StatsCards users={users} />}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={filterRole}
          onValueChange={(v) => setFilterRole(v as typeof filterRole)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              Loading users…
            </p>
          ) : (
            <UsersTable
              users={filtered}
              currentUser={currentUser}
              onEdit={(user) => setModal({ type: "edit", user })}
              onDelete={(user) => setModal({ type: "delete", user })}
            />
          )}
        </CardContent>
      </Card>

      {!loading && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* Create dialog */}
      <Dialog open={modal?.type === "create"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm
            initial={DEFAULT_FORM}
            currentUserRole={currentUser?.role ?? "admin"}
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={modal?.type === "edit"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {modal?.type === "edit" && (
            <UserForm
              isEdit
              initial={{
                name: modal.user.name,
                email: modal.user.email,
                password: "",
                role: modal.user.role as Role,
              }}
              currentUserRole={currentUser?.role ?? "admin"}
              onSubmit={handleEdit}
              onCancel={() => setModal(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={modal?.type === "delete"}
        onOpenChange={() => setModal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {modal?.type === "delete" ? modal.user.name : ""}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
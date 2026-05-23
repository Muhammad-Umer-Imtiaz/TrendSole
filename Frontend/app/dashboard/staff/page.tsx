"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, staffApi } from "@/lib/api";
import { formatDate, toSentenceCase } from "@/lib/format";
import type { PaginationMeta, StaffMember, UserRole } from "@/lib/types";

const roleOptions: UserRole[] = ["manager", "sales_staff", "customer", "admin"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("manager");
  const deferredSearch = useDeferredValue(searchTerm);

  const loadStaff = async (targetPage = page, targetSearch = deferredSearch) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.listPaginated({
        page: targetPage,
        limit: 10,
        search: targetSearch,
      });
      setStaff(response.items);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await staffApi.listPaginated({
          page,
          limit: 10,
          search: deferredSearch,
        });

        if (!isMounted) {
          return;
        }

        setStaff(response.items);
        setPagination(response.pagination);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(apiErrorMessage(requestError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialStaff();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, page]);

  const openRoleModal = (member: StaffMember) => {
    setEditingMember(member);
    setSelectedRole(member.role);
    setSuccessMessage(null);
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setEditingMember(null);
    setSelectedRole("manager");
  };

  const handleRoleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingMember) {
      return;
    }

    setSavingRole(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await staffApi.updateRole(editingMember.id, selectedRole);
      closeRoleModal();
      await loadStaff();
      setSuccessMessage("Role updated successfully.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSavingRole(false);
    }
  };

  const columns: TableColumn<StaffMember>[] = [
    {
      key: "member",
      header: "Team member",
      render: (member) => (
        <div>
          <p className="font-semibold text-slate-950">{member.name}</p>
          <p className="mt-1 text-xs text-slate-500">{member.email}</p>
          {member.phone ? (
            <p className="mt-1 text-xs text-slate-400">{member.phone}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (member) => (
        <span className="font-medium text-slate-700">
          {toSentenceCase(member.role)}
        </span>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (member) => (
        <span className="text-slate-600">{member.permissions.length} assigned</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <StatusBadge status={member.isActive === false ? "inactive" : "active"} />
      ),
    },
    {
      key: "last-active",
      header: "Last active",
      render: (member) =>
        member.lastActive ? formatDate(member.lastActive) : "No activity data",
    },
    {
      key: "manage",
      header: "Manage",
      render: (member) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openRoleModal(member)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
          >
            <FiEdit2 />
            Edit role
          </button>
          <Link
            href={`/dashboard/staff/permissions?userId=${member.id}`}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
          >
            Edit permissions
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requireAdmin requiredPermissions={["staff:manage"]}>
      <div className="space-y-6">
        <Card
          title="Staff management"
          description="Manage manager and sales staff roles, then adjust permission scope when responsibilities change."
          action={
            <Link
              href="/dashboard/staff/permissions"
              className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Open permission editor
            </Link>
          }
        >
          <div className="mb-5">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or role"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <Table
            data={staff}
            columns={columns}
            keyExtractor={(member) => member.id}
            isLoading={loading}
            pagination={pagination}
            paginationLabel="staff members"
            onPageChange={setPage}
            emptyMessage={
              searchTerm.trim()
                ? "No staff members match your search."
                : "No manager or sales staff accounts are available yet."
            }
          />
        </Card>

        <Modal
          open={roleModalOpen}
          onClose={closeRoleModal}
          title="Update team role"
          description="Changing the role also resets this user's permissions to the default set for that role."
        >
          <form className="space-y-5" onSubmit={handleRoleUpdate}>
            {editingMember ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">
                  {editingMember.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {editingMember.email}
                </p>
              </div>
            ) : null}

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Role</span>
              <select
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(event.target.value as UserRole)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {toSentenceCase(role)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRoleModal}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editingMember || savingRole}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {savingRole ? "Saving..." : "Update role"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}

"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import { apiErrorMessage, permissionsApi, staffApi } from "@/lib/api";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import type { Permission, PermissionGroup, StaffMember } from "@/lib/types";

function StaffPermissionsPageContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [permissionGroups, setPermissionGroups] =
    useState<PermissionGroup[]>(PERMISSION_GROUPS);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId ?? "");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const [response, permissionCatalog] = await Promise.all([
          staffApi.list(),
          permissionsApi.getCatalog(),
        ]);
        setStaff(response);
        if (permissionCatalog.groups.length > 0) {
          setPermissionGroups(permissionCatalog.groups);
        }

        const chosenUser =
          response.find((member) => member.id === initialUserId) ?? response[0];

        if (chosenUser) {
          setSelectedUserId(chosenUser.id);
          setSelectedPermissions(chosenUser.permissions);
        }
      } catch (requestError) {
        setError(apiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadStaff();
  }, [initialUserId]);

  const selectedUser = useMemo(
    () => staff.find((member) => member.id === selectedUserId) ?? null,
    [staff, selectedUserId]
  );

  const configuredPermissions = useMemo(
    () =>
      permissionGroups.flatMap((group) =>
        group.permissions.map((permission) => permission.key)
      ),
    [permissionGroups]
  );
  const additionalPermissions = selectedPermissions.filter(
    (permission) => !configuredPermissions.includes(permission)
  );

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await staffApi.updatePermissions(selectedUser.id, selectedPermissions);
      setStaff((current) =>
        current.map((member) =>
          member.id === selectedUser.id
            ? {
                ...member,
                permissions: selectedPermissions,
              }
            : member
        )
      );
      setSuccessMessage("Permissions updated successfully.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard requireAdmin requiredPermissions={["staff:manage"]}>
      <div className="space-y-6">
        <Card
          title="Permission management"
          description="Assign permission scopes to managers and sales staff using the RBAC model returned by your backend."
        >
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select staff member</label>
            <select
              value={selectedUserId}
              onChange={(event) => {
                const nextUserId = event.target.value;
                const nextUser =
                  staff.find((member) => member.id === nextUserId) ?? null;

                setSelectedUserId(nextUserId);
                setSelectedPermissions(nextUser?.permissions ?? []);
              }}
              disabled={loading || staff.length === 0}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
            >
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.role}
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-950">{selectedUser.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedUser.email} · {selectedUser.role}
              </p>
            </div>
          )}
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          {permissionGroups.map((group) => (
            <Card
              key={group.key}
              title={group.label}
              description={group.description}
            >
              <div className="space-y-4">
                {group.permissions.map((permission) => {
                  const checked = selectedPermissions.includes(permission.key);

                  return (
                    <label
                      key={permission.key}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-slate-950"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(permission.key)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{permission.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {permission.description}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                          {permission.key}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {additionalPermissions.length > 0 && (
          <Card
            title="Additional permissions"
            description="Permissions already assigned by the backend that are not listed in the default dashboard catalog."
          >
            <div className="flex flex-wrap gap-3">
              {additionalPermissions.map((permission) => (
                <label
                  key={permission}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {permission}
                </label>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedUser || saving}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving permissions..." : "Save permissions"}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function StaffPermissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-black/8 bg-white px-8 py-6 text-sm text-slate-500">
          Loading permission editor...
        </div>
      }
    >
      <StaffPermissionsPageContent />
    </Suspense>
  );
}

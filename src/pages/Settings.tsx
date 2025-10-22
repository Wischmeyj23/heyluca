import { useState } from "react";
import { Download, Trash2, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    toast.info(`Export feature coming soon (${format})`);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="p-4 bg-surface rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span className="text-text font-medium">{user?.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <div className="p-4 bg-surface rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-text-muted" />
                  ) : (
                    <Sun className="w-5 h-5 text-text-muted" />
                  )}
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-text-muted">
                      {theme === "dark" ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleToggleTheme}
                />
              </div>
            </div>
          </section>

          {/* Data Export */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Data</h2>
            <div className="p-4 bg-surface rounded-lg space-y-2">
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="w-full justify-start gap-2"
              >
                <Download className="w-4 h-4" />
                Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="w-full justify-start gap-2"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <div className="p-4 bg-surface rounded-lg border border-destructive/30">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and all associated data including contacts, notes, and recordings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Account deletion requested (simulated)");
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

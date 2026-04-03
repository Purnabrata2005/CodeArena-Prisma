import { Avatar, Dropdown, Label } from "@heroui/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  MonitorIcon,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { authUser: user, logout } = useAuthStore();
  const navigate = useNavigate();
  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "U";

  return (
    <Dropdown>
      <Dropdown.Trigger
        className={cn("flex-none cursor-pointer rounded-full", className)}
      >
        <Avatar className="h-10 w-10" color="default" variant="soft">
          <Avatar.Image src={user?.avatarUrl} alt={user?.name ?? "User"} />
          <Avatar.Fallback delayMs={600}>
            {user?.name ? initials : <UserIcon className="size-5" />}
          </Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="rounded-xl">
        {user ? (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <Avatar size="sm" color="default" variant="soft">
                <Avatar.Image src={user.avatarUrl} alt={user.name ?? "User"} />
                <Avatar.Fallback delayMs={600}>{initials}</Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col gap-0">
                <p className="text-sm leading-5 font-medium">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email ?? "No email"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <Dropdown.Menu aria-label="User menu">
          {user ? (
            <Dropdown.Item id="dashboard" onAction={() => navigate("/")}>
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Dashboard</Label>
                <LayoutDashboardIcon className="size-3.5 text-muted-foreground" />
              </div>
            </Dropdown.Item>
          ) : null}

          {user ? (
            <Dropdown.Item
              id="profile"
              onAction={() => navigate(`/profile/${user.id}`)}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Profile</Label>
                <UserIcon className="size-3.5 text-muted-foreground" />
              </div>
            </Dropdown.Item>
          ) : (
            <Dropdown.Item id="login" onAction={() => navigate("/login")}>
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Login</Label>
                <MonitorIcon className="size-3.5 text-muted-foreground" />
              </div>
            </Dropdown.Item>
          )}
          {user ? (
            <Dropdown.Item
              id="logout"
              variant="danger"
              onAction={async () => {
                await logout();
                navigate("/login");
              }}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Log Out</Label>
                <LogOutIcon className="size-3.5 text-danger" />
              </div>
            </Dropdown.Item>
          ) : null}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

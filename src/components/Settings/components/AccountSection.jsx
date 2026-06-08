import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { SettingCard } from "../SettingsTemplates";

export function AccountSection({ profile, activeTheme }) {
  return (
    <SettingCard icon={faUser} title="Account" activeTheme={activeTheme}>
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Username
          </p>
          <p className="font-semibold text-sm">
            {profile?.username ?? "Not set"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Email
          </p>
          <p className="font-semibold text-sm">{profile?.email ?? "Not set"}</p>
        </div>
        <Link
          to="account"
          style={{ textDecoration: "none" }}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${activeTheme.button.accent2}`}
        >
          Manage account
        </Link>
      </div>
    </SettingCard>
  );
}
